<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Casts\Attribute;

class RencanaKegiatan extends Model
{
    use HasUuids;

    protected $table = 'rencana_kegiatan';

    protected $fillable = [
        'periode_id',
        'pic_user_id',
        'opd_id',
        'nama_kegiatan',
        'deskripsi',
        'tanggal_mulai_rencana',
        'tanggal_selesai_rencana',
        'reminder_mulai_hari',
        'reminder_selesai_hari',
    ];

    protected function casts(): array
    {
        return [
            'tahun_kegiatan' => 'integer',
            'tanggal_mulai_rencana' => 'immutable_date',
            'tanggal_selesai_rencana' => 'immutable_date',
            'reminder_mulai_hari' => 'integer',
            'reminder_selesai_hari' => 'integer',
        ];
    }

    protected function tanggalMulaiRencana(): Attribute
    {
        return Attribute::make(
            set: function ($value): array {
                $tanggal = CarbonImmutable::parse($value);

                return [
                    'tanggal_mulai_rencana' => $tanggal->toDateString(),
                    'tahun_kegiatan' => $tanggal->year,
                ];
            }
        );
    }

    public function periode(): BelongsTo
    {
        return $this->belongsTo(PeriodeEvaluasi::class, 'periode_id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_user_id');
    }

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class, 'opd_id');
    }

    public function statusKegiatan(): string
    {
        $today = today();

        if ($today->lt($this->tanggal_mulai_rencana)) {
            return 'BELUM_MULAI';
        }

        if ($today->gt($this->tanggal_selesai_rencana)) {
            return 'SELESAI';
        }

        return 'BERJALAN';
    }

    
}