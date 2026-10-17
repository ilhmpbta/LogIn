<?php

namespace Tests\Unit\Agent;

use App\DataObjects\AgentStepDTO;
use App\Events\AgentExecutionUpdated;
use Illuminate\Broadcasting\PrivateChannel;
use Tests\TestCase;

class AgentExecutionUpdatedTest extends TestCase
{
    public function test_broadcast_as_has_no_leading_dot(): void
    {
        $dto   = new AgentStepDTO('inc-1', 1, 'test');
        $event = new AgentExecutionUpdated($dto);

        $this->assertSame('AgentExecutionUpdated', $event->broadcastAs());
        $this->assertStringStartsWith('AgentExecutionUpdated', $event->broadcastAs());
        $this->assertStringStartsNotWith('.', $event->broadcastAs());
    }

    public function test_broadcast_on_is_private_channel(): void
    {
        $dto   = new AgentStepDTO('inc-20261017-001', 1, 'test');
        $event = new AgentExecutionUpdated($dto);

        $channel = $event->broadcastOn();

        $this->assertInstanceOf(PrivateChannel::class, $channel);
        $this->assertSame('private-incident.inc-20261017-001', $channel->name);
    }

    public function test_broadcast_with_returns_bare_payload(): void
    {
        $dto = new AgentStepDTO(
            incident_id:    'inc-1',
            step:           2,
            thought:        'Blocking IP.',
            tool_called:    'block_ip',
            tool_parameters: ['ip' => '1.2.3.4'],
            tool_result:    '{"success":true}',
            current_status: 'MITIGATING',
        );

        $event   = new AgentExecutionUpdated($dto);
        $payload = $event->broadcastWith();

        $this->assertArrayNotHasKey('data', $payload);
        $this->assertSame('inc-1', $payload['incident_id']);
        $this->assertSame('block_ip', $payload['tool_called']);
        $this->assertSame('MITIGATING', $payload['current_status']);
    }

    public function test_after_commit_property_is_true(): void
    {
        $event = new AgentExecutionUpdated(new AgentStepDTO('inc-1', 1, 'test'));

        $this->assertTrue($event->afterCommit);
    }
}