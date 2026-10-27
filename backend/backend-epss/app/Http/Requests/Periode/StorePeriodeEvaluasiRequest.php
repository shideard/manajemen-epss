<?php

namespace App\Http\Requests\Periode;

use App\Models\PeriodeEvaluasi;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePeriodeEvaluasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', PeriodeEvaluasi::class);
    }

    public function rules(): array
    {
        return [
            'versi_instrumen_id' => [
                'bail',
                'required',
                'uuid',
                Rule::exists('versi_instrumen_epss', 'id'),
            ],
            'nama_periode' => [
                'required',
                'string',
                'max:255',
            ],
            'tahun_mulai' => [
                'required',
                'integer',
                'between:1000,9999',
            ],
            'tahun_selesai' => [
                'required',
                'integer',
                'between:1000,9999',
                'gte:tahun_mulai',
            ],
            'tanggal_mulai' => [
                'required',
                'date_format:Y-m-d',
            ],
            'tanggal_selesai' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:tanggal_mulai',
            ],
            'status' => ['missing'],
            'closed_by' => ['missing'],
            'closed_at' => ['missing'],
        ];
    }
}
