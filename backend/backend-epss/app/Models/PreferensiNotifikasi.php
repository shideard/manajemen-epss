<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreferensiNotifikasi extends Model
{
    // Pilihan H-n yang tersedia; juga nilai bawaan bagi pengguna yang belum pernah mengatur
    public const HARI = [1, 7, 14, 30];

    // ponytail: id notifikasi dibaca disimpan sebagai satu daftar JSON dan dipotong ke yang terbaru;
    // pindahkan ke tabel tersendiri bila perlu riwayat lengkap
    public const MAKS_DIBACA = 1000;

    protected $table = 'preferensi_notifikasi';

    protected $primaryKey = 'user_id';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'hari_pengingat',
        'dibaca',
    ];

    protected $attributes = [
        'hari_pengingat' => '[1,7,14,30]',
        'dibaca' => '[]',
    ];

    protected function casts(): array
    {
        return [
            'hari_pengingat' => 'array',
            'dibaca' => 'array',
        ];
    }
}
