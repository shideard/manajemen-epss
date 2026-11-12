<?php

namespace Database\Seeders;

use App\Enums\StatusVersiInstrumen;
use App\Models\AspekEPSS;
use App\Models\DomainEPSS;
use App\Models\IndikatorEPSS;
use App\Models\KriteriaLevel;
use App\Models\PersyaratanBukti;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InstrumenEPSSBuktiDukungSeeder extends Seeder
{
    private const SOURCE_FILE = __DIR__ . '/data/indikator_epss_bukti_dukung.json';

    private const LEVEL_NAMES = [
        1 => 'Rintisan',
        2 => 'Terkelola',
        3 => 'Terstandarisasi',
        4 => 'Terpadu',
        5 => 'Optimum',
    ];

    public function run(): void
    {
        $data = json_decode(
            file_get_contents(self::SOURCE_FILE),
            true,
            512,
            JSON_THROW_ON_ERROR
        );
        $indikatorData = $data['indikators'] ?? [];
        $this->validasiData($indikatorData);

        $versiAktif = VersiInstrumenEPSS::query()
            ->where('status', StatusVersiInstrumen::ACTIVE->value)
            ->get();

        if ($versiAktif->isEmpty()) {
            throw new RuntimeException(
                'Tidak ada versi instrumen aktif untuk menerima data indikator EPSS.'
            );
        }

        foreach ($versiAktif as $versi) {
            DB::transaction(function () use ($versi, $indikatorData): void {
                $indikatorDemoLama = $this->merupakanDemoLama($versi);
                $domainData = collect($indikatorData)->groupBy('domain_kode');

                foreach ($domainData as $domainItems) {
                    $domainPertama = $domainItems->first();
                    $domain = DomainEPSS::query()->updateOrCreate(
                        [
                            'versi_instrumen_id' => $versi->id,
                            'kode' => $domainPertama['domain_kode'],
                        ],
                        [
                            'nama' => $domainPertama['domain'],
                            'bobot' => $domainPertama['bobot_domain'],
                        ]
                    );

                    foreach ($domainItems->groupBy('aspek_kode') as $aspekItems) {
                        $aspekPertama = $aspekItems->first();
                        $aspek = AspekEPSS::query()->updateOrCreate(
                            [
                                'domain_id' => $domain->id,
                                'kode' => $aspekPertama['aspek_kode'],
                            ],
                            [
                                'nama' => $aspekPertama['aspek'],
                                'bobot' => round(
                                    $aspekPertama['bobot_domain']
                                    * $aspekPertama['bobot_aspek']
                                    / 100,
                                    4
                                ),
                            ]
                        );

                        foreach ($aspekItems as $item) {
                            $indikator = IndikatorEPSS::query()
                                ->where('aspek_id', $aspek->id)
                                ->where('kode', $item['kode'])
                                ->first();

                            if (! $indikator && $indikatorDemoLama) {
                                $indikator = IndikatorEPSS::query()
                                    ->where('aspek_id', $aspek->id)
                                    ->where('kode', $item['legacy_code'])
                                    ->first();
                            }

                            $indikator ??= new IndikatorEPSS(['aspek_id' => $aspek->id]);

                            $indikator->fill([
                                'aspek_id' => $aspek->id,
                                'kode' => $item['kode'],
                                'nama' => $item['nama'],
                                'bobot' => $item['bobot_global'],
                            ]);
                            $indikator->save();

                            foreach ($item['levels'] as $levelData) {
                                $level = KriteriaLevel::query()->updateOrCreate(
                                    [
                                        'indikator_id' => $indikator->id,
                                        'level' => $levelData['level'],
                                    ],
                                    [
                                        'nama_level' => self::LEVEL_NAMES[$levelData['level']],
                                        'deskripsi' => $levelData['kriteria'],
                                    ]
                                );

                                $nomorChecklist = [];
                                foreach ($levelData['checklist'] as $index => $deskripsi) {
                                    $urutan = $index + 1;
                                    $nomorChecklist[] = $urutan;

                                    PersyaratanBukti::query()->updateOrCreate(
                                        [
                                            'kriteria_level_id' => $level->id,
                                            'urutan' => $urutan,
                                        ],
                                        ['deskripsi' => $deskripsi]
                                    );
                                }

                                PersyaratanBukti::query()
                                    ->where('kriteria_level_id', $level->id)
                                    ->whereNotIn('urutan', $nomorChecklist)
                                    ->delete();
                            }
                        }

                    }
                }
            });
        }

        $this->command?->info(
            'Data 38 indikator, kriteria level, dan checklist bukti dukung berhasil disiapkan untuk versi instrumen aktif.'
        );
    }

    /** @param array<int, array<string, mixed>> $indikatorData */
    private function validasiData(array $indikatorData): void
    {
        if (count($indikatorData) !== 38) {
            throw new RuntimeException('Sumber instrumen harus berisi tepat 38 indikator.');
        }

        $kodeIndikator = [];
        $bobotGlobal = 0.0;
        foreach ($indikatorData as $indikator) {
            if (in_array($indikator['kode'] ?? null, $kodeIndikator, true)) {
                throw new RuntimeException('Kode indikator pada sumber instrumen harus unik.');
            }
            $kodeIndikator[] = $indikator['kode'] ?? null;

            $expectedGlobalWeight = round(
                ($indikator['bobot_domain'] ?? 0)
                * ($indikator['bobot_aspek'] ?? 0)
                * ($indikator['bobot_indikator'] ?? 0)
                / 10000,
                4
            );

            if (
                ! isset($indikator['bobot_global'])
                || abs($indikator['bobot_global'] - $expectedGlobalWeight) > 0.0001
            ) {
                throw new RuntimeException(
                    "Bobot indikator {$indikator['kode']} tidak sesuai dengan bobot domain/aspek."
                );
            }
            $bobotGlobal += $indikator['bobot_global'];

            if (count($indikator['levels'] ?? []) !== 5) {
                throw new RuntimeException(
                    "Indikator {$indikator['kode']} harus memiliki kriteria untuk lima level."
                );
            }

            foreach ($indikator['levels'] as $index => $level) {
                if (
                    ($level['level'] ?? null) !== $index + 1
                    || empty($level['kriteria'])
                    || empty($level['checklist'])
                ) {
                    throw new RuntimeException(
                        "Kriteria/checklist indikator {$indikator['kode']} level " . ($index + 1) . ' tidak lengkap.'
                    );
                }
            }
        }

        $bobotDomain = 0.0;
        foreach (collect($indikatorData)->groupBy('domain_kode') as $domainItems) {
            $bobotDomain += (float) $domainItems->first()['bobot_domain'];
            $bobotAspek = 0.0;

            foreach ($domainItems->groupBy('aspek_kode') as $aspekItems) {
                $bobotAspek += (float) $aspekItems->first()['bobot_aspek'];
                if (abs($aspekItems->sum('bobot_indikator') - 100) > 0.0001) {
                    throw new RuntimeException(
                        'Bobot indikator pada setiap aspek harus berjumlah 100%.'
                    );
                }
            }

            if (abs($bobotAspek - 100) > 0.0001) {
                throw new RuntimeException(
                    'Bobot aspek pada setiap domain harus berjumlah 100%.'
                );
            }
        }

        if (abs($bobotDomain - 100) > 0.0001 || abs($bobotGlobal - 100) > 0.0001) {
            throw new RuntimeException(
                'Bobot domain dan bobot global indikator harus berjumlah 100%.'
            );
        }
    }

    private function merupakanDemoLama(VersiInstrumenEPSS $versi): bool
    {
        $kodeLama = IndikatorEPSS::query()
            ->whereHas('aspek.domain', fn ($query) => $query
                ->where('versi_instrumen_id', $versi->id))
            ->whereIn('kode', range(1, 38))
            ->distinct()
            ->count('kode');

        return $kodeLama === 38;
    }
}
