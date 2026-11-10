<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Opd extends Model
{
    use HasUuids;

    protected $fillable = [
        'kode',
        'nama',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
    ];

    public function rencanaKegiatan(): HasMany
    {
        return $this->hasMany(RencanaKegiatan::class, 'opd_id');
    }
}