<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AjuanBuktiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kegiatan_id' => $this->kegiatan_id,
            'indikator' => [
                'id' => $this->indikator->id,
                'kode' => $this->indikator->kode,
            ],
            'status' => $this->status->value,
            // Selalu objek JSON, juga saat checklist masih kosong
            'checklist' => (object) ($this->checklist ?? []),
            'level' => $this->level,
            'catatan' => $this->catatan,
            'pengaju' => $this->pengaju?->name,
            'diajukan_pada' => $this->diajukan_pada?->toISOString(),
            'verifikator' => $this->verifikator?->name,
            'diverifikasi_pada' => $this->diverifikasi_pada?->toISOString(),
        ];
    }
}
