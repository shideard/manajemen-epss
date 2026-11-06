<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('periode_evaluasi', function (Blueprint $table) {
            $table->decimal('target_ips', 4, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('periode_evaluasi', function (Blueprint $table) {
            $table->dropColumn('target_ips');
        });
    }
};
