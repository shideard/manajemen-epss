<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool {
        return $this->user()->can(
            'changeStatus',
            $this->route('user')
        );
    }

    public function rules(): array
    {
        return [
            'status_aktif' => ['required', 'boolean'],
        ];
    }
}
