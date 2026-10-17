<?php

namespace Tests\Unit\Agent;

use App\Services\Agent\Tools\BlockIpTool;
use App\Services\Agent\Tools\CheckFirewallRulesTool;
use App\Services\Agent\Tools\NotifyOncallTool;
use App\Services\Agent\Tools\QueryAuthLogsTool;
use Tests\TestCase;

class ToolsTest extends TestCase
{
    /**
     * §4a: Tool names MUST match frontend expectation verbatim.
     */
    public function test_all_tools_have_canonical_names(): void
    {
        $tools = [
            new QueryAuthLogsTool(),
            new CheckFirewallRulesTool(),
            new BlockIpTool(),
            new NotifyOncallTool(),
        ];

        $names = array_map(fn ($t) => $t->name(), $tools);

        $this->assertSame([
            'query_auth_logs',
            'check_firewall_rules',
            'block_ip',
            'notify_oncall',
        ], $names);
    }

    public function test_query_auth_logs_tool_returns_json(): void
    {
        $tool = new QueryAuthLogsTool();
        $result = $tool->handle(source_ip: '1.2.3.4', since: '5m');

        $this->assertIsString($result);
        $this->assertJson($result);

        $decoded = json_decode($result, true);
        $this->assertSame('1.2.3.4', $decoded['source_ip']);
        $this->assertSame('5m', $decoded['window']);
        $this->assertSame(5, $decoded['failed_attempts']);
    }

    public function test_block_ip_tool_rejects_invalid_ip(): void
    {
        $tool = new BlockIpTool();

        $result = $tool->handle(
            ip: 'not-an-ip',
            duration_seconds: 3600,
            reason: 'test',
        );

        $this->assertIsString($result);
        $decoded = json_decode($result, true);

        $this->assertFalse($decoded['success']);
        $this->assertStringContainsString('Invalid', $decoded['error']);
    }

    public function test_notify_oncall_tool_returns_success(): void
    {
        $tool = new NotifyOncallTool();

        $result = $tool->handle(
            severity: 'CRITICAL',
            incident_id: 'inc-1',
        );

        $this->assertIsString($result);
        $decoded = json_decode($result, true);

        $this->assertTrue($decoded['success']);
        $this->assertSame('inc-1', $decoded['incident_id']);
    }
}