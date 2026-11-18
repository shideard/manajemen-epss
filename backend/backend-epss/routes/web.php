<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/belajar/status', [StatusController::class, 'show'])->name('belajar.status');
// name untuk memberikan nama internal pada route

Route::post('/login', [LoginController::class, 'store'])->name('login');

Route::post('/logout', [LogoutController::class, 'destroy'])->middleware('auth:web')->name('logout');
// auth:web untuk memastikan user sudah login sebelum logout    