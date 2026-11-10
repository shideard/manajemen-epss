<?php

namespace App\Http\Controllers;

use App\Enums\StatusAjuanBukti;
use App\Http\Requests\Planning\StoreRencanaKegiatanRequest;
use App\Http\Resources\RencanaKegiatanResource;
use App\Models\RencanaKegiatan;
use Illuminate\Http\JsonResponse;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\Planning\UpdateRencanaKegiatanRequest;
use App\Http\Requests\Planning\SyncKegiatanIndikatorRequest;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class RencanaKegiatanController extends Controller
{
    public function store(
        StoreRencanaKegiatanRequest $request
    ): JsonResponse {
        $kegiatan = new RencanaKegiatan($request->validated());
        $kegiatan->created_by = $request->user()->id;
        $kegiatan->save();

        return (new RencanaKegiatanResource($kegiatan))
            ->response()
            ->setStatusCode(201);
    }

    public function show(RencanaKegiatan $rencanaKegiatan): JsonResponse
    {
        Gate::authorize('view', $rencanaKegiatan);

        $rencanaKegiatan->load([
            'opd:id,nama',
            'pic:id,name',
            'indikatorMappings.indikator:id,kode,nama',
        ]);

        return (new RencanaKegiatanResource($rencanaKegiatan))
            ->response();
    }

    public function update(UpdateRencanaKegiatanRequest $request, RencanaKegiatan $rencanaKegiatan): JsonResponse 
    {
        $rencanaKegiatan->fill($request->validated());
        $rencanaKegiatan->save();

        $rencanaKegiatan->load([
            'opd:id,nama',
            'pic:id,name',
        ]);

        return (new RencanaKegiatanResource($rencanaKegiatan))
            ->response();
    }

    public function destroy(Request $request, RencanaKegiatan $rencanaKegiatan) 
    {
        Gate::forUser($request->user())
            ->authorize('delete', $rencanaKegiatan);

        $rencanaKegiatan->delete();

        return response()->noContent();
    }

    public function syncIndikator(SyncKegiatanIndikatorRequest $request, RencanaKegiatan $rencanaKegiatan): Response 
    {
        $indikatorIds = $request->validated('indikator_ids');
        $levels = $request->validated('levels', []);
        $userId = $request->user()->id;

        DB::transaction(function () use (
            $rencanaKegiatan,
            $indikatorIds,
            $levels,
            $userId
        ): void {
            // indikator_id => level yang tersimpan
            $levelSaatIni = $rencanaKegiatan
                ->indikatorMappings()
                ->lockForUpdate()
                ->pluck('level', 'indikator_id')
                ->all();
            $indikatorSaatIni = array_keys($levelSaatIni);

            $indikatorUntukDihapus = array_diff(
                $indikatorSaatIni,
                $indikatorIds
            );

            // Ajuan yang sedang/sudah diverifikasi terikat pada level-nya: pemetaannya tidak boleh dilepas atau diubah levelnya
            $levelBerubah = array_filter(
                array_intersect($indikatorSaatIni, $indikatorIds),
                fn ($id) => (int) ($levels[$id] ?? 1) !== (int) $levelSaatIni[$id]
            );
            $terkunci = $rencanaKegiatan->ajuanBukti()
                ->whereIn('indikator_id', [...$indikatorUntukDihapus, ...$levelBerubah])
                ->whereIn('status', [
                    StatusAjuanBukti::MENUNGGU->value,
                    StatusAjuanBukti::TERVERIFIKASI->value,
                ])
                ->exists();

            abort_if(
                $terkunci,
                409,
                'Indikator dengan ajuan yang menunggu verifikasi atau sudah terverifikasi tidak dapat dilepas atau diubah levelnya.'
            );

            foreach ($levelBerubah as $indikatorId) {
                $rencanaKegiatan->indikatorMappings()
                    ->where('indikator_id', $indikatorId)
                    ->update(['level' => $levels[$indikatorId] ?? 1]);
            }

            if ($indikatorUntukDihapus !== []) {
                $rencanaKegiatan
                    ->indikatorMappings()
                    ->whereIn('indikator_id', $indikatorUntukDihapus)
                    ->delete();
            }

            $indikatorUntukDitambahkan = array_diff(
                $indikatorIds,
                $indikatorSaatIni
            );

            foreach ($indikatorUntukDitambahkan as $indikatorId) {
                $rencanaKegiatan->indikatorMappings()->create([
                    'indikator_id' => $indikatorId,
                    'level' => $levels[$indikatorId] ?? 1,
                    'created_by' => $userId,
                ]);
            }
        });

        return response()->noContent();
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', RencanaKegiatan::class);

        $validated = $request->validate([
            'periode_id' => [
                'required',
                'uuid',
                'exists:periode_evaluasi,id',
            ],

            'q' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'tahun' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1900',
                'max:9999',
            ],

            'opd_id' => [
                'sometimes',
                'nullable',
                'uuid',
                'exists:opds,id',
            ],

            'pic_user_id' => [
                'sometimes',
                'nullable',
                'uuid',
                'exists:users,id',
            ],

            'status' => [
                'sometimes',
                'nullable',
                'in:BELUM_MULAI,BERJALAN,SELESAI',
            ],
        ]);

        $query = RencanaKegiatan::query()
            ->with([
                'opd:id,nama',
                'pic:id,name',
            ])
            ->where('periode_id', $validated['periode_id'])
            ->orderBy('tanggal_mulai_rencana')
            ->orderBy('id');

        if (isset($validated['opd_id'])) {
            $query->where('opd_id', $validated['opd_id']);
        }

        if (isset($validated['pic_user_id'])) {
            $query->where('pic_user_id', $validated['pic_user_id']);
        }

        if (isset($validated['tahun'])) {
            $query->where('tahun_kegiatan', $validated['tahun']);
        }

        $today = today()->toDateString();

        if (($validated['status'] ?? null) === 'BELUM_MULAI') {
            $query->whereDate('tanggal_mulai_rencana', '>', $today);
        }

        if (($validated['status'] ?? null) === 'BERJALAN') {
            $query
                ->whereDate('tanggal_mulai_rencana', '<=', $today)
                ->whereDate('tanggal_selesai_rencana', '>=', $today);
        }

        if (($validated['status'] ?? null) === 'SELESAI') {
            $query->whereDate('tanggal_selesai_rencana', '<', $today);
        }

        $search = trim($validated['q'] ?? '');

        if ($search !== '') {
            $pattern = '%' . $search . '%';

            $query->where(function ($searchQuery) use ($pattern) {
                $searchQuery
                    ->where('nama_kegiatan', 'ilike', $pattern)
                    ->orWhere('deskripsi', 'ilike', $pattern)
                    ->orWhereHas('opd', function ($opdQuery) use ($pattern) {
                        $opdQuery->where('nama', 'ilike', $pattern);
                    })
                    ->orWhereHas('pic', function ($picQuery) use ($pattern) {
                        $picQuery->where('name', 'ilike', $pattern);
                    });
            });
        }

        return RencanaKegiatanResource::collection(
            $query->paginate(5)
        );
    }
}