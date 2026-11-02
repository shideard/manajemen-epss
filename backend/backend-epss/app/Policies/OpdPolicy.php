<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class OpdPolicy
{
    public function viewOptions(User $user): bool
    {
        return $user->status_aktif
            && $user->role === UserRole::VERIFIKATOR;
    }
}