<?php

namespace Database\Seeders;

use App\Enums\StatusVersiInstrumen;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoVersiInstrumenSeeder extends Seeder
{
    public function run(): void
    {
        if (!app()->environment('local')) {
            throw new RuntimeException(
                'Seeder demo hanya boleh dijalankan pada environment local.'
            );
        }

        $versi = VersiInstrumenEPSS::firstOrCreate(
            [
                'versi' => 'DEMO-MVP-2025',
            ],
            [
                'nama' => 'Instrumen Demo MVP — Bukan Pedoman Resmi',
                'berlaku_mulai' => '2025-01-01',
                'berlaku_sampai' => null,
                'status' => StatusVersiInstrumen::ACTIVE,
            ]
        );

        $this->command?->info(
            'Versi demo tersedia: ' . $versi->versi
        );
    }
}