<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rencana_kegiatan_output', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('kegiatan_id')
                ->constrained('rencana_kegiatan')
                ->cascadeOnDelete();

            $table->string('judul');
            $table->string('jenis')->nullable();
            $table->string('contoh_nama')->nullable();
            $table->unsignedSmallInteger('urutan')->default(0);

            $table->timestamps();

            $table->index(['kegiatan_id', 'urutan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rencana_kegiatan_output');
    }
};