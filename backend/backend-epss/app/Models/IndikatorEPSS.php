<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IndikatorEPSS extends Model
{
    use HasUuids;

    protected $table = 'indikator_epss';

    protected $fillable = [
        'aspek_id',
        'kode',
        'nama',
        'deskripsi',
        'bobot',
    ];

    protected function casts(): array
    {
        return [
            'bobot' => 'decimal:4',
        ];
    }

    public function aspek(): BelongsTo
    {
        return $this->belongsTo(
            AspekEPSS::class,
            'aspek_id'
        );
    }

    public function kegiatanMappings(): HasMany
    {
        return $this->hasMany(
            KegiatanIndikator::class,
            'indikator_id'
        );
    }
}