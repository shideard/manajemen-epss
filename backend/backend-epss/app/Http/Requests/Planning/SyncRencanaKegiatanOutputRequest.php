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
            // Indikator tempat output ditargetkan (bisa lebih dari satu); hanya indikator yang dipetakan ke kegiatan ini
            'output.*.indikator_ids' => [
                'sometimes',
                'array',
            ],
            // Tanpa 'distinct': aturan itu membandingkan nilai di semua output sekaligus, padahal beberapa output
            // memang boleh di indikator yang sama. Duplikat di satu output aman karena disimpan lewat sync()
            'output.*.indikator_ids.*' => [
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