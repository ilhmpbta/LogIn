<?php

namespace App\Events;

use App\DataObjects\IncidentTriggeredDataDTO;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PublicChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IncidentTriggered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public IncidentTriggeredDataDTO $data
    ) {}

    public bool $afterCommit = true;

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PublicChannel('soc-incidents'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'IncidentTriggered';
    }

    public function broadcastWith(): array
    {
        return $this->data->toArray();
    }
}
