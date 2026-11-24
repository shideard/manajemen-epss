<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('actor_user_id')->nullable()->index();
            $table->string('actor_name')->nullable();
            $table->string('actor_username')->nullable();
            $table->string('actor_role')->nullable();
            $table->string('action');
            $table->string('method', 10);
            $table->string('route_name')->nullable();
            $table->string('route_uri');
            $table->json('target')->nullable();
            $table->unsignedSmallInteger('response_status')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestampTz('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
