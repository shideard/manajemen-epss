<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;

// Sajikan frontend hasil `npm run build` (frontend/dist) langsung dari Laravel.
// Aturan: semua URL yang bukan /api, /sanctum, /up, dan bukan nama berkas yang ada
// di public/ → kirim public/spa.html, lalu React Router yang menentukan halamannya.
Route::get('/{rute?}', function (string $rute = '') {
    $terlarang = ['api', 'sanctum', 'up', 'spa.html'];
    if ($terlarang === array_values(array_filter($terlarang, fn ($awalan) => str_starts_with($rute, $awalan)))) {
        abort(404);
    }
    if ($rute !== '' && (is_file(public_path($rute)) || is_dir(public_path($rute)))) {
        abort(404);
    }

    return response()->file(public_path('spa.html'));
})->where('rute', '.*');

Route::get('/belajar/status', [StatusController::class, 'show'])->name('belajar.status');
// name untuk memberikan nama internal pada route

Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:5,1')->name('login');
// throttle:5,1 untuk membatasi percobaan login, 5 kali dalam 1 menit

Route::post('/logout', [LogoutController::class, 'destroy'])->middleware('auth:web')->name('logout');
// auth:web untuk memastikan user sudah login sebelum logout    