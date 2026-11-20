<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\JsonResponse;

class CaptchaController
{
    public function show(): JsonResponse
    {
        return response()->json([
            'siteKey' => config('services.turnstile.site_key'),
        ], 200, [
            'Cache-Control' => 'private, no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
