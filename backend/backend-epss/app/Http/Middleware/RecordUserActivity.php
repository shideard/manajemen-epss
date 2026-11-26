<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RecordUserActivity
{
    // GET yang tetap dicatat: unduhan berkas (siapa mengunduh bukti apa). GET lain hanya membaca halaman, tidak dicatat.
    private const GET_DICATAT = [
        'rencana-kegiatan.dokumen-bukti.download',
        'rencana-kegiatan.output.contoh.show',
        'periode-evaluasi.ekspor-bukti',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-Id');
        if (! is_string($requestId) || ! preg_match('/\A[a-zA-Z0-9._:-]{1,100}\z/', $requestId)) {
            $requestId = (string) Str::uuid();
        }
        $request->attributes->set('request_id', $requestId);

        $response = $next($request);
        $routeName = $request->route()?->getName();

        if (! $request->isMethodSafe() || in_array($routeName, self::GET_DICATAT, true)) {
            $action = $routeName ?? ($request->method().' '.$request->route()?->uri());
            AuditLog::record($request, $request->user(), $action, $response->getStatusCode());
        }

        // Request id tetap dikirim balik untuk semua request, termasuk GET yang tidak dicatat
        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }
}
