<?php

namespace App\Http\Requests\Evidence;

use App\Enums\StatusAjuanBukti;
use App\Models\AjuanBukti;
use App\Support\Evidence\ChecklistBuktiValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
            'level' => [
                'required_if:keputusan,' . StatusAjuanBukti::TERVERIFIKASI->value,
                'prohibited_if:keputusan,' . StatusAjuanBukti::PERBAIKAN->value,
                'integer',
                'min:1',
                'max:5',
            ],
            'catatan' => [
                'required_if:keputusan,' . StatusAjuanBukti::PERBAIKAN->value,
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (
                $this->input('keputusan') !== StatusAjuanBukti::TERVERIFIKASI->value
                || count($validator->errors()) > 0
            ) {
                return;
            }

            $ajuan = $this->route('ajuanBukti');
            $level = $this->integer('level');
            if (! $ajuan instanceof AjuanBukti || $level < 1 || $level > 5) {
                return;
            }

            $pesan = ChecklistBuktiValidator::kekurangan(
                $ajuan->indikator,
                $this->input('checklist', []),
                $level
            );

            if ($pesan) {
                $validator->errors()->add('checklist', $pesan);
            }
        });
    }
}
