<?php

namespace App\Http\Requests\Evidence;

use App\Models\RencanaKegiatan;
use Illuminate\Foundation\Http\FormRequest;

class SimpanAjuanBuktiRequest extends FormRequest
{
    public function authorize(): bool
    {
        $kegiatan = $this->route('rencanaKegiatan');

        return $kegiatan instanceof RencanaKegiatan
            && ($this->user()?->can('uploadEvidence', $kegiatan) ?? false);
    }

    public function rules(): array
    {
        return [
            // { "<level 1-5>": [bool, ...] }
            'checklist' => ['present', 'array'],
            'checklist.*' => ['array'],
            'checklist.*.*' => ['boolean'],
            // true = ajukan ke verifikator, false = simpan sebagai draft
            'ajukan' => ['required', 'boolean'],
            'status' => ['missing'],
            'level' => ['missing'],
            'catatan' => ['missing'],
        ];
    }
}
