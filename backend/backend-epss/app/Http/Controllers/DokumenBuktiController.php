<?php

namespace App\Http\Controllers;

use App\Enums\StatusAjuanBukti;
use App\Enums\StatusPeriode;
use App\Http\Requests\Evidence\StoreDokumenBuktiRequest;
use App\Models\DokumenBukti;
use App\Models\RencanaKegiatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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
            ->get();

        // Tautan berbagi storage_key dengan berkas aslinya: baris tertua (kegiatan belum dihapus) = asli
        $asli = DokumenBukti::query()
            ->whereIn('storage_key', $documents->pluck('storage_key'))
            ->whereHas('kegiatan')
            ->with('kegiatan:id,nama_kegiatan')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->groupBy('storage_key')
            ->map->first();

        $sumberDari = function (DokumenBukti $document) use ($asli): ?array {
            $sumber = $asli[$document->storage_key] ?? null;

            return $sumber && $sumber->id !== $document->id ? [
                'dokumen_id' => $sumber->id,
                'kegiatan_id' => $sumber->kegiatan_id,
                'nama_kegiatan' => $sumber->kegiatan->nama_kegiatan,
            ] : null;
        };

        $documents = $documents
            ->map(fn (DokumenBukti $document): array => [
                'sumber' => $sumberDari($document),
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

    public function link(
        Request $request,
        RencanaKegiatan $rencanaKegiatan,
        DokumenBukti $dokumenBukti
    ): JsonResponse {
        $document = DB::transaction(function () use (
            $request,
            $rencanaKegiatan,
            $dokumenBukti
        ): DokumenBukti {
            $target = RencanaKegiatan::query()
                ->lockForUpdate()
                ->findOrFail($rencanaKegiatan->id);
            Gate::forUser($request->user())
                ->authorize('uploadEvidence', $target);

            $source = DokumenBukti::query()
                ->lockForUpdate()
                ->findOrFail($dokumenBukti->id);
            Gate::forUser($request->user())
                ->authorize('view', $source->kegiatan);

            abort_if(
                $source->kegiatan_id === $target->id,
                422,
                'Berkas sudah terhubung ke kegiatan ini.'
            );
            abort_unless(
                $source->is_current,
                409,
                'Hanya berkas versi terbaru yang dapat dikaitkan.'
            );
            abort_unless(
                Storage::disk()->exists($source->storage_key),
                404,
                'Berkas sumber tidak ditemukan.'
            );
            abort_if(
                $target->dokumenBukti()
                    ->where('is_current', true)
                    ->where('sha256_hash', $source->sha256_hash)
                    ->exists(),
                409,
                'Berkas yang sama sudah ada pada kegiatan ini.'
            );

            $linked = new DokumenBukti();
            $linked->forceFill([
                'uploaded_by' => $request->user()->id,
                'parent_document_id' => null,
                'version_number' => 1,
                'is_current' => true,
                'evidence_date' => $source->evidence_date,
                'nama_file' => $source->nama_file,
                'storage_key' => $source->storage_key,
                'mime_type' => $source->mime_type,
                'size_bytes' => $source->size_bytes,
                'sha256_hash' => $source->sha256_hash,
            ]);
            $target->dokumenBukti()->save($linked);

            return $linked->refresh();
        });

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

    public function store(
        StoreDokumenBuktiRequest $request,
        RencanaKegiatan $rencanaKegiatan
    ): JsonResponse {
        $file = $request->file('file');
        $disk = Storage::disk();
        $storageKey = $file->store("bukti/{$rencanaKegiatan->id}");

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

        $disk = Storage::disk();

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

    // Lepas tautan: berkas hilang dari kegiatan ini saja; kegiatan lain yang memakainya tetap utuh.
    public function unlink(
        Request $request,
        RencanaKegiatan $rencanaKegiatan,
        DokumenBukti $dokumenBukti
    ): Response {
        $kunciStorage = DB::transaction(function () use ($request, $rencanaKegiatan, $dokumenBukti): array {
            $document = $rencanaKegiatan->dokumenBukti()->lockForUpdate()->findOrFail($dokumenBukti->id);

            return $this->hapusDariKegiatan($request, $document);
        });
        $this->bersihkanStorage($kunciStorage);

        return response()->noContent();
    }

    // Hapus berkas: semua salinan tautan berkas yang sama di kegiatan lain ikut terhapus.
    public function destroy(
        Request $request,
        RencanaKegiatan $rencanaKegiatan,
        DokumenBukti $dokumenBukti
    ): Response {
        $kunciStorage = DB::transaction(function () use ($request, $rencanaKegiatan, $dokumenBukti): array {
            $document = $rencanaKegiatan->dokumenBukti()->lockForUpdate()->findOrFail($dokumenBukti->id);
            abort_unless($document->is_current, 409, 'Hanya berkas versi terbaru yang dapat dihapus.');
            $salinan = DokumenBukti::query()
                ->where('storage_key', $document->storage_key)
                ->where('is_current', true)
                ->lockForUpdate()
                ->get();

            // Cek semua kegiatan dulu supaya tidak ada yang terhapus separuh
            foreach ($salinan as $item) {
                $this->pastikanBolehHapus($request, $item->kegiatan);
            }

            return $salinan->flatMap(fn (DokumenBukti $item) => $this->hapusDariKegiatan($request, $item))->all();
        });
        $this->bersihkanStorage($kunciStorage);

        return response()->noContent();
    }

    private function pastikanBolehHapus(Request $request, RencanaKegiatan $kegiatan): void
    {
        abort_if(
            $kegiatan->periode()->where('status', StatusPeriode::TERKUNCI->value)->exists(),
            409,
            'Periode sudah dikunci, berkas tidak dapat dihapus.'
        );
        abort_if(
            $kegiatan->ajuanBukti()->where('status', StatusAjuanBukti::TERVERIFIKASI->value)->exists(),
            409,
            "Bukti dukung \"{$kegiatan->nama_kegiatan}\" sudah diverifikasi, berkas tidak dapat dihapus."
        );
        Gate::forUser($request->user())->authorize('uploadEvidence', $kegiatan);
    }

    // Hapus versi terbaru beserta riwayat versinya di kegiatan itu; mengembalikan storage_key yang terlepas.
    private function hapusDariKegiatan(Request $request, DokumenBukti $document): array
    {
        abort_unless($document->is_current, 409, 'Hanya berkas versi terbaru yang dapat dihapus.');
        $this->pastikanBolehHapus($request, $document->kegiatan);

        // Berkas yang sedang diverifikasi berubah: ajuan yang menunggu ditarik kembali ke draft
        $document->kegiatan->ajuanBukti()
            ->where('status', StatusAjuanBukti::MENUNGGU->value)
            ->update([
                'status' => StatusAjuanBukti::DRAFT->value,
                'diajukan_oleh' => null,
                'diajukan_pada' => null,
            ]);

        $kunci = [];
        // Dari anak ke induk, karena parent_document_id restrictOnDelete
        for ($item = $document; $item; $item = $induk) {
            $induk = $item->dokumenInduk;
            $kunci[] = $item->storage_key;
            $item->delete();
        }

        return $kunci;
    }

    // Berkas fisik dibuang hanya bila tidak ada baris lain (tautan/versi) yang masih memakainya
    private function bersihkanStorage(array $kunciStorage): void
    {
        $masihDipakai = DokumenBukti::query()->whereIn('storage_key', $kunciStorage)->pluck('storage_key')->all();
        foreach (array_diff(array_unique($kunciStorage), $masihDipakai) as $kunci) {
            Storage::disk()->delete($kunci);
        }
    }

    public function storeRevision(
    StoreDokumenBuktiRequest $request,
    RencanaKegiatan $rencanaKegiatan,
    DokumenBukti $dokumenBukti
    ): JsonResponse 
    {
        $file = $request->file('file');
        $disk = Storage::disk();
        $storageKey = $file->store("bukti/{$rencanaKegiatan->id}");

        if (! is_string($storageKey) || $storageKey === '') {
            throw new RuntimeException('File bukti gagal disimpan.');
        }

        try {
            $document = DB::transaction(function () use (
                $request,
                $rencanaKegiatan,
                $dokumenBukti,
                $file,
                $storageKey
            ): DokumenBukti {
                $previous = $rencanaKegiatan
                    ->dokumenBukti()
                    ->lockForUpdate()
                    ->findOrFail($dokumenBukti->id);

                abort_unless(
                    $previous->is_current,
                    409,
                    'Versi dokumen ini sudah digantikan.'
                );

                $previous->is_current = false;
                $previous->save();

                $originalName = basename(
                    str_replace('\\', '/', $file->getClientOriginalName())
                );

                $document = new DokumenBukti();
                $document->forceFill([
                    'uploaded_by' => $request->user()->id,
                    'parent_document_id' => $previous->id,
                    'version_number' => $previous->version_number + 1,
                    'is_current' => true,
                    'evidence_date' => $request->validated('evidence_date'),
                    'nama_file' => Str::limit($originalName, 255, ''),
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
                'parent_document_id' => $document->parent_document_id,
                'evidence_date' => $document->evidence_date->toDateString(),
                'nama_file' => $document->nama_file,
                'mime_type' => $document->mime_type,
                'size_bytes' => $document->size_bytes,
                'version_number' => $document->version_number,
                'is_current' => $document->is_current,
            ],
        ], 201);
    }
}
