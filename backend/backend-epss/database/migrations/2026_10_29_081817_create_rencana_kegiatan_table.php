<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rencana_kegiatan', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('periode_id')
                ->constrained('periode_evaluasi')
                ->restrictOnDelete();

            $table->foreignUuid('created_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignUuid('pic_user_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignUuid('opd_id')
                ->constrained('opds')
                ->restrictOnDelete();

            $table->string('nama_kegiatan');
            $table->text('deskripsi')->nullable();
            $table->integer('tahun_kegiatan');
            $table->date('tanggal_mulai_rencana');
            $table->date('tanggal_selesai_rencana');

            $table->unsignedSmallInteger('reminder_mulai_hari')->nullable();
            $table->unsignedSmallInteger('reminder_selesai_hari')->nullable();

            $table->timestamps();

            $table->index(['periode_id', 'tahun_kegiatan']);
            $table->index(['pic_user_id', 'tanggal_mulai_rencana']);
            $table->index('opd_id');
        });

        DB::statement(
            'ALTER TABLE rencana_kegiatan
             ADD CONSTRAINT rencana_kegiatan_tanggal_check
             CHECK (tanggal_selesai_rencana >= tanggal_mulai_rencana)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('rencana_kegiatan');
    }
};