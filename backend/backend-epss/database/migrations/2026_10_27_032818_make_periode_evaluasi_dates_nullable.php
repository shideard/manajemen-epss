<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('periode_evaluasi', function (Blueprint $table) {
            $table->date('tanggal_mulai')->nullable()->change();
            $table->date('tanggal_selesai')->nullable()->change();
        });
    }

    public function down(): void
    {
        $hasMissingDates = DB::table('periode_evaluasi')
            ->whereNull('tanggal_mulai')
            ->orWhereNull('tanggal_selesai')
            ->exists();

        if ($hasMissingDates) {
            throw new RuntimeException(
                'Rollback dihentikan: masih ada periode dengan tanggal kosong.'
            );
        }

        Schema::table('periode_evaluasi', function (Blueprint $table) {
            $table->date('tanggal_mulai')->nullable(false)->change();
            $table->date('tanggal_selesai')->nullable(false)->change();
        });
    }
};