<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('periode_evaluasi', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('versi_instrumen_id')
                ->constrained('versi_instrumen_epss')
                ->restrictOnDelete();

            $table->string('nama_periode');
            $table->integer('tahun_mulai');
            $table->integer('tahun_selesai');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');

            $table->enum('status', [
                'DRAFT',
                'AKTIF',
                'TERKUNCI',
            ])->default('DRAFT');

            $table->foreignUuid('closed_by')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestampTz('closed_at')->nullable();
            $table->timestamps();
        });

        DB::statement(
            'ALTER TABLE periode_evaluasi
             ADD CONSTRAINT periode_evaluasi_tahun_check
             CHECK (tahun_selesai >= tahun_mulai)'
        );

        DB::statement(
            'ALTER TABLE periode_evaluasi
             ADD CONSTRAINT periode_evaluasi_tanggal_check
             CHECK (tanggal_selesai >= tanggal_mulai)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('periode_evaluasi');
    }
};
