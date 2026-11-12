<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IndikatorEPSSResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'nama' => $this->nama,
            'deskripsi' => $this->deskripsi,
            'bobot' => $this->bobot,
            'levels' => $this->whenLoaded(
                'kriteriaLevels',
                fn () => $this->kriteriaLevels->map(fn ($level) => [
                    'level' => $level->level,
                    'nama' => $level->nama_level,
                    'kriteria' => $level->deskripsi,
                    'pemenuhan' => $level->kriteriaPemenuhan
                        ->sortBy('urutan')
                        ->pluck('deskripsi')
                        ->values(),
                    'persyaratan_bukti' => $level->persyaratanBukti
                        ->map(fn ($requirement) => [
                            'id' => $requirement->id,
                            'urutan' => $requirement->urutan,
                            'deskripsi' => $requirement->deskripsi,
                        ])
                        ->values(),
                ])->values()
            ),
            'aspek' => [
                'id' => $this->aspek->id,
                'kode' => $this->aspek->kode,
                'nama' => $this->aspek->nama,
            ],
            'domain' => [
                'id' => $this->aspek->domain->id,
                'kode' => $this->aspek->domain->kode,
                'nama' => $this->aspek->domain->nama,
            ],
        ];
    }
}
