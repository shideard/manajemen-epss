<?php

namespace App\Http\Requests\Evidence;

use App\Models\RencanaKegiatan;
use App\Models\IndikatorEPSS;
use App\Support\Evidence\ChecklistBuktiValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateAjuanBuktiRequest extends FormRequest
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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->boolean('ajukan') || count($validator->errors()) > 0) {
                return;
            }

            $indikator = $this->route('indikator');
            if (! $indikator instanceof IndikatorEPSS) {
                return;
            }

            $pesan = ChecklistBuktiValidator::kekurangan(
                $indikator,
                $this->input('checklist', []),
                1
            );

            if ($pesan) {
                $validator->errors()->add('checklist', $pesan);
            }
        });
    }
}
