<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokumen_bukti', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('kegiatan_id')
                ->constrained('rencana_kegiatan')
                ->restrictOnDelete();

            $table->foreignUuid('uploaded_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignUuid('parent_document_id')->nullable();
            $table->unsignedSmallInteger('version_number');
            $table->boolean('is_current')->default(true);
            $table->date('evidence_date');
            $table->string('nama_file');
            $table->string('storage_key');
            $table->string('mime_type');
            $table->unsignedBigInteger('size_bytes');
            $table->char('sha256_hash', 64);
            $table->timestamps();

            $table->index(['kegiatan_id', 'is_current']);
        });

        Schema::table('dokumen_bukti', function (Blueprint $table) {
            $table->foreign('parent_document_id')
                ->references('id')
                ->on('dokumen_bukti')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen_bukti');
    }
};
