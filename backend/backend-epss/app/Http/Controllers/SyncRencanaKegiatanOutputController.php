<?php

namespace App\Http\Controllers;

use App\Http\Requests\Planning\SyncRencanaKegiatanOutputRequest;
use App\Models\DokumenBukti;
use App\Models\RencanaKegiatan;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SyncRencanaKegiatanOutputController extends Controller
{
    public function __invoke(
        SyncRencanaKegiatanOutputRequest $request,
        RencanaKegiatan $rencanaKegiatan
    ): Response {
        $outputs = $request->validated('output');

        // Output yang membawa id dipertahankan (berikut berkas contohnya); sisanya dibuat baru atau dihapus
        $berkasDihapus = DB::transaction(function () use (
            $rencanaKegiatan,
            $outputs
        ): array {
            $tersimpan = $rencanaKegiatan
                ->outputDiharapkan()
                ->lockForUpdate()
                ->get()
                ->keyBy('id');
            $dipertahankan = [];
            $berkasDihapus = [];

            foreach ($outputs as $urutan => $output) {
                $baris = $tersimpan->get($output['id'] ?? '')
                    ?? $rencanaKegiatan->outputDiharapkan()->make();
                $contohNama = $output['contoh']['nama'] ?? null;

                // Contoh dilepas atau diganti nama: berkas lamanya tidak berlaku lagi
                if ($baris->contoh_storage_key && $contohNama !== $baris->contoh_nama) {
                    $berkasDihapus[] = $baris->contoh_storage_key;
                    $baris->contoh_storage_key = null;
                    $baris->contoh_mime_type = null;
                    $baris->contoh_size_bytes = null;
                }

                $baris->fill([
                    'judul' => $output['judul'],
                    'jenis' => $output['jenis'] ?? null,
                    'contoh_nama' => $contohNama,
                    'urutan' => $urutan,
                ])->save();
                $indikatorIds = $output['indikator_ids'] ?? [];
                $baris->indikator()->sync($indikatorIds);
                // Berkas yang diunggah untuk output ini mengikuti indikator output-nya
                DokumenBukti::query()
                    ->where('output_id', $baris->id)
                    ->get()
                    ->each(fn (DokumenBukti $dokumen) => $dokumen->indikator()->sync($indikatorIds));
                $dipertahankan[] = $baris->id;
            }

            foreach ($tersimpan->except($dipertahankan) as $baris) {
                if ($baris->contoh_storage_key) {
                    $berkasDihapus[] = $baris->contoh_storage_key;
                }
                $baris->delete();
            }

            return $berkasDihapus;
        });

        Storage::disk()->delete($berkasDihapus);

        return response()->noContent();
    }
}
