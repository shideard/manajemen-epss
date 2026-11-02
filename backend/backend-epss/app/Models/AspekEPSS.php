<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AspekEPSS extends Model
{
    use HasUuids;

    protected $table = 'aspek_epss';

    protected $fillable = [
        'domain_id',
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

    public function domain(): BelongsTo
    {
        return $this->belongsTo(
            DomainEPSS::class,
            'domain_id'
        );
    }
}
