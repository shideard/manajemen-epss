<?php

namespace App\Http\Controllers;

use App\Models\PreferensiNotifikasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

// Pengaturan pengingat dan status dibaca notifikasi milik pengguna yang sedang masuk
class PreferensiNotifikasiController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return $this->respons($this->milik($request));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hari_pengingat' => ['sometimes', 'array'],
            'hari_pengingat.*' => ['integer', 'distinct', Rule::in(PreferensiNotifikasi::HARI)],
            // Id notifikasi yang baru dibaca; digabung dengan yang sudah tersimpan
            'dibaca' => ['sometimes', 'array', 'max:500'],
            'dibaca.*' => ['string', 'max:100'],
        ]);

        $preferensi = $this->milik($request);

        if (array_key_exists('hari_pengingat', $validated)) {
            $preferensi->hari_pengingat = array_values($validated['hari_pengingat']);
        }

        if (array_key_exists('dibaca', $validated)) {
            $preferensi->dibaca = array_slice(
                array_values(array_unique([...$preferensi->dibaca, ...$validated['dibaca']])),
                -PreferensiNotifikasi::MAKS_DIBACA
            );
        }

        $preferensi->save();

        return $this->respons($preferensi);
    }

    private function milik(Request $request): PreferensiNotifikasi
    {
        return PreferensiNotifikasi::firstOrNew(['user_id' => $request->user()->id]);
    }

    private function respons(PreferensiNotifikasi $preferensi): JsonResponse
    {
        return response()->json([
            'data' => [
                'hari_pengingat' => $preferensi->hari_pengingat,
                'dibaca' => $preferensi->dibaca,
            ],
        ]);
    }
}
