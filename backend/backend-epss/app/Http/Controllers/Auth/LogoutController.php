<?php

namespace App\Http\Controllers\Auth;

use App\Models\AuditLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function destroy(Request $request): Response
    {
        AuditLog::record($request, $request->user(), 'auth.logout', 204);
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
