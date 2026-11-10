<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Satu ajuan per pasangan kegiatan × indikator: checklist persyaratan,
        // status verifikasi, dan level yang ditetapkan verifikator.
        Schema::create('ajuan_bukti', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('kegiatan_id')
                ->constrained('rencana_kegiatan')
                ->restrictOnDelete();

            $table->foreignUuid('indikator_id')
                ->constrained('indikator_epss')
                ->restrictOnDelete();

            $table->string('status', 20)->default('DRAFT');

            // { "<level>": [bool, ...] } sesuai urutan persyaratan tiap level
            $table->json('checklist');

            $table->unsignedTinyInteger('level')->nullable();
            $table->text('catatan')->nullable();

            $table->foreignUuid('diajukan_oleh')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();
            $table->timestamp('diajukan_pada')->nullable();

            $table->foreignUuid('diverifikasi_oleh')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();
            $table->timestamp('diverifikasi_pada')->nullable();

            $table->timestamps();

            $table->unique(
                ['kegiatan_id', 'indikator_id'],
                'ajuan_bukti_pasangan_unique'
            );
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ajuan_bukti');
    }
};
