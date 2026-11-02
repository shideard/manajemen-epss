<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indikator_epss', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('aspek_id')
                ->constrained('aspek_epss')
                ->restrictOnDelete();

            $table->string('kode');
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->decimal('bobot', 7, 4);
            $table->timestamps();

            $table->unique(
                ['aspek_id', 'kode'],
                'indikator_epss_aspek_kode_unique'
            );
        });

        DB::statement(
            'ALTER TABLE indikator_epss
             ADD CONSTRAINT indikator_epss_bobot_check
             CHECK (bobot >= 0 AND bobot <= 100)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('indikator_epss');
    }
};