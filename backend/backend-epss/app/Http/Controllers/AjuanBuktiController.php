<?php

namespace App\Http\Controllers;

use App\Enums\StatusAjuanBukti;
use App\Http\Requests\Evidence\UpdateAjuanBuktiRequest;
use App\Http\Requests\Evidence\VerifyAjuanBuktiRequest;
use App\Http\Resources\AjuanBuktiResource;
use App\Models\AjuanBukti;
use App\Models\IndikatorEPSS;
use App\Models\KegiatanIndikator;
use App\Models\PeriodeEvaluasi;
use App\Models\RencanaKegiatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        $level = $rencanaKegiatan->indikatorMappings()
            ->where('indikator_id', $indikator->id)
            ->value('level');

        abort_if($level === null, 404, 'Indikator tidak dipetakan ke kegiatan ini.');

        $validated = $request->validated();
        $actorId = $request->user()->id;
        $this->pastikanHanyaLevelTarget($validated['checklist'], $level);

        $ajuan = DB::transaction(function () use (
            $rencanaKegiatan,
            $indikator,
            $validated,
            $level,
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
                // Verifikator hanya melihat berkas yang tertaut ke indikator ini, jadi syaratnya per indikator
                abort_unless(
                    $rencanaKegiatan->dokumenBukti()
                        ->where('is_current', true)
                        ->whereHas('indikator', fn ($query) => $query->whereKey($indikator->id))
                        ->exists(),
                    422,
                    "Unggah minimal satu berkas bukti dukung untuk Indikator {$indikator->kode} sebelum mengajukan verifikasi."
                );

                // Setiap output yang ditargetkan untuk indikator ini harus sudah punya berkas versi terbaru
                $belumDiunggah = $rencanaKegiatan->outputDiharapkan()
                    ->whereHas('indikator', fn ($query) => $query->whereKey($indikator->id))
                    ->whereDoesntHave('dokumen', fn ($query) => $query->where('is_current', true))
                    ->orderBy('urutan')
                    ->pluck('judul');
                abort_if(
                    $belumDiunggah->isNotEmpty(),
                    422,
                    "Unggah berkas untuk semua output yang ditargetkan Indikator {$indikator->kode} sebelum mengajukan verifikasi. Belum diunggah: {$belumDiunggah->join(', ')}."
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

    // Verifikator: setujui (level = level target pemetaan), atau kembalikan ke operator dengan catatan
    public function verify(
        VerifyAjuanBuktiRequest $request,
        AjuanBukti $ajuanBukti
    ): JsonResponse {
        $validated = $request->validated();
        $actorId = $request->user()->id;
        $level = KegiatanIndikator::query()
            ->where('kegiatan_id', $ajuanBukti->kegiatan_id)
            ->where('indikator_id', $ajuanBukti->indikator_id)
            ->value('level');

        abort_if($level === null, 409, 'Indikator ini sudah tidak dipetakan ke kegiatannya.');
        $this->pastikanHanyaLevelTarget($validated['checklist'], $level);

        $ajuan = DB::transaction(function () use (
            $ajuanBukti,
            $validated,
            $level,
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
            $ajuan->level = $disetujui ? $level : null;
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

    // Verifikator: cabut status terverifikasi, ajuan kembali ke operator sebagai perbaikan dengan alasan
    public function revoke(Request $request, AjuanBukti $ajuanBukti): JsonResponse
    {
        Gate::forUser($request->user())->authorize('verify', $ajuanBukti);
        $catatan = trim($request->validate(['catatan' => ['required', 'string', 'max:2000']])['catatan']);

        $ajuan = DB::transaction(function () use ($ajuanBukti, $catatan, $request): AjuanBukti {
            $ajuan = AjuanBukti::query()->lockForUpdate()->findOrFail($ajuanBukti->id);

            abort_if(
                $ajuan->status !== StatusAjuanBukti::TERVERIFIKASI,
                409,
                'Hanya ajuan terverifikasi yang dapat dicabut.'
            );

            // Checklist dipertahankan supaya operator tinggal memperbaiki bagian yang dicatat
            $ajuan->status = StatusAjuanBukti::PERBAIKAN;
            $ajuan->level = null;
            $ajuan->catatan = $catatan;
            $ajuan->diverifikasi_oleh = $request->user()->id;
            $ajuan->diverifikasi_pada = now();
            $ajuan->save();

            return $ajuan;
        });

        return (new AjuanBuktiResource(
            $ajuan->refresh()->load(['indikator:id,kode', 'pengaju:id,name', 'verifikator:id,name'])
        ))->response();
    }

    // Checklist hanya boleh berisi level yang ditargetkan verifikator untuk kegiatan ini
    private function pastikanHanyaLevelTarget(array $checklist, int $level): void
    {
        abort_if(
            array_diff(array_map('strval', array_keys($checklist)), [(string) $level]) !== [],
            422,
            "Checklist hanya boleh diisi untuk Level {$level}."
        );
    }
}
