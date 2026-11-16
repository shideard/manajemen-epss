<?php

namespace App\Http\Controllers;

use App\Models\KegiatanIndikator;
use App\Models\PeriodeEvaluasi;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

class EksporBuktiController extends Controller
{
    // Paket ZIP berkas bukti dukung (versi terbaru) satu periode: Domain/Indikator/Kegiatan/berkas.
    // Berkas satu kegiatan ikut di setiap indikator yang dipetakan ke kegiatan itu.
    public function __invoke(PeriodeEvaluasi $periode): BinaryFileResponse
    {
        Gate::authorize('view', $periode);

        $pemetaan = KegiatanIndikator::query()
            ->whereHas('kegiatan', fn ($query) => $query->where('periode_id', $periode->id))
            ->with([
                'indikator:id,aspek_id,kode,nama',
                'indikator.aspek:id,domain_id',
                'indikator.aspek.domain:id,kode,nama',
                'kegiatan:id,nama_kegiatan',
                'kegiatan.dokumenBukti' => fn ($query) => $query->where('is_current', true),
            ])
            ->get();

        $path = tempnam(sys_get_temp_dir(), 'bukti');
        $zip = new ZipArchive();

        if ($zip->open($path, ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Paket ZIP gagal dibuat.');
        }

        $disk = Storage::disk();
        $jumlah = 0;

        foreach ($pemetaan as $map) {
            $indikator = $map->indikator;
            $domain = $indikator->aspek->domain;
            $folder = implode('/', [
                $this->nama("Domain {$domain->kode} - {$domain->nama}"),
                $this->nama("Indikator {$indikator->kode} - {$indikator->nama}"),
                $this->nama($map->kegiatan->nama_kegiatan),
            ]);

            foreach ($map->kegiatan->dokumenBukti as $dokumen) {
                if (! $disk->exists($dokumen->storage_key)) {
                    continue;
                }

                // Awalan id pendek supaya dua berkas bernama sama tidak saling menimpa
                $zip->addFromString(
                    $folder . '/' . substr($dokumen->id, -6) . '-' . $this->nama($dokumen->nama_file),
                    $disk->get($dokumen->storage_key)
                );
                $jumlah++;
            }
        }

        // ZipArchive tidak menulis arsip kosong
        if ($jumlah === 0) {
            $zip->addFromString('BACA.txt', 'Belum ada berkas bukti dukung pada periode ini.');
        }

        $zip->close();

        return response()
            ->download($path, "Bukti-EPSS-{$periode->tahun_mulai}-{$periode->tahun_selesai}.zip", [
                'Content-Type' => 'application/zip',
            ])
            ->deleteFileAfterSend();
    }

    // Nama folder/berkas aman untuk Windows maupun Linux
    private function nama(string $nama): string
    {
        return trim(preg_replace('/[\\\\\/:*?"<>|]+/', '_', $nama)) ?: '_';
    }
}
