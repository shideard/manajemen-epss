<?php

namespace App\Http\Requests\Evidence;

use App\Enums\StatusAjuanBukti;
use App\Models\AjuanBukti;
use App\Models\KegiatanIndikator;
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
            if (! $ajuan instanceof AjuanBukti) {
                return;
            }

            // Level target pemetaan; tanpa pemetaan controller yang menolak (409)
            $level = KegiatanIndikator::query()
                ->where('kegiatan_id', $ajuan->kegiatan_id)
                ->where('indikator_id', $ajuan->indikator_id)
                ->value('level');
            if ($level === null) {
                return;
            }

            $pesan = ChecklistBuktiValidator::kekurangan(
                $ajuan->indikator,
                $this->input('checklist', []),
                $level,
                $level
            );

            if ($pesan) {
                $validator->errors()->add('checklist', $pesan);
            }
        });
    }
}
