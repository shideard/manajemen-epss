<?php

namespace App\Http\Controllers;

use App\Http\Requests\Evidence\StoreDokumenBuktiRequest;
use App\Models\DokumenBukti;
use App\Models\RencanaKegiatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class DokumenBuktiController extends Controller
{
    public function index(
        Request $request,
        RencanaKegiatan $rencanaKegiatan
    ): JsonResponse {
        Gate::forUser($request->user())
            ->authorize('view', $rencanaKegiatan);

        $documents = $rencanaKegiatan
            ->dokumenBukti()
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->map(fn (DokumenBukti $document): array => [
                'id' => $document->id,
                'kegiatan_id' => $document->kegiatan_id,
                'uploaded_by' => $document->uploaded_by,
                'parent_document_id' => $document->parent_document_id,
                'version_number' => $document->version_number,
                'is_current' => $document->is_current,
                'evidence_date' => $document->evidence_date->toDateString(),
                'nama_file' => $document->nama_file,
                'mime_type' => $document->mime_type,
                'size_bytes' => $document->size_bytes,
                'uploaded_at' => $document->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'data' => $documents,
        ]);
    }

    public function store(
        StoreDokumenBuktiRequest $request,
        RencanaKegiatan $rencanaKegiatan
    ): JsonResponse {
        $file = $request->file('file');
        $disk = Storage::disk('local');
        $storageKey = $file->store(
            "bukti/{$rencanaKegiatan->id}",
            'local'
        );

        if (! is_string($storageKey) || $storageKey === '') {
            throw new RuntimeException('File bukti gagal disimpan.');
        }

        try {
            $document = DB::transaction(function () use (
                $request,
                $rencanaKegiatan,
                $file,
                $storageKey
            ): DokumenBukti {
                $originalName = basename(
                    str_replace('\\', '/', $file->getClientOriginalName())
                );
                $originalName = Str::limit($originalName, 255, '');

                $document = new DokumenBukti();
                $document->forceFill([
                    'uploaded_by' => $request->user()->id,
                    'version_number' => 1,
                    'is_current' => true,
                    'parent_document_id' => null,
                    'evidence_date' => $request->validated('evidence_date'),
                    'nama_file' => $originalName,
                    'storage_key' => $storageKey,
                    'mime_type' => $file->getMimeType(),
                    'size_bytes' => $file->getSize(),
                    'sha256_hash' => hash_file(
                        'sha256',
                        $file->getRealPath()
                    ),
                ]);

                $rencanaKegiatan->dokumenBukti()->save($document);

                return $document->refresh();
            });
        } catch (Throwable $exception) {
            $disk->delete($storageKey);

            throw $exception;
        }

        return response()->json([
            'data' => [
                'id' => $document->id,
                'kegiatan_id' => $document->kegiatan_id,
                'uploaded_by' => $document->uploaded_by,
                'evidence_date' => $document->evidence_date->toDateString(),
                'nama_file' => $document->nama_file,
                'mime_type' => $document->mime_type,
                'size_bytes' => $document->size_bytes,
                'version_number' => $document->version_number,
                'is_current' => $document->is_current,
            ],
        ], 201);
    }

    public function download(
    Request $request,
    RencanaKegiatan $rencanaKegiatan,
    DokumenBukti $dokumenBukti) 
    {
        Gate::forUser($request->user())
            ->authorize('view', $rencanaKegiatan);

        // Batasi dokumen ke kegiatan pada URL agar ID dokumen
        // kegiatan lain tidak bisa digunakan untuk mengunduh file.
        $document = $rencanaKegiatan
            ->dokumenBukti()
            ->findOrFail($dokumenBukti->id);

        $disk = Storage::disk('local');

        abort_unless(
            $disk->exists($document->storage_key),
            404
        );

        return $disk->download(
            $document->storage_key,
            $document->nama_file,
            [
                'Content-Type' => $document->mime_type,
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store',
            ]
        );
    }
}