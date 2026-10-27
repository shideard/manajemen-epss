<?php

namespace App\Http\Controllers;

use App\Enums\StatusPeriode;
use App\Http\Resources\PeriodeEvaluasiResource;
use App\Models\PeriodeEvaluasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class KunciPeriodeController extends Controller
{
    public function __invoke(
        Request $request,
        PeriodeEvaluasi $periode
    ): PeriodeEvaluasiResource {
        Gate::authorize('lock', $periode);

        $actorId = $request->user()->id;

        $periodeTerkunci = DB::transaction(function () use (
            $periode,
            $actorId
        ): PeriodeEvaluasi {
            $lockedPeriode = PeriodeEvaluasi::query()
                ->lockForUpdate()
                ->findOrFail($periode->id);

            abort_if(
                $lockedPeriode->status !== StatusPeriode::AKTIF,
                409,
                'Hanya periode AKTIF yang dapat dikunci.'
            );

            $lockedPeriode->status = StatusPeriode::TERKUNCI;
            $lockedPeriode->closed_by = $actorId;
            $lockedPeriode->closed_at = now();
            $lockedPeriode->save();

            return $lockedPeriode;
        });

        return new PeriodeEvaluasiResource(
            $periodeTerkunci->refresh()
        );
    }
}