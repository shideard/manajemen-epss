<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AuditLog extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'actor_user_id', 'actor_name', 'actor_username', 'actor_role',
        'action', 'method', 'route_name', 'route_uri', 'target',
        'response_status', 'ip_address', 'user_agent', 'created_at',
    ];

    protected function casts(): array
    {
        return ['target' => 'array', 'created_at' => 'immutable_datetime'];
    }

    public static function record(Request $request, ?User $actor, string $action, ?int $status = null): void
    {
        // Agar aplikasi tetap berjalan sebelum migrasi audit dijalankan; pencatatan aktif setelah tabel tersedia.
        if (! Schema::hasTable('audit_logs')) {
            return;
        }

        $target = collect($request->route()?->parameters() ?? [])
            ->mapWithKeys(function ($value, string $key): array {
                if ($value instanceof Model) {
                    return [$key => ['type' => class_basename($value), 'id' => (string) $value->getKey()]];
                }

                return is_scalar($value) ? [$key => (string) $value] : [];
            })
            ->all();

        self::query()->create([
            'actor_user_id' => $actor?->id,
            'actor_name' => $actor?->name,
            'actor_username' => $actor?->username,
            'actor_role' => $actor?->role?->value,
            'action' => $action,
            'method' => $request->method(),
            'route_name' => $request->route()?->getName(),
            'route_uri' => $request->route()?->uri() ?? $request->path(),
            'target' => $target ?: null,
            'response_status' => $status,
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 1000),
            'created_at' => now(),
        ]);
    }
}
