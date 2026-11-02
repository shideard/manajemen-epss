<?php

namespace App\Http\Controllers;

use App\Http\Requests\Planning\StoreRencanaKegiatanRequest;
use App\Http\Resources\RencanaKegiatanResource;
use App\Models\RencanaKegiatan;
use Illuminate\Http\JsonResponse;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

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

    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', RencanaKegiatan::class);

        $validated = $request->validate([
            'periode_id' => [
                'required',
                'uuid',
                'exists:periode_evaluasi,id',
            ],
        ]);

        $query = RencanaKegiatan::query()
            ->where('periode_id', $validated['periode_id'])
            ->orderBy('tanggal_mulai_rencana')
            ->orderBy('id');

        return RencanaKegiatanResource::collection(
            $query->paginate(5)
        );
    }
}