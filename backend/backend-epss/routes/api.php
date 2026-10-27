<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserStatusController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\PeriodeEvaluasiController;
use App\Http\Controllers\AktivasiPeriodeController;
use App\Http\Controllers\PilihanVersiInstrumenController;
use App\Http\Controllers\KunciPeriodeController;

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('/user', function(Request $request){
        return $request->user();
    });

    Route::patch('/user/password', [PasswordController::class, 'update'])
        ->middleware('throttle:5,1')
        ->name('user.password.update');

    Route::middleware('password.current')->group(function () {
        Route::patch('/users/{user}/status', [
            UserStatusController::class,
            'update',
        ])->name('users.status.update');

        Route::post('/users', [UserController::class, 'store'])
        ->name('users.save');

        Route::get('/periode-evaluasi', [
            PeriodeEvaluasiController::class,
            'index',
        ])->name('periode-evaluasi.index');

        Route::post('/periode-evaluasi', [
            PeriodeEvaluasiController::class,
            'store',
        ])->name('periode-evaluasi.store');

        Route::get('/pengelolaan/periode-evaluasi', [
            PeriodeEvaluasiController::class,
            'managementIndex',
        ])->name('periode-evaluasi.management.index');

        Route::patch('/periode-evaluasi/{periode}/aktivasi',
        AktivasiPeriodeController::class
        )->name('periode-evaluasi.activate');

        Route::get('/pilihan/versi-instrumen',
        PilihanVersiInstrumenController::class
        )->name('pilihan.versi-instrumen');

        Route::patch('/periode-evaluasi/{periode}/kunci',
        KunciPeriodeController::class
        )->name('periode-evaluasi.lock');
    
        Route::get('/periode-evaluasi/{periode}', [
        PeriodeEvaluasiController::class,
        'show',
        ])->whereUuid('periode')
        ->name('periode-evaluasi.show');

        
    });
});


