<?php

namespace App\Http\Requests\Planning;

use App\Models\IndikatorEPSS;
use App\Models\RencanaKegiatan;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncKegiatanIndikatorRequest extends FormRequest
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
            'indikator_ids' => [
                'present',
                'array',
            ],
            'indikator_ids.*' => [
                'required',
                'uuid',
                'distinct',
                Rule::exists('indikator_epss', 'id'),
            ],
            // { "<indikator_id>": level 1-5 } = level yang ditargetkan kegiatan ini; tanpa entri = level 1
            'levels' => ['sometimes', 'array'],
            'levels.*' => ['integer', 'min:1', 'max:5'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $kegiatan = $this->route('rencanaKegiatan');
            $indikatorIds = $this->input('indikator_ids', []);

            if (! $kegiatan instanceof RencanaKegiatan || $indikatorIds === []) {
                return;
            }

            $versiInstrumenId = $kegiatan
                ->periode()
                ->value('versi_instrumen_id');

            $jumlahIndikatorSesuaiVersi = IndikatorEPSS::query()
                ->whereIn('id', $indikatorIds)
                ->whereHas('aspek.domain', function ($query) use ($versiInstrumenId) {
                    $query->where('versi_instrumen_id', $versiInstrumenId);
                })
                ->count();

            if ($jumlahIndikatorSesuaiVersi !== count($indikatorIds)) {
                $validator->errors()->add(
                    'indikator_ids',
                    'Semua indikator harus berasal dari versi instrumen periode kegiatan.'
                );
            }
        });
    }
}