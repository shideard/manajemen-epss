<?php

namespace App\Policies;

use App\Models\User;
use App\Enums\UserRole;
use App\Models\RencanaKegiatan;
use App\Enums\StatusPeriode;

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

    public function view(User $user, RencanaKegiatan $rencanaKegiatan): bool
    {
        return $user->status_aktif
            && in_array($user->role, [
                UserRole::VERIFIKATOR,
                UserRole::OPERATOR,
            ], true);
    }

    public function update(User $user, RencanaKegiatan $rencanaKegiatan): bool
    {
        return $user->status_aktif
            && $user->role === UserRole::VERIFIKATOR
            && $rencanaKegiatan->periode()
                ->where('status', StatusPeriode::AKTIF->value)
                ->exists();
    }

    public function delete(User $user, RencanaKegiatan $rencanaKegiatan): bool
    {
        return $user->role === UserRole::VERIFIKATOR;
    }
}
