<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\RateLimiter;

class LoginController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Pisahkan batas berdasarkan username dan alamat IP.
        $key = 'login:'.strtolower($validated['username']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $detikTersisa = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'username' => [
                    "Terlalu banyak percobaan login. Coba lagi dalam 3 menit.",
                ],
            ])->status(429);
        }

        $jawabanBenar = $request->session()->pull('captcha_answer');

        if (
            $jawabanBenar === null ||
            (int) $validated['captcha'] !== (int) $jawabanBenar
        ) {
            throw ValidationException::withMessages([
                'captcha' => ['Jawaban operasi hitung belum benar. Silakan muat soal baru.'],
            ]);
        }

        $authenticated = Auth::guard('web')->attempt([
            'username' => $validated['username'],
            'password' => $validated['password'],
            'status_aktif' => true,
        ]);

        if (!$authenticated) {
            RateLimiter::hit($key, 180); // 180 detik = 3 menit

            if (RateLimiter::tooManyAttempts($key, 5)) {
                throw ValidationException::withMessages([
                    'username' => [
                        'Terlalu banyak percobaan login. Coba lagi dalam 3 menit.',
                    ],
                ])->status(429);
            }

            throw ValidationException::withMessages([
                'username' => [
                    'Username atau password salah, atau akun tidak aktif.',
                ],
            ]);
        }

        RateLimiter::clear($key); // Reset hit count setelah login berhasil
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login berhasil!',
        ]);
    }
}
