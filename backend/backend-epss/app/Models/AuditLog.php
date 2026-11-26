<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AuditLog extends Model
{
    use HasUuids;
    use MassPrunable;

    public $timestamps = false;

    protected $fillable = [
        'actor_user_id', 'actor_name', 'actor_username', 'actor_role',
        'action', 'method', 'route_name', 'route_uri', 'target',
        'event_type', 'object_type', 'object_id', 'outcome', 'context',
        'response_status', 'ip_address', 'user_agent', 'created_at',
    ];

    protected function casts(): array
    {
        return ['target' => 'array', 'context' => 'array', 'created_at' => 'immutable_datetime'];
    }

    // Log disimpan 24 bulan (satu siklus periode EPSS); dihapus oleh `model:prune` yang dijadwalkan harian di routes/console.php
    public function prunable(): Builder
    {
        return static::query()->where('created_at', '<', now()->subMonths(24));
    }

    public static function record(
        Request $request,
        ?User $actor,
        string $action,
        ?int $status = null,
        array $extraContext = [],
    ): void
    {
        $parameters = collect($request->route()?->parameters() ?? []);
        $target = $parameters
            ->mapWithKeys(function ($value, string $key): array {
                if ($value instanceof Model) {
                    return [$key => ['type' => class_basename($value), 'id' => (string) $value->getKey()]];
                }

                return is_scalar($value) ? [$key => (string) $value] : [];
            })
            ->all();
        $object = $parameters->first();
        $objectType = $object instanceof Model ? class_basename($object) : null;
        $objectId = $object instanceof Model ? (string) $object->getKey() : (is_scalar($object) ? (string) $object : null);
        $routeName = $request->route()?->getName();
        $eventType = Str::snake($action);
        $requestId = $request->attributes->get('request_id')
            ?? $request->header('X-Request-Id')
            ?? (string) Str::uuid();
        if (! is_string($requestId) || ! preg_match('/\A[a-zA-Z0-9._:-]{1,100}\z/', $requestId)) {
            $requestId = (string) Str::uuid();
        }
        $context = array_merge([
            'request_id' => mb_substr((string) $requestId, 0, 100),
            'session_id_hash' => $request->hasSession()
                ? hash('sha256', (string) $request->session()->getId())
                : null,
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 1000),
        ], $extraContext);

        $attributes = [
            'actor_user_id' => $actor?->id,
            'actor_name' => $actor?->name,
            'actor_username' => $actor?->username,
            'actor_role' => $actor?->role?->value,
            'action' => $eventType,
            'method' => $request->method(),
            'route_name' => $routeName,
            'route_uri' => $request->route()?->uri() ?? $request->path(),
            'target' => $target ?: null,
            'response_status' => $status,
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 1000),
            'created_at' => now('UTC'),
        ];

        if (Schema::hasColumns('audit_logs', ['event_type', 'object_type', 'object_id', 'outcome', 'context'])) {
            $attributes += [
                'event_type' => $eventType,
                'object_type' => $objectType,
                'object_id' => $objectId,
                'outcome' => $status !== null && $status >= 400 ? 'failure' : 'success',
                'context' => array_filter($context, static fn ($value) => $value !== null),
            ];
        }

        self::query()->create($attributes);
    }
}
