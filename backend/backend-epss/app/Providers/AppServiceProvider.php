<?php

namespace App\Providers;

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
    }
}
