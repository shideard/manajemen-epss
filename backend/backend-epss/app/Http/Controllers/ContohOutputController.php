<?php

namespace App\Http\Controllers;

use App\Models\RencanaKegiatan;
use App\Models\RencanaKegiatanOutput;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

// Berkas contoh untuk satu output bukti dukung yang ditargetkan: diunggah verifikator, diunduh operator sebagai acuan
class ContohOutputController extends Controller
{
    public function store(Request $request, RencanaKegiatan $rencanaKegiatan, RencanaKegiatanOutput $output): Response
    {
        Gate::authorize('manageOutputs', $rencanaKegiatan);
        abort_unless($output->kegiatan_id === $rencanaKegiatan->id, 404);

        $file = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png', 'max:10240'],
        ])['file'];

        $storageKey = $file->store("contoh-output/{$rencanaKegiatan->id}");

        if (! is_string($storageKey) || $storageKey === '') {
            throw new RuntimeException('Berkas contoh gagal disimpan.');
        }

        $lama = $output->contoh_storage_key;

        try {
            $output->update([
                'contoh_nama' => Str::limit(basename(str_replace('\\', '/', $file->getClientOriginalName())), 255, ''),
                'contoh_storage_key' => $storageKey,
                'contoh_mime_type' => $file->getMimeType(),
                'contoh_size_bytes' => $file->getSize(),
            ]);
        } catch (Throwable $exception) {
            Storage::disk()->delete($storageKey);

            throw $exception;
        }

        if ($lama) {
            Storage::disk()->delete($lama);
        }

        return response()->noContent();
    }

    public function show(RencanaKegiatan $rencanaKegiatan, RencanaKegiatanOutput $output): StreamedResponse
    {
        Gate::authorize('view', $rencanaKegiatan);
        abort_unless($output->kegiatan_id === $rencanaKegiatan->id && $output->contoh_storage_key, 404);

        $disk = Storage::disk();
        abort_unless($disk->exists($output->contoh_storage_key), 404);

        return $disk->download($output->contoh_storage_key, $output->contoh_nama, [
            'Content-Type' => $output->contoh_mime_type,
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
