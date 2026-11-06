<?php

namespace App\Http\Requests\Evidence;

use App\Models\RencanaKegiatan;
use Illuminate\Foundation\Http\FormRequest;

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