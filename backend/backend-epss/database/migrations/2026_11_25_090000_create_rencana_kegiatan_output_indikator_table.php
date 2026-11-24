<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Satu output yang ditargetkan bisa berlaku untuk beberapa indikator tertaut;
        // tanpa baris = output lama atau semua indikatornya sudah dilepas
        Schema::create('rencana_kegiatan_output_indikator', function (Blueprint $table) {
            $table->foreignUuid('output_id')
                ->constrained('rencana_kegiatan_output')
                ->cascadeOnDelete();
            $table->foreignUuid('indikator_id')
                ->constrained('indikator_epss')
                ->cascadeOnDelete();

            $table->primary(['output_id', 'indikator_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rencana_kegiatan_output_indikator');
    }
};
