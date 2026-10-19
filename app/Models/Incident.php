<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    protected $primaryKey = 'incident_id';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $casts = [
        'logs_summary' => 'array',
    ];

    // format: "inc-YYYYMMDD-NNN" (e.g. inc-20261017-001)
    // FIXME: This implementation does not handle concurrent insertions correctly (race condition).
    protected static function booted(): void
    {
        static::creating(function (Incident $incident) {
            $date = now()->format('Ymd');

            $lastIncident = static::where('incident_id', 'like', "inc-{$date}-%")
                ->orderBy('incident_id', 'desc')
                ->first();

            $sequence = $lastIncident ? (int) substr($lastIncident->incident_id, -3) + 1 : 1;

            $incident->incident_id = sprintf('inc-%s-%03d', $date, $sequence);
        });
    }
}
