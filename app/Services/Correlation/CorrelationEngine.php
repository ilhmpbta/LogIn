<?php

namespace App\Services\Correlation;

use App\DataObjects\IncidentTriggeredDataDTO;
use App\Events\IncidentTriggered;
use App\Models\Incident;
use App\Jobs\AnalyzeIncidentJob;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Cache;

class CorrelationEngine
{
    public function evaluate(mixed $log): ?Incident
    {
        $payload = $this->payloadFrom($log);
        $eventType = (string) ($payload['event_type'] ?? '');
        $logType = (string) ($payload['log_type'] ?? '');
        $attackerIp = (string) ($payload['source_ip'] ?? '');
        $targetServer = (string) ($payload['source_server'] ?? '');

        if ($eventType === '' || $logType === '' || $attackerIp === '') {
            return null;
        }

        $rules = Schema::hasTable('rules')
            ? DB::table('rules')
                ->where('is_active', true)
                ->where('log_type', $logType)
                ->where('event_type', $eventType)
                ->get()
            : collect();

        foreach ($rules as $rule) {
            $threshold = (int) $rule->threshold;
            $windowSeconds = (int) $rule->window_seconds;

            if ($threshold <= 0 || $windowSeconds <= 0) {
                continue;
            }

            $now = $this->timestampFrom($payload);
            $windowStart = $now->subSeconds($windowSeconds);
            $windowLogs = $this->logsInWindow(
                $rule,
                $attackerIp,
                $windowStart,
                $now,
                $payload,
            );

            if (count($windowLogs) < $threshold) {
                continue;
            }

            if ($this->incidentAlreadyExists((string) $rule->rule_id, $attackerIp, $windowStart)) {
                continue;
            }

            $firstSeen = collect($windowLogs)->min('timestamp');
            $lastSeen = collect($windowLogs)->max('timestamp');
            $logsSummary = collect($windowLogs)
                ->pluck('raw_message')
                ->filter()
                ->unique()
                ->take(10)
                ->values()
                ->all();

            $incident = Incident::create([
                'title' => sprintf('%s on %s', $rule->name, $targetServer),
                'severity' => (string) $rule->severity,
                'status' => 'NEW',
                'target_server' => $targetServer,
                'attacker_ip' => $attackerIp,
                'triggered_rule_id' => (string) $rule->rule_id,
                'log_count_in_window' => count($windowLogs),
                'first_seen' => $this->isoTimestamp($firstSeen ?: $windowStart),
                'last_seen' => $this->isoTimestamp($lastSeen ?: $now),
                'logs_summary' => $logsSummary,
            ]);

            $incidentData = new IncidentTriggeredDataDTO(
                incident_id: $incident->incident_id,
                title: $incident->title,
                severity: $incident->severity,
                status: $incident->status,
                target_server: $incident->target_server,
                attacker_ip: $incident->attacker_ip,
                triggered_rule_id: $incident->triggered_rule_id,
                log_count_in_window: $incident->log_count_in_window,
                first_seen: $incident->first_seen,
                last_seen: $incident->last_seen,
                logs_summary: $incident->logs_summary,
            );

            event(new IncidentTriggered($incidentData));

            if (class_exists(AnalyzeIncidentJob::class)) {
                AnalyzeIncidentJob::dispatch($incident->incident_id)->onQueue('agents');
            }

            return $incident;
        }

        return null;
    }

    public function correlate(mixed $log): ?Incident
    {
        return $this->evaluate($log);
    }

    public function process(mixed $log): ?Incident
    {
        return $this->evaluate($log);
    }

    public function handle(mixed $log): ?Incident
    {
        return $this->evaluate($log);
    }

    private function payloadFrom(mixed $log): array
    {
        if (is_array($log)) {
            return $log;
        }

        if (is_object($log) && method_exists($log, 'toArray')) {
            return $log->toArray();
        }

        if (is_object($log)) {
            return get_object_vars($log);
        }

        return [];
    }

    private function timestampFrom(array $payload): CarbonImmutable
    {
        $timestamp = $payload['timestamp'] ?? null;

        if (is_string($timestamp) && $timestamp !== '') {
            try {
                return CarbonImmutable::parse($timestamp);
            } catch (\Throwable) {
                // Fall through to application time.
            }
        }

        return CarbonImmutable::now();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<int, array{timestamp: string, raw_message: string}>
     */
    private function logsInWindow(
        object $rule,
        string $attackerIp,
        CarbonImmutable $windowStart,
        CarbonImmutable $windowEnd,
        array $payload,
    ): array {
        $cacheKey = sprintf(
            'correlation:%s:%s',
            $rule->rule_id,
            str_replace([':', '.'], ['-', '-'], $attackerIp),
        );

        $cached = Cache::get($cacheKey, []);
        $cached = collect(is_array($cached) ? $cached : [])
            ->filter(fn (mixed $entry): bool => is_array($entry)
                && isset($entry['timestamp'])
                && CarbonImmutable::parse($entry['timestamp'])->gte($windowStart))
            ->values()
            ->all();

        $current = [
            'timestamp' => $this->isoTimestamp($windowEnd),
            'raw_message' => (string) ($payload['raw_message'] ?? ''),
        ];

        $duplicateCacheEntry = collect($cached)->contains(
            fn (array $entry): bool => $entry['timestamp'] === $current['timestamp']
                && $entry['raw_message'] === $current['raw_message'],
        );

        if (! $duplicateCacheEntry) {
            $cached[] = $current;
        }

        Cache::put($cacheKey, $cached, $windowEnd->addSeconds((int) $rule->window_seconds));

        $logs = $cached;

        if (Schema::hasTable('logs')) {
            $databaseLogs = DB::table('logs')
                ->where('source_ip', $attackerIp)
                ->where('log_type', $rule->log_type)
                ->where('event_type', $rule->event_type)
                ->where('timestamp', '>=', $windowStart->toIso8601String())
                ->orderBy('timestamp')
                ->get(['timestamp', 'raw_message'])
                ->map(fn (object $row): array => [
                    'timestamp' => (string) $row->timestamp,
                    'raw_message' => (string) ($row->raw_message ?? ''),
                ])
                ->all();

            if ($databaseLogs !== []) {
                $seen = [];
                $logs = [];

                foreach (array_merge($databaseLogs, $cached) as $entry) {
                    $key = $entry['timestamp'].'|'.$entry['raw_message'];
                    if (! isset($seen[$key])) {
                        $seen[$key] = true;
                        $logs[] = $entry;
                    }
                }
            }
        }

        return collect($logs)
            ->filter(fn (array $entry): bool => CarbonImmutable::parse($entry['timestamp'])->between(
                $windowStart,
                $windowEnd,
            ))
            ->values()
            ->all();
    }

    private function incidentAlreadyExists(string $ruleId, string $attackerIp, CarbonImmutable $windowStart): bool
    {
        if (! Schema::hasTable('incidents')) {
            $key = sprintf('correlation:incident:%s:%s', $ruleId, $attackerIp);
            if (Cache::has($key)) {
                return true;
            }
            Cache::put($key, true, $windowStart->addMinutes(5));

            return false;
        }

        return DB::table('incidents')
            ->where('triggered_rule_id', $ruleId)
            ->where('attacker_ip', $attackerIp)
            ->where('status', '!=', 'RESOLVED')
            ->where('status', '!=', 'FALSE_POSITIVE')
            ->where('last_seen', '>=', $windowStart->toIso8601String())
            ->exists();
    }

    private function isoTimestamp(mixed $timestamp): string
    {
        if ($timestamp instanceof CarbonImmutable) {
            return $timestamp->toIso8601String();
        }

        if (is_string($timestamp) && $timestamp !== '') {
            try {
                return CarbonImmutable::parse($timestamp)->toIso8601String();
            } catch (\Throwable) {
                return $timestamp;
            }
        }

        return CarbonImmutable::now()->toIso8601String();
    }
}
