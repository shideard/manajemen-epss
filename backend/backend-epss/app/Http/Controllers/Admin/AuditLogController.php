<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->role === UserRole::SUPER_ADMIN_BIDANG, 403);

        $logs = AuditLog::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(50);

        return response()->json([
            'data' => $logs->getCollection()->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'actor_name' => $log->actor_name ?? 'Pengguna tidak diketahui',
                'actor_username' => $log->actor_username,
                'actor_role' => $log->actor_role,
                'action' => $log->action,
                'method' => $log->method,
                'route_uri' => $log->route_uri,
                'target' => $log->target,
                'response_status' => $log->response_status,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at,
            ]),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
