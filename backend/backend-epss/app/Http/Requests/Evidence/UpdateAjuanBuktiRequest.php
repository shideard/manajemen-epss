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

            $kegiatan = $this->route('rencanaKegiatan');
            $indikator = $this->route('indikator');
            if (! $kegiatan instanceof RencanaKegiatan || ! $indikator instanceof IndikatorEPSS) {
                return;
            }

            // Level target pemetaan; tanpa pemetaan controller yang menolak (404)
            $level = $kegiatan->indikatorMappings()
                ->where('indikator_id', $indikator->id)
                ->value('level');
            if ($level === null) {
                return;
            }

            $pesan = ChecklistBuktiValidator::kekurangan(
                $indikator,
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
