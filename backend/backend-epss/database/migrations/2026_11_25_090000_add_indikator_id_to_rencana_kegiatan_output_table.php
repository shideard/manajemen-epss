<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Output ditargetkan per indikator tertaut; null = output lama atau indikatornya sudah dilepas
        Schema::table('rencana_kegiatan_output', function (Blueprint $table) {
            $table->foreignUuid('indikator_id')
                ->nullable()
                ->after('kegiatan_id')
                ->constrained('indikator_epss')
                ->nullOnDelete();

            $table->index(['kegiatan_id', 'indikator_id']);
        });
    }

    public function down(): void
    {
        Schema::table('rencana_kegiatan_output', function (Blueprint $table) {
            $table->dropIndex(['kegiatan_id', 'indikator_id']);
            $table->dropConstrainedForeignId('indikator_id');
        });
    }
};
