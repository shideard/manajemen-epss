<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutputBukti extends Model
{
    use HasUuids;

    protected $table = 'output_bukti';

    protected $fillable = [
        'judul',
        'jenis',
    ];

    protected function casts(): array
    {
        return [
            'contoh_size_bytes' => 'integer',
        ];
    }

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(RencanaKegiatan::class, 'kegiatan_id');
    }
}
