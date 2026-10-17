<?php

namespace App\Services\Agent\Tools;

use Illuminate\Support\Facades\Log;
use Prism\Prism\Tool;

class NotifyOncallTool extends Tool
{
    public function __construct()
    {
        $this->as('notify_oncall')
            ->for('Dispatch a notification to the on-call SOC operator.')
            ->withStringParameter('severity', 'Incident severity: LOW, MEDIUM, HIGH, or CRITICAL.')
            ->withStringParameter('incident_id', 'The incident identifier, e.g. inc-20261017-001.')
            ->using(function (string $severity, string $incident_id): string {
                Log::channel('single')->info('[SOC] notify_oncall dispatched (stub)', [
                    'severity'    => $severity,
                    'incident_id' => $incident_id,
                ]);

                return json_encode([
                    'success'     => true,
                    'dispatched'  => true,
                    'channel'     => 'log',
                    'incident_id' => $incident_id,
                ]);
            });
    }
}