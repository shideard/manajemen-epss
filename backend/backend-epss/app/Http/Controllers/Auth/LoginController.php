<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $authenticated = Auth::guard('web')->attempt([
            'email' => $validated['email'],
            'password' => $validated['password'],
            'status_aktif' => true,
        ]);

        if (!$authenticated) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah, atau akun tidak aktif.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login berhasil!',
        ]);
    }
}