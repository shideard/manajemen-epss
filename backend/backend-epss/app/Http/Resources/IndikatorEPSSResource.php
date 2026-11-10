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