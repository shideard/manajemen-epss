<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KriteriaPemenuhan extends Model
{
    use HasUuids;

    protected $table = 'kriteria_pemenuhan';

    protected $fillable = [
        'kriteria_level_id',
        'urutan',
        'deskripsi',
    ];

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
        ];
    }

    public function kriteriaLevel(): BelongsTo
    {
        return $this->belongsTo(KriteriaLevel::class, 'kriteria_level_id');
    }
}