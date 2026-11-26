<?php

namespace App\Http\Controllers;

use App\Models\KegiatanIndikator;
use App\Models\PeriodeEvaluasi;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;
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
                'kegiatan.dokumenBukti.indikator:id',
            ])
            ->get();

        $path = tempnam(sys_get_temp_dir(), 'bukti');
        $zip = new ZipArchive();

        if ($zip->open($path, ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Paket ZIP gagal dibuat.');
        }

        $disk = Storage::disk();
        $jumlah = 0;
        // storage_key => file sementara; satu berkas yang tertaut ke beberapa indikator cukup diunduh sekali
        $salinan = [];

        try {
            foreach ($pemetaan as $map) {
                $indikator = $map->indikator;
                $domain = $indikator->aspek->domain;
                $folder = implode('/', [
                    $this->nama("Domain {$domain->kode} - {$domain->nama}"),
                    $this->nama("Indikator {$indikator->kode} - {$indikator->nama}"),
                    $this->nama($map->kegiatan->nama_kegiatan),
                ]);

                foreach ($map->kegiatan->dokumenBukti as $dokumen) {
                    // Folder indikator hanya berisi berkas yang tertaut ke indikator itu
                    if (! $dokumen->indikator->contains('id', $indikator->id)) {
                        continue;
                    }

                    $berkas = $salinan[$dokumen->storage_key] ??= $this->salinKeSementara($disk, $dokumen->storage_key);

                    if ($berkas === null) {
                        continue;
                    }

                    // Awalan id pendek supaya dua berkas bernama sama tidak saling menimpa.
                    // addFile membaca file sementara saat ZIP ditutup, jadi isinya tidak ditampung di memori PHP
                    $zip->addFile(
                        $berkas,
                        $folder . '/' . substr($dokumen->id, -6) . '-' . $this->nama($dokumen->nama_file)
                    );
                    $jumlah++;
                }
            }

            // ZipArchive tidak menulis arsip kosong
            if ($jumlah === 0) {
                $zip->addFromString('BACA.txt', 'Belum ada berkas bukti dukung pada periode ini.');
            }

            if (! $zip->close()) {
                throw new RuntimeException('Paket ZIP gagal dibuat.');
            }
        } catch (Throwable $e) {
            @unlink($path);

            throw $e;
        } finally {
            foreach (array_filter($salinan) as $berkas) {
                @unlink($berkas);
            }
        }

        return response()
            ->download($path, "Bukti-EPSS-{$periode->tahun_mulai}-{$periode->tahun_selesai}.zip", [
                'Content-Type' => 'application/zip',
            ])
            ->deleteFileAfterSend();
    }

    // Salin objek dari disk mana pun (lokal atau S3/MinIO) ke file sementara lewat stream,
    // karena ZipArchive hanya bisa membaca berkas di filesystem server. null = objek tidak ada.
    private function salinKeSementara(Filesystem $disk, string $kunci): ?string
    {
        // Objek yang memang tidak ada dilewati; gagal baca lainnya (mis. storage tak terjangkau) digagalkan
        // supaya paket ZIP tidak diam-diam kehilangan berkas bukti
        if (! $disk->exists($kunci)) {
            return null;
        }

        $masuk = $disk->readStream($kunci);

        if (! is_resource($masuk)) {
            throw new RuntimeException('Berkas bukti gagal diambil dari penyimpanan.');
        }

        $tujuan = tempnam(sys_get_temp_dir(), 'bukti');
        $keluar = fopen($tujuan, 'wb');

        try {
            if ($keluar === false || stream_copy_to_stream($masuk, $keluar) === false) {
                @unlink($tujuan);

                throw new RuntimeException('Berkas bukti gagal diambil dari penyimpanan.');
            }
        } finally {
            fclose($masuk);

            if (is_resource($keluar)) {
                fclose($keluar);
            }
        }

        return $tujuan;
    }

    // Nama folder/berkas aman untuk Windows maupun Linux
    private function nama(string $nama): string
    {
        return trim(preg_replace('/[\\\\\/:*?"<>|]+/', '_', $nama)) ?: '_';
    }
}
