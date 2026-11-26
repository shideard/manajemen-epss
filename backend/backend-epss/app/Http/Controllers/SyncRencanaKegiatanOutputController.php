<?php

namespace App\Http\Controllers;

use App\Enums\StatusAjuanBukti;
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

                // Berkas output ikut indikatornya, jadi tautan berkas untuk ajuan yang sedang/sudah diverifikasi tidak boleh berubah
                // (aturan yang sama dengan DokumenBuktiController::aturIndikator)
                if ($baris->exists && $baris->dokumen()->exists()) {
                    $saatIni = $baris->indikator()->pluck('indikator_epss.id')->all();
                    $berubah = array_merge(array_diff($saatIni, $indikatorIds), array_diff($indikatorIds, $saatIni));
                    abort_if(
                        $berubah !== [] && $rencanaKegiatan->ajuanBukti()
                            ->whereIn('indikator_id', $berubah)
                            ->whereIn('status', [StatusAjuanBukti::MENUNGGU->value, StatusAjuanBukti::TERVERIFIKASI->value])
                            ->exists(),
                        409,
                        "Output \"{$baris->judul}\" sudah punya berkas untuk indikator dengan ajuan yang menunggu verifikasi atau sudah terverifikasi, indikatornya tidak dapat ditambah atau dilepas."
                    );
                }

                $baris->indikator()->sync($indikatorIds);
                // Berkas yang diunggah untuk output ini (semua versi) mengikuti indikator output-nya:
                // satu delete + satu insert ke pivot, bukan sync() per berkas
                $dokumenIds = DokumenBukti::query()->where('output_id', $baris->id)->pluck('id');
                if ($dokumenIds->isNotEmpty()) {
                    DB::table('dokumen_bukti_indikator')->whereIn('dokumen_id', $dokumenIds)->delete();
                    DB::table('dokumen_bukti_indikator')->insert(
                        $dokumenIds->crossJoin(array_values(array_unique($indikatorIds)))
                            ->map(fn (array $pasangan): array => ['dokumen_id' => $pasangan[0], 'indikator_id' => $pasangan[1]])
                            ->all()
                    );
                }
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
