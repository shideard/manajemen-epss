<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Berkas contoh dari verifikator; contoh_nama tanpa storage key = hanya nama (data lama)
        Schema::table('rencana_kegiatan_output', function (Blueprint $table) {
            $table->string('contoh_storage_key')->nullable()->after('contoh_nama');
            $table->string('contoh_mime_type')->nullable()->after('contoh_storage_key');
            $table->unsignedBigInteger('contoh_size_bytes')->nullable()->after('contoh_mime_type');
        });
    }

    public function down(): void
    {
        Schema::table('rencana_kegiatan_output', function (Blueprint $table) {
            $table->dropColumn(['contoh_storage_key', 'contoh_mime_type', 'contoh_size_bytes']);
        });
    }
};
