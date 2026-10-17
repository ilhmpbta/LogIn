<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentRun extends Model
{
    protected $fillable = [
        'incident_id', 'status', 'execution_steps',
        'final_response', 'provider', 'model', 'total_tokens',
    ];

    protected function casts(): array
    {
        return [
            'execution_steps' => 'array',
        ];
    }

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class, 'incident_id', 'incident_id');
    }
}