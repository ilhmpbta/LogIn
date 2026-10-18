<?php

namespace App\Services\Agent\Tools;

use Prism\Prism\Tool;

class CheckFirewallRulesTool extends Tool
{
    public function __construct()
    {
        $this->as('check_firewall_rules')
            ->for('Check whether a given IP is already blocked in the firewall.')
            ->withStringParameter('ip', 'IPv4 or IPv6 address to check.')
            ->using(function (string $ip): string {
                // Replace after Role 4 ship BannedIp model
                return (string) json_encode([
                    'ip' => $ip,
                    'is_blocked' => false,
                    'existing_rule' => null,
                ]);
            });
    }
}
