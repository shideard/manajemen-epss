<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Http\Requests\StatusRequest;

class StatusController extends Controller
{

    // show untuk menampilkan status aplikasi
    public function show(StatusRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return response()->json([
            'status' => 'OK',
            'message' => "Aplikasi berjalan dengan baik!",
            'nama' => $validated['nama'] ?? 'Pengunjung',
        ]);
    }
}