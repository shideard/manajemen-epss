<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kriteria_level', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('indikator_id')
                ->constrained('indikator_epss')
                ->restrictOnDelete();
            $table->smallInteger('level');
            $table->string('nama_level');
            $table->text('deskripsi');
            $table->timestamps();

            $table->unique(
                ['indikator_id', 'level'],
                'kriteria_level_indikator_level_unique'
            );
        });

        DB::statement(
            'ALTER TABLE kriteria_level
            ADD CONSTRAINT kriteria_level_level_range_check
            CHECK (level BETWEEN 1 AND 5)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('kriteria_level');
    }
};
