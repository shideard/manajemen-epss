<?php

namespace App\Policies;

use App\Enums\StatusPeriode;
use App\Enums\UserRole;
use App\Models\AjuanBukti;
use App\Models\User;

class AjuanBuktiPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->status_aktif
            && in_array($user->role, [
                UserRole::VERIFIKATOR,
                UserRole::OPERATOR,
            ], true);
    }

    // Operator menyimpan checklist & mengajukan lewat RencanaKegiatanPolicy::uploadEvidence
    public function verify(User $user, AjuanBukti $ajuanBukti): bool
    {
        return $user->status_aktif
            && $user->role === UserRole::VERIFIKATOR
            && $ajuanBukti->kegiatan()
                ->whereHas('periode', fn ($query) => $query->where('status', StatusPeriode::AKTIF->value))
                ->exists();
    }
}
