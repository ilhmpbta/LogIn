<?php

namespace Tests\Unit\Agent;

use App\DataObjects\AgentStepDTO;
use Tests\TestCase;

class AgentStepDTOTest extends TestCase
{
    public function test_to_array_matches_typescript_interface(): void
    {
        $dto = new AgentStepDTO(
            incident_id: 'inc-20261017-001',
            step: 1,
            thought: 'Investigating the incident.',
            tool_called: 'query_auth_logs',
            tool_parameters: ['source_ip' => '1.2.3.4', 'since' => '5m'],
            tool_result: '{"failed_attempts":5}',
            current_status: 'ANALYZING',
        );

        $array = $dto->toArray();

        $this->assertArrayHasKey('incident_id', $array);
        $this->assertArrayHasKey('step', $array);
        $this->assertArrayHasKey('thought', $array);
        $this->assertArrayHasKey('tool_called', $array);
        $this->assertArrayHasKey('tool_parameters', $array);
        $this->assertArrayHasKey('tool_result', $array);
        $this->assertArrayHasKey('current_status', $array);
        $this->assertCount(7, $array);
        $this->assertSame([
            'incident_id',
            'step',
            'thought',
            'tool_called',
            'tool_parameters',
            'tool_result',
            'current_status',
        ], array_keys($array));
    }

    public function test_nullable_fields_can_be_null(): void
    {
        $dto = new AgentStepDTO(
            incident_id: 'inc-1',
            step: 1,
            thought: 'Pure reasoning step.',
            tool_called: null,
            tool_parameters: null,
            tool_result: null,
            current_status: 'ANALYZING',
        );

        $array = $dto->toArray();

        $this->assertNull($array['tool_called']);
        $this->assertNull($array['tool_parameters']);
        $this->assertNull($array['tool_result']);
    }

    public function test_default_values(): void
    {
        $dto = new AgentStepDTO('inc-1', 1, 'thought');

        $this->assertNull($dto->tool_called);
        $this->assertNull($dto->tool_parameters);
        $this->assertNull($dto->tool_result);
        $this->assertSame('ANALYZING', $dto->current_status);
    }
}
