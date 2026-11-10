<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Output bukti dukung yang ditargetkan verifikator untuk satu kegiatan, opsional dengan berkas contoh
    public function up(): void
    {
        Schema::create('output_bukti', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('kegiatan_id')
                ->constrained('rencana_kegiatan')
                ->cascadeOnDelete();

            $table->string('judul');
            $table->string('jenis', 30)->nullable();

            $table->string('contoh_nama')->nullable();
            $table->string('contoh_storage_key')->nullable();
            $table->string('contoh_mime_type')->nullable();
            $table->unsignedBigInteger('contoh_size_bytes')->nullable();

            $table->foreignUuid('created_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('output_bukti');
    }
};
