<?php

namespace App\Http\Controllers;

use App\Http\Requests\Planning\StoreOutputBuktiRequest;
use App\Models\OutputBukti;
use App\Models\RencanaKegiatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

// Output bukti dukung yang ditargetkan verifikator untuk satu kegiatan, opsional dengan berkas contoh
class OutputBuktiController extends Controller
{
    public function store(StoreOutputBuktiRequest $request, RencanaKegiatan $rencanaKegiatan): JsonResponse
    {
        $file = $request->file('contoh');
        $output = new OutputBukti([
            'judul' => trim((string) $request->validated('judul')) ?: Str::limit(basename(str_replace('\\', '/', $file->getClientOriginalName())), 255, ''),
            'jenis' => $request->validated('jenis'),
        ]);
        $output->kegiatan_id = $rencanaKegiatan->id;
        $output->created_by = $request->user()->id;

        if ($file) {
            $storageKey = $file->store("contoh-bukti/{$rencanaKegiatan->id}");

            if (! is_string($storageKey) || $storageKey === '') {
                throw new RuntimeException('Berkas contoh gagal disimpan.');
            }

            $output->contoh_nama = Str::limit(basename(str_replace('\\', '/', $file->getClientOriginalName())), 255, '');
            $output->contoh_storage_key = $storageKey;
            $output->contoh_mime_type = $file->getMimeType();
            $output->contoh_size_bytes = $file->getSize();
        }

        try {
            $output->save();
        } catch (Throwable $exception) {
            if ($output->contoh_storage_key) {
                Storage::disk()->delete($output->contoh_storage_key);
            }

            throw $exception;
        }

        return response()->json(['data' => self::data($output)], 201);
    }

    public function destroy(Request $request, RencanaKegiatan $rencanaKegiatan, OutputBukti $outputBukti): Response
    {
        Gate::forUser($request->user())->authorize('update', $rencanaKegiatan);
        abort_unless($outputBukti->kegiatan_id === $rencanaKegiatan->id, 404);

        $outputBukti->delete();

        if ($outputBukti->contoh_storage_key) {
            Storage::disk()->delete($outputBukti->contoh_storage_key);
        }

        return response()->noContent();
    }

    public function contoh(Request $request, RencanaKegiatan $rencanaKegiatan, OutputBukti $outputBukti): StreamedResponse
    {
        Gate::forUser($request->user())->authorize('view', $rencanaKegiatan);
        abort_unless($outputBukti->kegiatan_id === $rencanaKegiatan->id && $outputBukti->contoh_storage_key, 404);

        $disk = Storage::disk();
        abort_unless($disk->exists($outputBukti->contoh_storage_key), 404);

        return $disk->download($outputBukti->contoh_storage_key, $outputBukti->contoh_nama, [
            'Content-Type' => $outputBukti->contoh_mime_type,
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    // Bentuk JSON satu output, dipakai juga di RencanaKegiatanResource
    public static function data(OutputBukti $output): array
    {
        return [
            'id' => $output->id,
            'judul' => $output->judul,
            'jenis' => $output->jenis,
            'contoh' => $output->contoh_storage_key ? [
                'nama' => $output->contoh_nama,
                'ukuran' => $output->contoh_size_bytes,
            ] : null,
        ];
    }
}
