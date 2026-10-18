<?php

namespace App\Services\Agent\Tools;

use Prism\Prism\Tool;

class QueryAuthLogsTool extends Tool
{
    public function __construct()
    {
        $this->as('query_auth_logs')
            ->for('Query authentication logs for a specific source IP within a time window.')
            ->withStringParameter('source_ip', 'IPv4 or IPv6 source IP address.')
            ->withStringParameter('since', 'Time window, e.g. "5m", "1h".')
            ->using(function (string $source_ip, string $since): string {
                //  Replace after Role 3 ship log model
                return (string) json_encode([
                    'source_ip' => $source_ip,
                    'window' => $since,
                    'failed_attempts' => 5,
                    'successful_logins' => 0,
                    'attempted_user' => 'root',
                ]);
            });
    }
}
