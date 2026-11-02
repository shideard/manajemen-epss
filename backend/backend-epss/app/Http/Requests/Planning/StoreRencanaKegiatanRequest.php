<?php

namespace App\Http\Requests\Planning;

use App\Enums\StatusPeriode;
use App\Enums\UserRole;
use App\Models\RencanaKegiatan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRencanaKegiatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', RencanaKegiatan::class) ?? false;
    }

    public function rules(): array
    {
        return [
            // hanya valid pada periode berstatus aktif 
            'periode_id' => [
                'bail',
                'required',
                'uuid',
                Rule::exists('periode_evaluasi', 'id')
                    ->where('status', StatusPeriode::AKTIF->value),
            ],

            // pic diisi oleh soerang operator yang statusnya aktif
            'pic_user_id' => [
                'bail',
                'required',
                'uuid',
                Rule::exists('users', 'id')
                    ->where('role', UserRole::OPERATOR->value)
                    ->where('status_aktif', true),
            ],

            // opd harus opd aktif
            'opd_id' => [
                'bail',
                'required',
                'uuid',
                Rule::exists('opds', 'id')
                    ->where('status_aktif', true),
            ],

            'nama_kegiatan' => [
                'required',
                'string',
                'max:255',
            ],
            'deskripsi' => [
                'nullable',
                'string',
            ],
            'tanggal_mulai_rencana' => [
                'required',
                'date_format:Y-m-d',
            ],
            'tanggal_selesai_rencana' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:tanggal_mulai_rencana',
            ],
            'reminder_mulai_hari' => [
                'nullable',
                'integer',
                'min:0',
                'max:65535',
            ],
            'reminder_selesai_hari' => [
                'nullable',
                'integer',
                'min:0',
                'max:65535',
            ],

            // Nilai berikut ditentukan server atau tidak diterima pada proses create.
            'created_by' => ['missing'],
            'tahun_kegiatan' => ['missing'],
            'status' => ['missing'],
            'status_kegiatan' => ['missing'],
            'completed_at' => ['missing'],
        ];
    }
}