<?php

namespace Database\Seeders;

use App\Enums\StatusVersiInstrumen;
use App\Models\AspekEPSS;
use App\Models\DomainEPSS;
use App\Models\IndikatorEPSS;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoInstrumenEPSSSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local')) {
            throw new RuntimeException(
                'Seeder indikator dummy hanya boleh dijalankan pada environment local.'
            );
        }

        $versiAktif = VersiInstrumenEPSS::query()
            ->where('status', StatusVersiInstrumen::ACTIVE->value)
            ->get();

        if ($versiAktif->isEmpty()) {
            throw new RuntimeException(
                'Belum ada versi instrumen aktif. Buat atau aktifkan versi instrumen terlebih dahulu.'
            );
        }


        $domainData = [
            [
                'kode' => '1',
                'nama' => 'Prinsip Satu Data Indonesia (SDI)',
                'aspek' => [
                    [
                        'nama' => 'Standar Data Statistik',
                        'indikator' => [
                            ['kode' => '1', 'nama' => 'Penerapan Standar Data Statistik (SDS)', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Metadata Statistik',
                        'indikator' => [
                            ['kode' => '2', 'nama' => 'Penerapan Metadata Statistik', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Interoperabilitas Data',
                        'indikator' => [
                            ['kode' => '3', 'nama' => 'Penerapan Interoperabilitas Data', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Kode Referensi dan/atau Data Induk',
                        'indikator' => [
                            ['kode' => '4', 'nama' => 'Penerapan Kode Referensi', 'bobot' => 1.0],
                        ],
                    ],
                ],
            ],

            [
                'kode' => '2',
                'nama' => 'Kualitas Data',
                'aspek' => [
                    [
                        'nama' => 'Relevansi',
                        'indikator' => [
                            ['kode' => '5', 'nama' => 'Relevansi Data terhadap Pengguna', 'bobot' => 1.0],
                            ['kode' => '6', 'nama' => 'Proses Identifikasi Kebutuhan Data', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Akurasi',
                        'indikator' => [
                            ['kode' => '7', 'nama' => 'Penilaian Akurasi Data', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Aktualitas & Ketepatan Waktu',
                        'indikator' => [
                            ['kode' => '8', 'nama' => 'Penjaminan Aktualitas Data', 'bobot' => 1.0],
                            ['kode' => '9', 'nama' => 'Pemantauan Ketepatan Waktu Diseminasi', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Aksesibilitas',
                        'indikator' => [
                            ['kode' => '10', 'nama' => 'Ketersediaan Data untuk Pengguna Data', 'bobot' => 1.0],
                            ['kode' => '11', 'nama' => 'Akses Media Penyebarluasan Data', 'bobot' => 1.0],
                            ['kode' => '12', 'nama' => 'Penyediaan Format Data', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Keterbandingan & Konsistensi',
                        'indikator' => [
                            ['kode' => '13', 'nama' => 'Keterbandingan Data', 'bobot' => 1.0],
                            ['kode' => '14', 'nama' => 'Konsistensi Statistik', 'bobot' => 1.0],
                        ],
                    ],
                ],
            ],

            [
                'kode' => '3',
                'nama' => 'Proses Bisnis Statistik',
                'aspek' => [
                    [
                        'nama' => 'Perencanaan Data',
                        'indikator' => [
                            ['kode' => '15', 'nama' => 'Pendefinisian Kebutuhan Statistik', 'bobot' => 1.0],
                            ['kode' => '16', 'nama' => 'Desain Statistik', 'bobot' => 1.0],
                            ['kode' => '17', 'nama' => 'Penyiapan Instrumen', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Pengumpulan Data',
                        'indikator' => [
                            ['kode' => '18', 'nama' => 'Proses Pengumpulan Data / Akuisisi Data', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Pemeriksaan Data',
                        'indikator' => [
                            ['kode' => '19', 'nama' => 'Pengolahan Data', 'bobot' => 1.0],
                            ['kode' => '20', 'nama' => 'Analisis Data', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Penyebarluasan Data',
                        'indikator' => [
                            ['kode' => '21', 'nama' => 'Diseminasi Data', 'bobot' => 1.0],
                        ],
                    ],
                ],
            ],

            [
                'kode' => '4',
                'nama' => 'Kelembagaan',
                'aspek' => [
                    [
                        'nama' => 'Profesionalitas',
                        'indikator' => [
                            ['kode' => '22', 'nama' => 'Penjaminan Transparansi Informasi Statistik', 'bobot' => 1.0],
                            ['kode' => '23', 'nama' => 'Penjaminan Netralitas dan Objektivitas Penggunaan Sumber Data dan Metodologi', 'bobot' => 1.0],
                            ['kode' => '24', 'nama' => 'Penjaminan Kualitas Data', 'bobot' => 1.0],
                            ['kode' => '25', 'nama' => 'Penjaminan Kerahasiaan Data', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'SDM yang Memadai dan Kapabel',
                        'indikator' => [
                            ['kode' => '26', 'nama' => 'Penerapan Kompetensi SDM Bidang Statistik', 'bobot' => 1.0],
                            ['kode' => '27', 'nama' => 'Penerapan Kompetensi SDM Bidang Manajemen Data', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Pengorganisasian Statistik',
                        'indikator' => [
                            ['kode' => '28', 'nama' => 'Kolaborasi Penyelenggaraan Kegiatan Statistik', 'bobot' => 1.0],
                            ['kode' => '29', 'nama' => 'Penyelenggaraan Forum Satu Data Indonesia', 'bobot' => 1.0],
                            ['kode' => '30', 'nama' => 'Kolaborasi dengan Pembina Data Statistik', 'bobot' => 1.0],
                            ['kode' => '31', 'nama' => 'Pelaksanaan Tugas sebagai Walidata', 'bobot' => 1.0],
                        ],
                    ],
                ],
            ],

            [
                'kode' => '5',
                'nama' => 'Statistik Nasional',
                'aspek' => [
                    [
                        'nama' => 'Pemanfaatan Data Statistik',
                        'indikator' => [
                            ['kode' => '32', 'nama' => 'Penggunaan Data Statistik Dasar untuk Perencanaan, Monev, dan/atau Penyusunan Kebijakan', 'bobot' => 1.0],
                            ['kode' => '33', 'nama' => 'Penggunaan Data Statistik Sektoral untuk Perencanaan, Monev, dan/atau Penyusunan Kebijakan', 'bobot' => 1.0],
                            ['kode' => '34', 'nama' => 'Sosialisasi dan Literasi Data Statistik', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Pengelolaan Kegiatan Statistik',
                        'indikator' => [
                            ['kode' => '35', 'nama' => 'Pelaksanaan Rekomendasi Kegiatan Statistik', 'bobot' => 1.0],
                        ],
                    ],
                    [
                        'nama' => 'Penguatan SSN Berkelanjutan',
                        'indikator' => [
                            ['kode' => '36', 'nama' => 'Perencanaan Pembangunan Statistik', 'bobot' => 1.0],
                            ['kode' => '37', 'nama' => 'Penyebarluasan Data', 'bobot' => 1.0],
                            ['kode' => '38', 'nama' => 'Pemanfaatan Big Data', 'bobot' => 1.0],
                        ],
                    ],
                ],
            ],
        ];


        foreach ($versiAktif as $versi) {
            foreach ($domainData as $domainItem) {
                $bobotDomain = collect($domainItem['aspek'])
                    ->flatMap(fn (array $aspek) => $aspek['indikator'])
                    ->sum('bobot');

                $domain = DomainEPSS::firstOrCreate(
                    [
                        'versi_instrumen_id' => $versi->id,
                        'kode' => $domainItem['kode'],
                    ],
                    [
                        'nama' => $domainItem['nama'],
                        'bobot' => $bobotDomain,
                    ],
                );

                foreach ($domainItem['aspek'] as $index => $aspekItem) {
                    $bobotAspek = collect($aspekItem['indikator'])->sum('bobot');
                    $aspek = AspekEPSS::firstOrCreate(
                        [
                            'domain_id' => $domain->id,
                            'kode' => (string) ($index + 1),
                        ],
                        [
                            'nama' => $aspekItem['nama'],
                            'bobot' => $bobotAspek,
                        ],
                    );

                    foreach ($aspekItem['indikator'] as $indikatorItem) {
                        IndikatorEPSS::firstOrCreate(
                            [
                                'aspek_id' => $aspek->id,
                                'kode' => $indikatorItem['kode'],
                            ],
                            [
                                'nama' => $indikatorItem['nama'],
                                'deskripsi' => null,
                                'bobot' => $indikatorItem['bobot'],
                            ],
                        );
                    }
                }
            }
        }

        $this->command?->info(
            '38 indikator EPSS ditambahkan ke versi instrumen aktif.'
        );
    }
}
