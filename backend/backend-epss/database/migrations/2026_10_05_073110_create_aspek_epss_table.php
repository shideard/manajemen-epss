<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aspek_epss', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('domain_id')
                ->constrained('domain_epss')
                ->restrictOnDelete();

            $table->string('kode');
            $table->string('nama');
            $table->decimal('bobot', 7, 4);
            $table->timestamps();

            $table->unique(
                ['domain_id','kode'], 
                'aspek_epss_domain_kode_unique');
        });

        DB::statement(
            'ALTER TABLE aspek_epss
            ADD CONSTRAINT aspek_epss_bobot_check 
            CHECK (bobot >= 0 AND bobot <= 100)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('aspek_epss');
    }
};
