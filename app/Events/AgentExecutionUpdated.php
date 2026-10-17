<?php

namespace App\Events;

use App\DataObjects\AgentStepDTO;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgentExecutionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public bool $afterCommit = true;

    public function __construct(
        public AgentStepDTO $payload,
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('incident.' . $this->payload->incident_id);
    }

    public function broadcastAs(): string
    {
        return 'AgentExecutionUpdated';
    }

    public function broadcastWith(): array
    {
        return $this->payload->toArray();
    }
}