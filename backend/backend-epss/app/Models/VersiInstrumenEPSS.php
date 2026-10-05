<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Enums\StatusVersiInstrumen;
use Illuminate\Database\Eloquent\Relations\HasMany;


class VersiInstrumenEPSS extends Model
{
    use HasUuids;

    protected $table = 'versi_instrumen_epss';

    protected $fillable = [
        'nama',
        'versi',
        'berlaku_mulai',
        'berlaku_sampai',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'berlaku_mulai' => 'date',
            'berlaku_sampai' => 'date',
            'status' => StatusVersiInstrumen::class,
        ];
    }

    public function domains(): HasMany
    {
        return $this->hasMany(
            DomainEPSS::class, 
            'versi_instrumen_id');
    }
}
