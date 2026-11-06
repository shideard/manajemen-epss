<?php

namespace App\Http\Requests\Periode;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePeriodeEvaluasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can(
            'update',
            $this->route('periode')
        );
    }

    public function rules(): array
    {
        return [
            'nama_periode' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'tahun_mulai' => [
                'sometimes',
                'required',
                'integer',
                'between:1000,9999',
            ],
            'tahun_selesai' => [
                'sometimes',
                'required',
                'integer',
                'between:1000,9999',
            ],
            'target_ips' => [
                'sometimes',
                'required',
                'numeric',
                'between:0,5',
                'decimal:0,2',
            ],
            'versi_instrumen_id' => ['missing'],
            'status' => ['missing'],
            'closed_by' => ['missing'],
            'closed_at' => ['missing'],
        ];
    }
}