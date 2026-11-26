<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->role === UserRole::SUPER_ADMIN_BIDANG, 403);

        if (! Schema::hasColumns('audit_logs', ['event_type', 'object_type', 'object_id', 'outcome', 'context'])) {
            return response()->json([
                'message' => 'Struktur log aktivitas belum diperbarui. Jalankan migration audit log terlebih dahulu.',
            ], 503);
        }

        $logs = AuditLog::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(50);

        return response()->json([
            'data' => $logs->getCollection()->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'actor_user_id' => $log->actor_user_id,
                'actor_name' => $log->actor_name ?? 'Pengguna tidak diketahui',
                'actor_username' => $log->actor_username,
                'actor_role' => $log->actor_role,
                'action' => $log->action,
                'event_type' => $log->event_type ?? $log->action,
                'object_type' => $log->object_type,
                'object_id' => $log->object_id,
                'outcome' => $log->outcome ?? ($log->response_status >= 400 ? 'failure' : 'success'),
                'method' => $log->method,
                'route_uri' => $log->route_uri,
                'target' => $log->target,
                'response_status' => $log->response_status,
                'ip_address' => $log->ip_address,
                'context' => $log->context,
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
