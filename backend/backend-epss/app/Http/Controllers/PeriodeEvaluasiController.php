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
use App\Http\Requests\Periode\UpdatePeriodeEvaluasiRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;


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

    public function show(PeriodeEvaluasi $periode): PeriodeEvaluasiResource 
    {
        Gate::authorize('view', $periode);

        $periode->load('versiInstrumen');

        return new PeriodeEvaluasiResource($periode);
    }

    public function update(UpdatePeriodeEvaluasiRequest $request, PeriodeEvaluasi $periode): PeriodeEvaluasiResource 
    {
        $validated = $request->validated();

        $updatedPeriode = DB::transaction(function () use (
            $periode,
            $validated
        ): PeriodeEvaluasi {
            $lockedPeriode = PeriodeEvaluasi::query()
                ->lockForUpdate()
                ->findOrFail($periode->id);

            abort_if(
                $lockedPeriode->status === StatusPeriode::TERKUNCI,
                409,
                'Periode terkunci harus dibuka kembali sebelum diedit.'
            );

            $effective = array_replace([
                'tahun_mulai' => $lockedPeriode->tahun_mulai,
                'tahun_selesai' => $lockedPeriode->tahun_selesai,
                'tanggal_mulai' => $lockedPeriode->tanggal_mulai?->toDateString(),
                'tanggal_selesai' => $lockedPeriode->tanggal_selesai?->toDateString(),
            ], $validated);

            Validator::make($effective, [
                'tahun_selesai' => [
                    'gte:tahun_mulai',
                ],
                'tanggal_selesai' => [
                    'nullable',
                    'date_format:Y-m-d',
                    Rule::when(
                        $effective['tanggal_mulai'] !== null,
                        ['after_or_equal:tanggal_mulai']
                    ),
                ],
            ])->validate();

            $lockedPeriode->fill($validated);
            $lockedPeriode->save();

            return $lockedPeriode;
        });

        return new PeriodeEvaluasiResource(
            $updatedPeriode->refresh()->load('versiInstrumen')
        );
    }
}
