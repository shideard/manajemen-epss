<?php

namespace App\Http\Controllers;

use App\Http\Requests\Planning\StoreRencanaKegiatanRequest;
use App\Http\Resources\RencanaKegiatanResource;
use App\Models\RencanaKegiatan;
use Illuminate\Http\JsonResponse;

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
}