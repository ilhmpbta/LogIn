<?php

namespace App\DataObjects;

class AgentStepDTO
{
    public function __construct(
        public string $incident_id,
        public int $step,
        public string $thought,
        public ?string $tool_called = null,
        public ?array $tool_parameters = null,
        public ?string $tool_result = null,
        public string $current_status = 'ANALYZING',
    ) {}

    public function toArray(): array
    {
        return [
            'incident_id'       => $this->incident_id,
            'step'              => $this->step,
            'thought'           => $this->thought,
            'tool_called'       => $this->tool_called,
            'tool_parameters'   => $this->tool_parameters,
            'tool_result'       => $this->tool_result,
            'current_status'    => $this->current_status,
        ];
    }
}