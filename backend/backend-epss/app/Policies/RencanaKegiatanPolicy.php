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
}
