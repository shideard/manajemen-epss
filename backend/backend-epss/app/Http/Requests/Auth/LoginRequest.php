<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    // yang belum login, bisa mengakses route ini
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            // harus diisi, harus string, harus format email, maksimal 255 karakter
            'password' => ['required', 'string'],
            // harus diisi, harus string. 
            // aturan kekuatan password diatur di pembuatan/penggantian password
        ];
    }
}