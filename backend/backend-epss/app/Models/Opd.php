<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class opd extends Model
{
    use HasUuids;

    protected $fillable = [
        'kode',
        'nama',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
    ];
}