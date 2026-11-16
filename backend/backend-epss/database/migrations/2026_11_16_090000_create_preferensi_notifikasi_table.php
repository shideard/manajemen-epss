<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Satu baris per pengguna: pengaturan pengingat H-n dan notifikasi yang sudah dibaca
        Schema::create('preferensi_notifikasi', function (Blueprint $table) {
            $table->foreignUuid('user_id')
                ->primary()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->json('hari_pengingat');
            $table->json('dibaca');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferensi_notifikasi');
    }
};
