<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StatusController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/belajar/status', [StatusController::class, 'show'])->name('belajar.status');
// name untuk memberikan nama internal pada route
