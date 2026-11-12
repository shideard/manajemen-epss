<?php

namespace App\Support\Evidence;

use App\Models\IndikatorEPSS;

class ChecklistBuktiValidator
{
    /**
     * Mengembalikan pesan bila checklist level berurutan belum lengkap.
     * Nilai checklist disimpan sebagai daftar boolean yang urutannya mengikuti persyaratan_bukti. */
    public static function kekurangan(
        IndikatorEPSS $indikator,
        array $checklist,
        int $sampaiLevel
    ): ?string {
        for ($level = 1; $level <= $sampaiLevel; $level++) {
            $kriteria = $indikator->kriteriaLevels()
                ->with('persyaratanBukti')
                ->where('level', $level)
                ->first();
            $persyaratan = $kriteria?->persyaratanBukti
                ->sortBy('urutan')
                ->values();

            if (! $persyaratan || $persyaratan->isEmpty()) {
                return "Persyaratan bukti untuk Indikator {$indikator->kode} Level {$level} belum tersedia.";
            }

            $jawaban = $checklist[(string) $level] ?? $checklist[$level] ?? null;
            if (
                ! is_array($jawaban)
                || ! array_is_list($jawaban)
                || count($jawaban) !== $persyaratan->count()
            ) {
                return "Jumlah item checklist Level {$level} tidak sesuai dengan persyaratan bukti.";
            }

            foreach ($jawaban as $terpenuhi) {
                if (! in_array($terpenuhi, [true, 1, '1'], true)) {
                    return "Lengkapi seluruh checklist Level {$level} sebelum melanjutkan.";
                }
            }
        }

        return null;
    }
}
