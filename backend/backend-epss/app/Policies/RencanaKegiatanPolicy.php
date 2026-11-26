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

    // Periode terkunci = hanya-baca: hapus kegiatan dan kelola output mengikuti aturan update
    public function delete(User $user, RencanaKegiatan $rencanaKegiatan): bool
    {
        return $this->update($user, $rencanaKegiatan);
    }

    public function uploadEvidence(User $user, RencanaKegiatan $rencanaKegiatan): bool 
    {
    return $user->status_aktif
        && $user->role === UserRole::OPERATOR
        && $rencanaKegiatan->pic_user_id === $user->id
        && $rencanaKegiatan->periode()
            ->where('status', StatusPeriode::AKTIF->value)
            ->exists();
    }

    public function manageOutputs(
    User $user,
    RencanaKegiatan $rencanaKegiatan
    ): bool {
        return $this->update($user, $rencanaKegiatan);
    }
}
