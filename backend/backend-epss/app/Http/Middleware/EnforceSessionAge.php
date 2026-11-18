<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnforceSessionAge
{
    public function handle(Request $request, Closure $next): Response
    {
        $loginAt = $request->session()->get('auth.login_at');
        $batasUsiaSesi = 12 * 60 * 60;

        if (
            ! is_numeric($loginAt) ||
            now()->timestamp - (int) $loginAt >= $batasUsiaSesi
        ) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Sesi berakhir. Silakan masuk kembali.',
            ], 401, $this->noCacheHeaders());
        }

        $response = $next($request);

        foreach ($this->noCacheHeaders() as $name => $value) {
            $response->headers->set($name, $value);
        }

        return $response;
    }

    private function noCacheHeaders(): array
    {
        return [
            'Cache-Control' => 'private, no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];
    }
}