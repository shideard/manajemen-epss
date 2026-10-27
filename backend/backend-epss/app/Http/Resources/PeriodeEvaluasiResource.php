<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PeriodeEvaluasiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'versi_instrumen_id' => $this->versi_instrumen_id,
            'nama_periode' => $this->nama_periode,
            'tahun_mulai' => $this->tahun_mulai,
            'tahun_selesai' => $this->tahun_selesai,
            'tanggal_mulai' => $this->tanggal_mulai->toDateString(),
            'tanggal_selesai' => $this->tanggal_selesai->toDateString(),
            'status' => $this->status->value,
            'closed_at' => $this->closed_at?->toISOString(),
        ];
    }
}
