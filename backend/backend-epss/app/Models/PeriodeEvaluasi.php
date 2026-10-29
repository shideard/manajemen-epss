<?php

namespace App\Models;

use App\Enums\StatusPeriode;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PeriodeEvaluasi extends Model
{
    use HasUuids;

    protected $table = 'periode_evaluasi';

    protected $fillable = [
        'versi_instrumen_id',
        'nama_periode',
        'tahun_mulai',
        'tahun_selesai',
        'tanggal_mulai',
        'tanggal_selesai',
    ];

    protected function casts(): array
    {
        return [
            'tahun_mulai' => 'integer',
            'tahun_selesai' => 'integer',
            'tanggal_mulai' => 'immutable_date',
            'tanggal_selesai' => 'immutable_date',
            'status' => StatusPeriode::class,
            'closed_at' => 'immutable_datetime',
        ];
    }

    public function versiInstrumen(): BelongsTo
    {
        return $this->belongsTo(
            VersiInstrumenEPSS::class,
            'versi_instrumen_id'
        );
    }

    public function ditutupOleh(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'closed_by'
        );
    }

    public function rencanaKegiatan(): HasMany
    {
        return $this->hasMany(RencanaKegiatan::class, 'periode_id');
    }

}
