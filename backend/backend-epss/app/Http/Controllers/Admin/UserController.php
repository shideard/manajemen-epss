<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    // Daftar akun untuk halaman Kelola Akun (tanpa paginasi: jumlah akun kecil)
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $users = User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'username', 'email', 'role', 'status_aktif']);

        return response()->json([
            'data' => $users->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role->value,
                'status_aktif' => $user->status_aktif,
            ]),
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = new User();
        $user->name = $validated['name'];
        $user->username = $validated['username'];
        $user->email = $validated['email'] ?? null;
        $user->password = $validated['password'];
        $user->role = UserRole::from($validated['role']);
        $user->status_aktif = true;
        $user->save();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role->value,
                'status_aktif' => $user->status_aktif,
            ],
        ], 201);
    }
}
