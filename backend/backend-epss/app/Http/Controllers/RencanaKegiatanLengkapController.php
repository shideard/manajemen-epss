<?php

namespace App\Http\Controllers;

use App\Http\Resources\RencanaKegiatanResource;
use App\Models\PeriodeEvaluasi;
use App\Models\RencanaKegiatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

// Semua kegiatan satu periode lengkap dengan indikator, output, dan dokumen bukti (semua versi) dalam satu request.
// Isi tiap kegiatan = GET /rencana-kegiatan/{id} + 'dokumen' = GET /rencana-kegiatan/{id}/dokumen-bukti,
// supaya halaman tidak perlu 2 request per kegiatan.
class RencanaKegiatanLengkapController extends Controller
{
    public function __invoke(Request $request, PeriodeEvaluasi $periode): JsonResponse
    {
        // Izin sama dengan daftar kegiatan (index) dan detailnya (show)
        Gate::authorize('viewAny', RencanaKegiatan::class);
        Gate::authorize('view', $periode);

        $kegiatan = RencanaKegiatan::query()
            ->where('periode_id', $periode->id)
            ->with([
                'opd:id,nama',
                'pic:id,name',
                'indikatorMappings.indikator:id,kode,nama',
                'outputDiharapkan.indikator:id',
                'dokumenBukti' => fn ($query) => $query->orderBy('created_at')->orderBy('id'),
                'dokumenBukti.indikator:id',
            ])
            ->orderBy('tanggal_mulai_rencana')
            ->orderBy('id')
            ->get();

        $dokumen = DokumenBuktiController::petakan($kegiatan->flatMap->dokumenBukti)->groupBy('kegiatan_id');

        return response()->json([
            'data' => $kegiatan->map(fn (RencanaKegiatan $item): array => [
                ...(new RencanaKegiatanResource($item))->resolve($request),
                'dokumen' => $dokumen->get($item->id, collect())->values(),
            ]),
        ]);
    }
}
