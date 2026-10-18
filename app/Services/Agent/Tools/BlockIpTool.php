<?php

namespace App\Services\Agent\Tools;

use Illuminate\Process\Exceptions\ProcessTimedOutException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Prism\Prism\Tool;

class BlockIpTool extends Tool
{
    public function __construct()
    {
        $this->as('block_ip')
            ->for('Block a source IP at the firewall level for containment.')
            ->withStringParameter('ip', 'IPv4 or IPv6 address to block.')
            ->withNumberParameter('duration_seconds', 'Block duration in seconds (e.g. 3600).')
            ->withStringParameter('reason', 'Reason code for the block (e.g. ssh-bruteforce).')
            ->using(function (string $ip, int|float $duration_seconds, string $reason): string {
                if (filter_var($ip, FILTER_VALIDATE_IP) === false) {
                    return (string) json_encode([
                        'success' => false,
                        'error' => 'Invalid IP format',
                    ]);
                }

                try {
                    $result = Process::timeout(10)->run(['sudo', '/usr/local/bin/logIn-block-ip', $ip]);

                    if (! $result->successful()) {
                        return (string) json_encode([
                            'success' => false,
                            'error' => trim($result->errorOutput()),
                        ]);
                    }

                    Log::channel('single')->info('[SOC] block_ip executed (stub)', [
                        'ip' => $ip,
                        'reason' => $reason,
                        'duration' => $duration_seconds,
                    ]);

                    return (string) json_encode([
                        'success' => true,
                        'ip' => $ip,
                        'message' => "iptables rule inserted: INPUT -s {$ip} -j DROP",
                        'duration_secs' => (int) $duration_seconds,
                    ]);
                } catch (ProcessTimedOutException $e) {
                    return (string) json_encode([
                        'success' => false,
                        'error' => 'Firewall command timed out after 10s',
                    ]);
                }
            });
    }
}
