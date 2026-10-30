<?php

namespace App\DataObjects;

class IncidentTriggeredDataDTO
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public string $incident_id,
    ) {}
}
