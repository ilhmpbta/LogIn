<?php

namespace Database\Seeders;

use Illuminate\Supports\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RuleSeeder extends Seeder
{
    use WithoutModelEvents;
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('rules')->insert([
            [
                'rule_id' => 'RULE-SSH-01',
                'name' => 'Potential SSH Brute Force Attack',
                'severity' => 'HIGH',
                'event_type' => 'SSH_LOGIN_FAILED',
                'log_type' => 'auth_log',
                'threshold' => 5,
                'window_seconds' => 60,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'rule_id' => 'RULE-SQLI-04',
                'name' => 'Potential SQL Injection Attempt',
                'severity' => 'HIGH',
                'event_type' => 'SQLI_ATTEMPT',
                'log_type' => 'application_log',
                'threshold' => 4,
                'window_seconds' => 60,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
