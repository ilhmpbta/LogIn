<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_runs', function (Blueprint $table) {
            $table->id();
            $table->string('incident_id', 32);
            $table->foreign('incident_id')
                ->references('incident_id')
                ->on('incidents')
                ->cascadeOnDelete();

            $table->string('status', 32)->default('RUNNING');
            $table->json('execution_steps')->nullable();
            $table->text('final_response')->nullable();
            $table->string('provider', 32)->nullable();
            $table->string('model', 64)->nullable();
            $table->unsignedInteger('total_tokens')->nullable();
            $table->timestamps();

            $table->index('incident_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_runs');
    }
};