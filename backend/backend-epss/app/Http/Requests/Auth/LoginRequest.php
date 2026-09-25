<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
{
    // yang belum login, bisa mengakses route ini
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $username = $this->input('username');

        if (is_string($username)) {
            $this->merge([
                'username' => Str::lower($username),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'username' => ['bail', 'required', 'string', 'min:3', 'max:50', 'regex:/\A[a-z0-9._-]+\z/'],
            // harus diisi, harus string, panjang 3-50 karakter, hanya boleh mengandung huruf kecil, angka, titik, garis bawah, dan tanda hubung.
            'password' => ['required', 'string'],
            // harus diisi, harus string. 
            // aturan kekuatan password diatur di pembuatan/penggantian password
        ];
    }
}