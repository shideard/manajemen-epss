<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kriteria_pemenuhan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('kriteria_level_id')
                ->constrained('kriteria_level')
                ->restrictOnDelete();
            $table->smallInteger('urutan');
            $table->text('deskripsi');
            $table->timestamps();

            $table->unique(
                ['kriteria_level_id', 'urutan'],
                'kriteria_pemenuhan_level_urutan_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kriteria_pemenuhan');
    }
};
