<?php

namespace App\Http\Requests\Planning;

use App\Models\RencanaKegiatan;
use Illuminate\Foundation\Http\FormRequest;

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