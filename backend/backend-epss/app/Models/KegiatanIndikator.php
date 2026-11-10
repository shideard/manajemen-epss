<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KegiatanIndikator extends Model
{
    use HasUuids;

    protected $table = 'kegiatan_indikator';

    protected $fillable = [
        'kegiatan_id',
        'indikator_id',
        'level',
        'created_by',
    ];

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(
            RencanaKegiatan::class,
            'kegiatan_id'
        );
    }

    public function indikator(): BelongsTo
    {
        return $this->belongsTo(
            IndikatorEPSS::class,
            'indikator_id'
        );
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }
}