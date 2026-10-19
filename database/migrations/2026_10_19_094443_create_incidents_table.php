<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            // $table->id();
            $table->string('incident_id', 16)->primary();
            $table->string('title', 100);
            $table->enum('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
            $table->enum('status', ['NEW', 'ANALYZING', 'MITIGATING', 'RESOLVED', 'FALSE_POSITIVE']);
            $table->string('target_server', 100);
            $table->string('attacker_ip', 45);
            $table->string('triggered_rule_id', 16);
            $table->integer('log_count_in_window');
            $table->string('first_seen', 19);
            $table->string('last_seen', 19);
            $table->json('logs_summary');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
