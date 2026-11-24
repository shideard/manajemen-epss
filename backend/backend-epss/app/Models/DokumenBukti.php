<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DokumenBukti extends Model
{
    use HasUuids;

    protected $table = 'dokumen_bukti';

    protected $fillable = [
        'kegiatan_id',
        'evidence_date',
        'nama_file',
        'storage_key',
        'mime_type',
        'size_bytes',
        'sha256_hash',
    ];

    protected function casts(): array
    {
        return [
            'version_number' => 'integer',
            'is_current' => 'boolean',
            'evidence_date' => 'date',
            'size_bytes' => 'integer',
        ];
    }

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(RencanaKegiatan::class, 'kegiatan_id');
    }

    public function pengunggah(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function dokumenInduk(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_document_id');
    }

    public function dokumenTurunan(): HasMany
    {
        return $this->hasMany(self::class, 'parent_document_id');
    }

    // Indikator yang didukung berkas ini; kosong = berkas umum yang belum ditautkan (mis. pintasan dari kegiatan lain)
    public function indikator(): BelongsToMany
    {
        return $this->belongsToMany(IndikatorEpss::class, 'dokumen_bukti_indikator', 'dokumen_id', 'indikator_id');
    }

    // Output yang ditargetkan tempat berkas ini diunggah; null = berkas umum
    public function output(): BelongsTo
    {
        return $this->belongsTo(RencanaKegiatanOutput::class, 'output_id');
    }
}