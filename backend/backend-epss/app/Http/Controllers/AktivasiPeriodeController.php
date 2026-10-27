<?php

namespace App\Http\Controllers;

use App\Enums\StatusPeriode;
use App\Http\Resources\PeriodeEvaluasiResource;
use App\Models\PeriodeEvaluasi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class AktivasiPeriodeController extends Controller
{
    public function __invoke(
        PeriodeEvaluasi $periode
    ): PeriodeEvaluasiResource {
        Gate::authorize('activate', $periode);

        $periodeAktif = DB::transaction(function () use (
            $periode
        ): PeriodeEvaluasi {
            $lockedPeriode = PeriodeEvaluasi::query()
                ->lockForUpdate()
                ->findOrFail($periode->id);

            abort_if(
                !in_array($lockedPeriode->status, [
                    StatusPeriode::DRAFT,
                    StatusPeriode::TERKUNCI,
                ], true),
                409,
                'Hanya periode DRAFT atau TERKUNCI yang dapat diaktifkan.'
            );

            $lockedPeriode->status = StatusPeriode::AKTIF;
            $lockedPeriode->save();

            return $lockedPeriode;
        });

        return new PeriodeEvaluasiResource($periodeAktif);
    }
}