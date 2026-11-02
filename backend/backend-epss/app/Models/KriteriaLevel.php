<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function kriteriaPemenuhan(): HasMany
    {
        return $this->hasMany(KriteriaPemenuhan::class, 'kriteria_level_id');
    }

    public function persyaratanBukti(): HasMany
    {
        return $this->hasMany(PersyaratanBukti::class, 'kriteria_level_id');
    }
}