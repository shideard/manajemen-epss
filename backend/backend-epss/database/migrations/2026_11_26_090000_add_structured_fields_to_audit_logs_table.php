<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('event_type')->nullable()->index();
            $table->string('object_type')->nullable();
            $table->string('object_id')->nullable();
            $table->string('outcome', 20)->nullable()->index();
            $table->json('context')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn(['event_type', 'object_type', 'object_id', 'outcome', 'context']);
        });
    }
};
