<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class PasswordResetController extends Controller
{
    public function requestLink(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:255']]);
        $user = User::query()->whereRaw('LOWER(email) = ?', [mb_strtolower(trim($data['email']))])->first();

        if ($user?->hasVerifiedEmail()) {
            Password::sendResetLink(['email' => $user->email]);
        }

        return response()->json([
            'message' => 'Jika email terdaftar dan terverifikasi, tautan reset akan dikirim.',
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', PasswordRule::defaults(), 'confirmed'],
        ]);

        $status = Password::reset(
            $data,
            function (User $user, string $password) use ($request): void {
                abort_unless($user->hasVerifiedEmail(), 422, 'Email belum terverifikasi.');

                DB::transaction(function () use ($user, $password): void {
                    $user->forceFill([
                        'password' => $password,
                        'must_change_password' => false,
                        'password_changed_at' => now(),
                        'remember_token' => Str::random(60),
                    ])->save();

                    DB::table('sessions')->where('user_id', $user->id)->delete();
                });

                AuditLog::record($request, $user, 'password.reset', 200);
                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Tautan reset tidak valid atau sudah kedaluwarsa.'], 422);
        }

        return response()->json(['message' => 'Password berhasil direset. Silakan masuk dengan password baru.']);
    }
}
