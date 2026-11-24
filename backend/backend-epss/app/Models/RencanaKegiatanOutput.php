<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RencanaKegiatanOutput extends Model
{
    use HasUuids;

    protected $table = 'rencana_kegiatan_output';

    protected $fillable = [
        'kegiatan_id',
        'judul',
        'jenis',
        'contoh_nama',
        'contoh_storage_key',
        'contoh_mime_type',
        'contoh_size_bytes',
        'urutan',
    ];

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
        ];
    }

    // Indikator tertaut tempat output ini ditargetkan; satu output bisa dipakai beberapa indikator
    public function indikator(): BelongsToMany
    {
        return $this->belongsToMany(IndikatorEpss::class, 'rencana_kegiatan_output_indikator', 'output_id', 'indikator_id');
    }

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(
            RencanaKegiatan::class,
            'kegiatan_id'
        );
    }
}