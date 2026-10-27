<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VersiInstrumenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'versi' => $this->versi,
            'status' => $this->status->value,
            'berlaku_mulai' => $this->berlaku_mulai->toDateString(),
            'berlaku_sampai' => $this->berlaku_sampai?->toDateString(),
        ];
    }
}