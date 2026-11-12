<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RencanaKegiatanOutput extends Model
{
    use HasUuids;

    protected $table = 'rencana_kegiatan_output';

    protected $fillable = [
        'kegiatan_id',
        'judul',
        'jenis',
        'contoh_nama',
        'urutan',
    ];

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
        ];
    }

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(
            RencanaKegiatan::class,
            'kegiatan_id'
        );
    }
}