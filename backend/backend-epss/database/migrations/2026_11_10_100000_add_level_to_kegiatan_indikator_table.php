<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Level indikator yang ditargetkan dipenuhi oleh kegiatan ini, ditetapkan verifikator
    public function up(): void
    {
        Schema::table('kegiatan_indikator', function (Blueprint $table) {
            $table->unsignedTinyInteger('level')->default(1);
        });
    }

    public function down(): void
    {
        Schema::table('kegiatan_indikator', function (Blueprint $table) {
            $table->dropColumn('level');
        });
    }
};
