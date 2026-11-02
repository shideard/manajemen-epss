<?php

namespace App\Policies;

use App\Models\User;
use App\Enums\UserRole;

class RencanaKegiatanPolicy
{
    public function create(User $user): bool
    {
        return $user->role === UserRole::VERIFIKATOR && $user->status_aktif;
    }

    public function viewAny(User $user): bool
    {
        return $user->status_aktif
            && in_array($user->role, [
                UserRole::VERIFIKATOR,
                UserRole::OPERATOR,
            ], true);
    }
}
