<?php

namespace App\Policies;

use App\Models\PeriodeEvaluasi;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use App\Enums\StatusPeriode;

class PeriodeEvaluasiPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->status_aktif 
        && in_array($user->role, [
            UserRole::OPERATOR,
            UserRole::VERIFIKATOR,
        ], true);
    }

    public function create(User $user): bool
    {
        return $user->status_aktif
            && $user->role === UserRole::VERIFIKATOR;
    }

    public function viewManagement(User $user): bool
    {
        return $user->status_aktif
            && $user->role === UserRole::VERIFIKATOR;
    }

    public function activate(User $user, PeriodeEvaluasi $periode): bool 
    {
        return $user->status_aktif
            && $user->role === UserRole::VERIFIKATOR;
    }

    public function lock(User $user, PeriodeEvaluasi $periode): bool {
        return $user->status_aktif
            && $user->role === UserRole::VERIFIKATOR;
    }

    public function view(User $user, PeriodeEvaluasi $periode): bool
    {
        if (!$user->status_aktif) {
            return false;
        }

        if ($user->role === UserRole::VERIFIKATOR) {
            return true;
        }

        return $user->role === UserRole::OPERATOR
            && in_array($periode->status, [
                StatusPeriode::AKTIF,
                StatusPeriode::TERKUNCI,
            ], true);
    }
}
