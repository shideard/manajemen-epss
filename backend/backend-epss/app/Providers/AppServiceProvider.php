<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Password::defaults(function(): Password {
            return Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->rules([
                    'regex:/[\p{P}\p{S}]/u',
                ]);
        });

        // Tautan di email membuka halaman SPA, yang lalu memanggil endpoint verifikasi API.
        // Tanda tangan relatif (route memakai signed:relative) supaya tetap sah lewat proxy/host frontend.
        VerifyEmail::createUrlUsing(function (object $notifiable): string {
            $path = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(config('auth.verification.expire', 60)),
                ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())],
                absolute: false,
            );

            return rtrim(config('app.frontend_url'), '/').'/verifikasi-email?url='.urlencode($path);
        });

        ResetPassword::createUrlUsing(function (object $notifiable, string $token): string {
            return rtrim(config('app.frontend_url'), '/').'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });
    }
}
