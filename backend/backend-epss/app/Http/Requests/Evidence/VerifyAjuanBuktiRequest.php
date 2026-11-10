<?php

namespace App\Http\Requests\Evidence;

use App\Enums\StatusAjuanBukti;
use App\Models\AjuanBukti;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifyAjuanBuktiRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ajuan = $this->route('ajuanBukti');

        return $ajuan instanceof AjuanBukti
            && ($this->user()?->can('verify', $ajuan) ?? false);
    }

    public function rules(): array
    {
        return [
            'keputusan' => [
                'required',
                Rule::in([
                    StatusAjuanBukti::TERVERIFIKASI->value,
                    StatusAjuanBukti::PERBAIKAN->value,
                ]),
            ],
            // Checklist hasil pemeriksaan verifikator
            'checklist' => ['present', 'array'],
            'checklist.*' => ['array'],
            'checklist.*.*' => ['boolean'],
            // Level yang ditetapkan = level target pemetaan kegiatan-indikator, bukan pilihan verifikator
            'level' => ['missing'],
            'catatan' => [
                'required_if:keputusan,' . StatusAjuanBukti::PERBAIKAN->value,
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }
}
