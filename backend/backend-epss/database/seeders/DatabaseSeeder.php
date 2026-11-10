<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            OpdSeeder::class,
            // Butuh indikator di database; tidak berbuat apa-apa jika instrumen belum diisi
            KriteriaLevelBawaanSeeder::class,
        ]);

        // Factory butuh paket dev (Faker), jadi akun uji hanya untuk environment local
        if (app()->environment('local')) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }
    }
}
