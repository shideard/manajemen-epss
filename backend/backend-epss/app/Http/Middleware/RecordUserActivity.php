<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecordUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $routeName = $request->route()?->getName();

        if ($routeName !== 'audit-logs.index') {
            $action = $routeName ?? ($request->method().' '.$request->route()?->uri());
            AuditLog::record($request, $request->user(), $action, $response->getStatusCode());
        }

        return $response;
    }
}
