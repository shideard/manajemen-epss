<?php

namespace App\Http\Requests\Evidence;

use App\Models\RencanaKegiatan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDokumenBuktiRequest extends FormRequest
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
            'file' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
                'max:10240',
            ],
            'evidence_date' => [
                'required',
                'date_format:Y-m-d',
            ],
            // Unggah dari output yang ditargetkan (indikatornya mengikuti output), atau berkas umum dengan indikator pilihan
            'output_id' => [
                'sometimes',
                'nullable',
                'uuid',
                Rule::exists('rencana_kegiatan_output', 'id')
                    ->where('kegiatan_id', $this->route('rencanaKegiatan')?->id),
            ],
            // Revisi (ada {dokumenBukti} di route) menyalin tautan versi sebelumnya, jadi tidak wajib
            'indikator_ids' => [
                Rule::requiredIf(fn () => ! $this->route('dokumenBukti') && ! $this->filled('output_id')),
                'array',
                'min:1',
            ],
            'indikator_ids.*' => [
                'uuid',
                'distinct',
                Rule::exists('kegiatan_indikator', 'indikator_id')
                    ->where('kegiatan_id', $this->route('rencanaKegiatan')?->id),
            ],
            'uploaded_by' => ['missing'],
            'nama_file' => ['missing'],
            'storage_key' => ['missing'],
            'mime_type' => ['missing'],
            'size_bytes' => ['missing'],
            'sha256_hash' => ['missing'],
            'version_number' => ['missing'],
            'is_current' => ['missing'],
            'parent_document_id' => ['missing'],
        ];
    }
}