<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('domain_epss', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('versi_instrumen_id')
                ->constrained('versi_instrumen_epss')
                ->restrictOnDelete();

            $table->string('kode');
            $table->string('nama');
            $table->decimal('bobot', 7, 4);
            $table->timestamps();

            $table->unique(
                ['versi_instrumen_id', 'kode'],
                'domain_epss_versi_kode_unique'
            );
        });

        DB::statement(
            'ALTER TABLE domain_epss
            ADD CONSTRAINT domain_epss_bobot_check 
            CHECK (bobot >= 0 AND bobot <= 100)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('domain_epss');
    }
};
