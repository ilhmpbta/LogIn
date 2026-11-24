<?php

namespace App\DataObjects;

class IncidentTriggeredDataDTO
{
    public function __construct(
        public string $incident_id,
        public string $title,
        public string $severity,
        public string $status,
        public string $target_server,
        public string $attacker_ip,
        public string $triggered_rule_id,
        public int $log_count_in_window,
        public string $first_seen,
        public string $last_seen,
        public array $logs_summary,
    ) {}

    public function toArray(): array
    {
        return [
            'incident_id' => $this->incident_id,
            'title' => $this->title,
            'severity' => $this->severity,
            'status' => $this->status,
            'target_server' => $this->target_server,
            'attacker_ip' => $this->attacker_ip,
            'triggered_rule_id' => $this->triggered_rule_id,
            'log_count_in_window' => $this->log_count_in_window,
            'first_seen' => $this->first_seen,
            'last_seen' => $this->last_seen,
            'logs_summary' => $this->logs_summary,
        ];
    }
}
