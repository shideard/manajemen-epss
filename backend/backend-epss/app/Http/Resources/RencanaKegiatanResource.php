<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RencanaKegiatanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'periode_id' => $this->periode_id,
            'created_by' => $this->created_by,
            'pic_user_id' => $this->pic_user_id,
            'opd_id' => $this->opd_id,
            'nama_opd' => $this->opd?->nama,
            'nama_pic' => $this->pic?->name,
            'nama_kegiatan' => $this->nama_kegiatan,
            'deskripsi' => $this->deskripsi,
            'tahun_kegiatan' => $this->tahun_kegiatan,
            'tanggal_mulai_rencana' => $this->tanggal_mulai_rencana?->toDateString(),
            'tanggal_selesai_rencana' => $this->tanggal_selesai_rencana?->toDateString(),
            'reminder_mulai_hari' => $this->reminder_mulai_hari,
            'reminder_selesai_hari' => $this->reminder_selesai_hari,
            'status_kegiatan' => $this->statusKegiatan(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'indikator' => $this->whenLoaded(
                'indikatorMappings',
                fn () => $this->indikatorMappings
                    ->map(fn ($mapping) => [
                        'id' => $mapping->indikator->id,
                        'kode' => $mapping->indikator->kode,
                        'nama' => $mapping->indikator->nama,
                        'level' => $mapping->level,
                    ])
                    ->values()
            ),
        ];
    }
}