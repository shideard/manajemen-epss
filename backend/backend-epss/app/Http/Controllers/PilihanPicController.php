<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Resources\PicResource;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PilihanPicController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        Gate::authorize('viewPicOptions', User::class);

        $operators = User::query()
            ->select(['id', 'name', 'username'])
            ->where('role', UserRole::OPERATOR->value)
            ->where('status_aktif', true)
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(20);

        return PicResource::collection($operators);
    }
}