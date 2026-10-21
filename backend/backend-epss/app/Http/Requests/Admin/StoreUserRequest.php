<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Override;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    protected function prepareForValidation(): void
    {
        $username = $this->input('username');

        if(is_string($username)) {
            $this->merge([
                'username' => Str::lower($username),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'bail',
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/\A[a-z0-9._-]+\z/',
                Rule::unique('users', 'username'),
            ],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],
            'password' => [
                'required',
                'string',
                'min:12',
                'confirmed',
            ],
            'role' => [
                'required',
                'string',
                Rule::in([
                    UserRole::OPERATOR->value,
                    UserRole::VERIFIKATOR->value,
                ]),
            ],
        ];
    }
}
