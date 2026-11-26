<?php

namespace App\Http\Controllers\Auth;

use App\Models\AuditLog;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class LoginController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Pisahkan batas berdasarkan username dan alamat IP.
        $key = 'login:'.strtolower($validated['username']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            AuditLog::record($request, null, 'auth.login_rate_limited', 429, [
                'login_username' => $validated['username'],
            ]);

            throw $this->terlaluBanyakPercobaan($key);
        }

        if (!$this->turnstileValid($validated['turnstile_token'], $request->ip())) {
            AuditLog::record($request, null, 'auth.login_challenge_failed', 422, [
                'login_username' => $validated['username'],
            ]);
            throw ValidationException::withMessages([
                'turnstile_token' => ['Verifikasi keamanan gagal. Silakan coba lagi.'],
            ]);
        }

        $authenticated = Auth::guard('web')->attempt([
            'username' => $validated['username'],
            'password' => $validated['password'],
            'status_aktif' => true,
        ]);

        if (!$authenticated) {
            RateLimiter::hit($key, 180); // 180 detik = 3 menit
            AuditLog::record($request, null, 'auth.login_failed', 422, [
                'login_username' => $validated['username'],
            ]);

            if (RateLimiter::tooManyAttempts($key, 5)) {
                throw $this->terlaluBanyakPercobaan($key);
            }

            throw ValidationException::withMessages([
                'username' => [
                    'Username atau password salah, atau akun tidak aktif.',
                ],
            ]);
        }

        RateLimiter::clear($key); // Reset hit count setelah login berhasil
        $request->session()->regenerate();
        $request->session()->put('auth.login_at', now()->timestamp);
        AuditLog::record($request, $request->user(), 'auth.login', 200);

        return response()->json([
            'message' => 'Login berhasil!',
        ]);
    }

    // Sisa waktu dihitung dari percobaan gagal pertama (batas 3 menit), jadi bisa kurang dari 3 menit
    private function terlaluBanyakPercobaan(string $key): ValidationException
    {
        $detik = RateLimiter::availableIn($key);
        $sisa = $detik >= 60 ? (int) ceil($detik / 60).' menit' : max($detik, 1).' detik';

        return ValidationException::withMessages([
            'username' => ["Terlalu banyak percobaan login. Coba lagi dalam {$sisa}."],
        ])->status(429);
    }

    private function turnstileValid(string $token, ?string $ip): bool
    {
        $secret = config('services.turnstile.secret_key');
        if (!$secret) {
            return false;
        }

        try {
            $response = Http::asForm()
                ->timeout(5)
                ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret' => $secret,
                    'response' => $token,
                    'remoteip' => $ip,
                ]);
        } catch (ConnectionException) {
            return false;
        }

        return $response->successful()
            && $response->json('success') === true
            && $response->json('action') === 'login';
    }
}
