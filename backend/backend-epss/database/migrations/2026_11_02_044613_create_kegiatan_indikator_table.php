<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kegiatan_indikator', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('kegiatan_id')
                ->constrained('rencana_kegiatan')
                ->restrictOnDelete();

            $table->foreignUuid('indikator_id')
                ->constrained('indikator_epss')
                ->restrictOnDelete();

            $table->foreignUuid('created_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamps();

            $table->unique(
                ['kegiatan_id', 'indikator_id'],
                'kegiatan_indikator_pasangan_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kegiatan_indikator');
    }
};