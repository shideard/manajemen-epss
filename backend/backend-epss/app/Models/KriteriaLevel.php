<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KriteriaLevel extends Model
{
    use HasUuids;

    protected $table = 'kriteria_level';

    protected $fillable = [
        'indikator_id',
        'level',
        'nama_level',
        'deskripsi',
    ];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
        ];
    }

    public function indikator(): BelongsTo
    {
        return $this->belongsTo(IndikatorEPSS::class, 'indikator_id');
    }
}