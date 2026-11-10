<?php

namespace App\Models;

use App\Enums\StatusAjuanBukti;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AjuanBukti extends Model
{
    use HasUuids;

    protected $table = 'ajuan_bukti';

    // status, level, catatan, dan kolom diajukan/diverifikasi diisi server
    protected $fillable = [
        'kegiatan_id',
        'indikator_id',
        'checklist',
    ];

    protected $attributes = [
        'status' => 'DRAFT',
        'checklist' => '{}',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusAjuanBukti::class,
            'checklist' => 'array',
            'level' => 'integer',
            'diajukan_pada' => 'datetime',
            'diverifikasi_pada' => 'datetime',
        ];
    }

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(RencanaKegiatan::class, 'kegiatan_id');
    }

    public function indikator(): BelongsTo
    {
        return $this->belongsTo(IndikatorEPSS::class, 'indikator_id');
    }

    public function pengaju(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diajukan_oleh');
    }

    public function verifikator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }
}
