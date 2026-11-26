<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RecordUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-Id');
        if (! is_string($requestId) || ! preg_match('/\A[a-zA-Z0-9._:-]{1,100}\z/', $requestId)) {
            $requestId = (string) Str::uuid();
        }
        $request->attributes->set('request_id', $requestId);

        $response = $next($request);
        $routeName = $request->route()?->getName();

        if ($routeName !== 'audit-logs.index') {
            $action = $routeName ?? ($request->method().' '.$request->route()?->uri());
            AuditLog::record($request, $request->user(), $action, $response->getStatusCode());
        }

        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }
}
