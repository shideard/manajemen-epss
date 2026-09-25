<?php

namespace App\Policies;

use App\Models\User;
use App\Enums\UserRole;

class UserPolicy
{
    public function changeStatus(User $actor, User $target): bool 
    {
        return $actor->status_aktif
            && $actor->role === UserRole::SUPER_ADMIN_BIDANG
            && !$actor->is($target)
            && in_array($target->role, [
                UserRole::OPERATOR,
                UserRole::VERIFIKATOR,
            ], true);
    }
}
