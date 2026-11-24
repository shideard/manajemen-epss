<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Berkas bukti tertaut ke satu atau lebih indikator kegiatannya; verifikator hanya melihat berkas indikator yang diajukan
        Schema::create('dokumen_bukti_indikator', function (Blueprint $table) {
            $table->foreignUuid('dokumen_id')
                ->constrained('dokumen_bukti')
                ->cascadeOnDelete();
            $table->foreignUuid('indikator_id')
                ->constrained('indikator_epss')
                ->cascadeOnDelete();

            $table->primary(['dokumen_id', 'indikator_id']);
        });

        // Berkas yang diunggah untuk satu output yang ditargetkan; output dihapus → berkas tetap ada sebagai berkas umum
        Schema::table('dokumen_bukti', function (Blueprint $table) {
            $table->foreignUuid('output_id')
                ->nullable()
                ->after('kegiatan_id')
                ->constrained('rencana_kegiatan_output')
                ->nullOnDelete();
        });

        // Berkas lama berlaku untuk semua indikator kegiatannya, supaya ajuan yang berjalan tidak kehilangan berkas
        DB::statement('
            INSERT INTO dokumen_bukti_indikator (dokumen_id, indikator_id)
            SELECT d.id, ki.indikator_id
            FROM dokumen_bukti d
            JOIN kegiatan_indikator ki ON ki.kegiatan_id = d.kegiatan_id
        ');
    }

    public function down(): void
    {
        Schema::table('dokumen_bukti', function (Blueprint $table) {
            $table->dropConstrainedForeignId('output_id');
        });
        Schema::dropIfExists('dokumen_bukti_indikator');
    }
};
