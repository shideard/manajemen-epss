<?php

namespace App\Http\Controllers;

use App\Enums\StatusPeriode;
use App\Http\Resources\PeriodeEvaluasiResource;
use App\Models\PeriodeEvaluasi;
use App\Http\Requests\Periode\StorePeriodeEvaluasiRequest;
use App\Enums\StatusVersiInstrumen;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;


class PeriodeEvaluasiController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', PeriodeEvaluasi::class);

        $periode = PeriodeEvaluasi::query()
            ->whereIn('status', [
                StatusPeriode::AKTIF->value,
                StatusPeriode::TERKUNCI->value,
            ])
            ->orderByDesc('tahun_mulai')
            ->orderByDesc('tanggal_mulai')
            ->orderBy('id')
            ->paginate(6);

        return PeriodeEvaluasiResource::collection($periode);
    }

    public function store(StorePeriodeEvaluasiRequest $request): JsonResponse 
    {
        $validated = $request->validated();

        $periode = DB::transaction(function () use (
            $validated
        ): PeriodeEvaluasi {
            $versi = VersiInstrumenEPSS::query()
                ->lockForUpdate()
                ->findOrFail($validated['versi_instrumen_id']);

            if ($versi->status === StatusVersiInstrumen::ARCHIVED) {
                $versi->status = StatusVersiInstrumen::ACTIVE;
                $versi->save();
            }

            $periode = new PeriodeEvaluasi($validated);
            $periode->status = StatusPeriode::DRAFT;
            $periode->save();

            return $periode;
        });

        return (new PeriodeEvaluasiResource($periode->refresh()))
            ->response()
        ->setStatusCode(201);
    }

    public function managementIndex(): AnonymousResourceCollection
    {
        Gate::authorize('viewManagement', PeriodeEvaluasi::class);

        $periode = PeriodeEvaluasi::query()
            ->orderByDesc('tahun_mulai')
            ->orderByDesc('tanggal_mulai')
            ->orderBy('id')
            ->paginate(7);

        return PeriodeEvaluasiResource::collection($periode);
    }
}
