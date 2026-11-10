<?php

namespace Database\Seeders;

use App\Models\IndikatorEPSS;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

// Kriteria, kriteria pemenuhan, dan persyaratan bukti bawaan untuk level 1-5 setiap indikator yang belum punya.
// Aman dijalankan berulang: level yang sudah ada (mis. diisi dari instrumen resmi) tidak disentuh.
// Isinya sama dengan DEFAULT_LEVELS di frontend/src/lib/epss.js
class KriteriaLevelBawaanSeeder extends Seeder
{
    private const LEVELS = [
        1 => [
            'nama' => 'Rintisan',
            'kriteria' => 'Kegiatan statistik sudah dilakukan namun belum memiliki standar dan masih bergantung pada individu.',
            'pemenuhan' => ['Belum ada penetapan penanggung jawab kegiatan', 'Pelaksanaan belum terdokumentasi'],
            'syarat' => ['Daftar kebutuhan data OPD', 'Dokumentasi pelaksanaan kegiatan'],
        ],
        2 => [
            'nama' => 'Terkelola',
            'kriteria' => 'Kegiatan dilakukan oleh setiap produsen data sesuai standarnya masing-masing.',
            'pemenuhan' => ['Seluruh produsen belum menerapkan standar yang sama; atau', 'Baru sebagian produsen data yang telah menerapkan standar'],
            'syarat' => ['SK Tim Pelaksana / Penetapan Penanggung Jawab Lapangan', 'Laporan pelaksanaan kegiatan'],
        ],
        3 => [
            'nama' => 'Terstandarisasi',
            'kriteria' => 'Kegiatan dilakukan dengan standar yang ditetapkan dan diterapkan oleh seluruh produsen data.',
            'pemenuhan' => ['Seluruh produsen data menerapkan standar yang ditetapkan'],
            'syarat' => ['SOP / pedoman pelaksanaan yang ditetapkan', 'Bukti penerapan standar pada seluruh produsen data', 'Daftar hadir sosialisasi standar', 'Laporan akhir kegiatan'],
        ],
        4 => [
            'nama' => 'Terpadu',
            'kriteria' => 'Kegiatan terpadu antar produsen data dan dipantau secara berkala.',
            'pemenuhan' => ['Terdapat forum/koordinasi antar produsen data', 'Pemantauan dilakukan secara berkala'],
            'syarat' => ['Notulen forum koordinasi antar produsen data', 'Laporan pemantauan berkala'],
        ],
        5 => [
            'nama' => 'Optimum',
            'kriteria' => 'Kegiatan dievaluasi dan diperbaiki secara berkelanjutan.',
            'pemenuhan' => ['Hasil evaluasi ditindaklanjuti dengan perbaikan'],
            'syarat' => ['Laporan evaluasi', 'Bukti tindak lanjut perbaikan'],
        ],
    ];

    public function run(): void
    {
        IndikatorEPSS::query()->with('kriteriaLevels:id,indikator_id,level')->each(function (IndikatorEPSS $indikator): void {
            $sudahAda = $indikator->kriteriaLevels->pluck('level')->all();

            DB::transaction(function () use ($indikator, $sudahAda): void {
                foreach (self::LEVELS as $level => $isi) {
                    if (in_array($level, $sudahAda, true)) {
                        continue;
                    }

                    $kriteria = $indikator->kriteriaLevels()->create([
                        'level' => $level,
                        'nama_level' => $isi['nama'],
                        'deskripsi' => $isi['kriteria'],
                    ]);

                    foreach ($isi['pemenuhan'] as $urutan => $deskripsi) {
                        $kriteria->kriteriaPemenuhan()->create(['urutan' => $urutan + 1, 'deskripsi' => $deskripsi]);
                    }

                    foreach ($isi['syarat'] as $urutan => $deskripsi) {
                        $kriteria->persyaratanBukti()->create(['urutan' => $urutan + 1, 'deskripsi' => $deskripsi]);
                    }
                }
            });
        });
    }
}
