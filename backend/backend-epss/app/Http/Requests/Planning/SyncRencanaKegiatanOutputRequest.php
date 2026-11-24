<?php

namespace App\Http\Requests\Planning;

use App\Models\RencanaKegiatan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncRencanaKegiatanOutputRequest extends FormRequest
{
    public function authorize(): bool
    {
        $kegiatan = $this->route('rencanaKegiatan');

        return $kegiatan instanceof RencanaKegiatan
            && ($this->user()?->can('manageOutputs', $kegiatan) ?? false);
    }

    public function rules(): array
    {
        return [
            'output' => [
                'present',
                'array',
            ],
            // Id output yang sudah tersimpan: barisnya dipertahankan berikut berkas contohnya
            'output.*.id' => [
                'sometimes',
                'nullable',
                'uuid',
            ],
            // Indikator tempat output ditargetkan; hanya indikator yang dipetakan ke kegiatan ini
            'output.*.indikator_id' => [
                'sometimes',
                'nullable',
                'uuid',
                Rule::exists('kegiatan_indikator', 'indikator_id')
                    ->where('kegiatan_id', $this->route('rencanaKegiatan')?->id),
            ],
            'output.*.judul' => [
                'required',
                'string',
                'max:255',
            ],
            'output.*.jenis' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
            'output.*.contoh' => [
                'sometimes',
                'nullable',
                'array',
            ],
            'output.*.contoh.nama' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }
}