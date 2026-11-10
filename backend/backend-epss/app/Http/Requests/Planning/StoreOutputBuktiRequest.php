<?php

namespace App\Http\Requests\Planning;

use App\Models\RencanaKegiatan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOutputBuktiRequest extends FormRequest
{
    // Jenis file yang bisa dipilih di form (sama dengan JENIS_FILE di KegiatanForm.jsx)
    public const JENIS = ['PDF', 'Gambar (JPG/PNG)', 'Word', 'Excel', 'Lainnya'];

    public function authorize(): bool
    {
        $kegiatan = $this->route('rencanaKegiatan');

        return $kegiatan instanceof RencanaKegiatan
            && ($this->user()?->can('update', $kegiatan) ?? false);
    }

    public function rules(): array
    {
        return [
            // Judul boleh kosong jika ada berkas contoh: judul = nama berkas
            'judul' => ['required_without:contoh', 'nullable', 'string', 'max:255'],
            'jenis' => ['nullable', Rule::in(self::JENIS)],
            'contoh' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
                'max:10240',
            ],
        ];
    }
}
