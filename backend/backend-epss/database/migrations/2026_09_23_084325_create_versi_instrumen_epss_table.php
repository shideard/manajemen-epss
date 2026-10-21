<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('versi_instrumen_epss', function(Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama');
            $table->string('versi')->unique();
            $table->date('berlaku_mulai');
            $table->date('berlaku_sampai')->nullable();
            $table->enum('status', ['ACTIVE', 'ARCHIVED']);
            $table->timestamps();
        });

        DB::statement(
            'ALTER TABLE versi_instrumen_epss
            ADD CONSTRAINT versi_instrumen_epss_tanggal_check
            CHECK (
                berlaku_sampai IS NULL
                OR berlaku_sampai >= berlaku_mulai
            )'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('versi_instrumen_epss');
    }
};
