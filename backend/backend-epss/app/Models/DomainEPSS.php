<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DomainEPSS extends Model
{
    use HasUuids;

    protected $table = 'domain_epss';

    protected $fillable = [
        'versi_instrumen_id',
        'kode',
        'nama',
        'bobot',
    ];

    protected function casts(): array
    {
        return [
            'bobot' => 'decimal:4',
        ];
    }

    public function versiInstrumen(): BelongsTo
    {
        return $this->belongsTo(
            VersiInstrumenEPSS::class, 
            'versi_instrumen_id');
    }
}
