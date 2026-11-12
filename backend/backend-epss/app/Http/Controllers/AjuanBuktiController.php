<?php

namespace App\Http\Controllers;

use App\Enums\StatusAjuanBukti;
use App\Http\Requests\Evidence\UpdateAjuanBuktiRequest;
use App\Http\Requests\Evidence\VerifyAjuanBuktiRequest;
use App\Http\Resources\AjuanBuktiResource;
use App\Models\AjuanBukti;
use App\Models\IndikatorEPSS;
use App\Models\PeriodeEvaluasi;
use App\Models\RencanaKegiatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class AjuanBuktiController extends Controller
{
    // Semua ajuan pada satu periode (tanpa paginasi: dipakai untuk peta status di frontend)
    public function index(PeriodeEvaluasi $periode): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', AjuanBukti::class);
        Gate::authorize('view', $periode);

        $ajuan = AjuanBukti::query()
            ->with([
                'indikator:id,kode',
                'pengaju:id,name',
                'verifikator:id,name',
            ])
            ->whereHas('kegiatan', function ($query) use ($periode) {
                $query->where('periode_id', $periode->id);
            })
            ->orderBy('diajukan_pada')
            ->orderBy('id')
            ->get();

        return AjuanBuktiResource::collection($ajuan);
    }

    // Operator (PIC): simpan checklist sebagai draft, atau ajukan ke verifikator
    public function update(
        UpdateAjuanBuktiRequest $request,
        RencanaKegiatan $rencanaKegiatan,
        IndikatorEPSS $indikator
    ): JsonResponse {
        abort_unless(
            $rencanaKegiatan->indikatorMappings()
                ->where('indikator_id', $indikator->id)
                ->exists(),
            404,
            'Indikator tidak dipetakan ke kegiatan ini.'
        );

        $validated = $request->validated();
        $actorId = $request->user()->id;

        $ajuan = DB::transaction(function () use (
            $rencanaKegiatan,
            $indikator,
            $validated,
            $actorId
        ): AjuanBukti {
            $ajuan = AjuanBukti::query()
                ->lockForUpdate()
                ->firstOrNew([
                    'kegiatan_id' => $rencanaKegiatan->id,
                    'indikator_id' => $indikator->id,
                ]);

            abort_if(
                in_array($ajuan->status, [
                    StatusAjuanBukti::MENUNGGU,
                    StatusAjuanBukti::TERVERIFIKASI,
                ], true),
                409,
                'Ajuan yang menunggu verifikasi atau sudah terverifikasi tidak dapat diubah.'
            );

            $ajuan->checklist = $validated['checklist'];

            if ($validated['ajukan']) {
                // ponytail: kelengkapan persyaratan level 1 masih diperiksa di frontend;
                // pindahkan ke sini saat persyaratan_bukti dipakai frontend
                abort_unless(
                    $rencanaKegiatan->dokumenBukti()
                        ->where('is_current', true)
                        ->exists(),
                    422,
                    'Unggah minimal satu berkas bukti dukung sebelum mengajukan verifikasi.'
                );

                $ajuan->status = StatusAjuanBukti::MENUNGGU;
                $ajuan->diajukan_oleh = $actorId;
                $ajuan->diajukan_pada = now();
            }

            $ajuan->save();

            return $ajuan;
        });

        return (new AjuanBuktiResource(
            $ajuan->refresh()->load(['indikator:id,kode', 'pengaju:id,name', 'verifikator:id,name'])
        ))->response();
    }

    // Verifikator: setujui dengan level, atau kembalikan ke operator dengan catatan
    public function verify(
        VerifyAjuanBuktiRequest $request,
        AjuanBukti $ajuanBukti
    ): JsonResponse {
        $validated = $request->validated();
        $actorId = $request->user()->id;

        $ajuan = DB::transaction(function () use (
            $ajuanBukti,
            $validated,
            $actorId
        ): AjuanBukti {
            $ajuan = AjuanBukti::query()
                ->lockForUpdate()
                ->findOrFail($ajuanBukti->id);

            abort_if(
                $ajuan->status !== StatusAjuanBukti::MENUNGGU,
                409,
                'Hanya ajuan yang menunggu verifikasi yang dapat diputuskan.'
            );

            $disetujui = $validated['keputusan'] === StatusAjuanBukti::TERVERIFIKASI->value;

            $ajuan->status = StatusAjuanBukti::from($validated['keputusan']);
            $ajuan->checklist = $validated['checklist'];
            $ajuan->level = $disetujui ? $validated['level'] : null;
            $ajuan->catatan = $disetujui ? null : trim($validated['catatan']);
            $ajuan->diverifikasi_oleh = $actorId;
            $ajuan->diverifikasi_pada = now();
            $ajuan->save();

            return $ajuan;
        });

        return (new AjuanBuktiResource(
            $ajuan->refresh()->load(['indikator:id,kode', 'pengaju:id,name', 'verifikator:id,name'])
        ))->response();
    }
}
