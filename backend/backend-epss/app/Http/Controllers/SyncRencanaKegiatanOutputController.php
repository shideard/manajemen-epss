<?php

namespace App\Http\Controllers;

use App\Http\Requests\Planning\SyncRencanaKegiatanOutputRequest;
use App\Models\RencanaKegiatan;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class SyncRencanaKegiatanOutputController extends Controller
{
    public function __invoke(
        SyncRencanaKegiatanOutputRequest $request,
        RencanaKegiatan $rencanaKegiatan
    ): Response {
        $outputs = $request->validated('output');

        DB::transaction(function () use (
            $rencanaKegiatan,
            $outputs
        ): void {
            $rencanaKegiatan
                ->outputDiharapkan()
                ->delete();

            foreach ($outputs as $urutan => $output) {
                $rencanaKegiatan->outputDiharapkan()->create([
                    'judul' => $output['judul'],
                    'jenis' => $output['jenis'] ?? null,
                    'contoh_nama' => $output['contoh']['nama'] ?? null,
                    'urutan' => $urutan,
                ]);
            }
        });

        return response()->noContent();
    }
}