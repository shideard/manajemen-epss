<?php

namespace App\Http\Requests\Planning;

use App\Enums\UserRole;
use App\Models\RencanaKegiatan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRencanaKegiatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $kegiatan = $this->route('rencanaKegiatan');

        return $kegiatan instanceof RencanaKegiatan
            && ($this->user()?->can('update', $kegiatan) ?? false);
    }

    public function rules(): array
    {
        return [
            'pic_user_id' => [
                'sometimes',
                'required',
                'uuid',
                Rule::exists('users', 'id')
                    ->where('role', UserRole::OPERATOR->value)
                    ->where('status_aktif', true),
            ],
            'opd_id' => [
                'sometimes',
                'required',
                'uuid',
                Rule::exists('opds', 'id')
                    ->where('status_aktif', true),
            ],
            'nama_kegiatan' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'deskripsi' => [
                'sometimes',
                'nullable',
                'string',
            ],
            'tanggal_mulai_rencana' => [
                'required_with:tanggal_selesai_rencana',
                'date_format:Y-m-d',
            ],
            'tanggal_selesai_rencana' => [
                'required_with:tanggal_mulai_rencana',
                'date_format:Y-m-d',
                'after_or_equal:tanggal_mulai_rencana',
            ],
            'reminder_mulai_hari' => [
                'sometimes',
                'nullable',
                'integer',
                'min:0',
                'max:65535',
            ],
            'reminder_selesai_hari' => [
                'sometimes',
                'nullable',
                'integer',
                'min:0',
                'max:65535',
            ],

            'periode_id' => ['missing'],
            'created_by' => ['missing'],
            'tahun_kegiatan' => ['missing'],
            'status' => ['missing'],
            'status_kegiatan' => ['missing'],
            'completed_at' => ['missing'],
        ];
    }
}