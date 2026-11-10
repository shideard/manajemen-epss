<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// user
use App\Http\Controllers\Admin\UserStatusController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\PasswordController;

// versi isntrumen + periode evaluasi
use App\Http\Controllers\PeriodeEvaluasiController;
use App\Http\Controllers\AktivasiPeriodeController;
use App\Http\Controllers\PilihanVersiInstrumenController;
use App\Http\Controllers\KunciPeriodeController;

// opd
use App\Http\Controllers\PilihanOpdController;
use App\Http\Controllers\PilihanPicController;

// rencana kegiatan
use App\Http\Controllers\RencanaKegiatanController;
use Illuminate\Http\Response;
use App\Http\Controllers\PeriodeIndikatorController;

// dokumen bukti
use App\Http\Controllers\DokumenBuktiController;

// ajuan & verifikasi bukti
use App\Http\Controllers\AjuanBuktiController;
use App\Http\Controllers\EksporBuktiController;

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

        Route::get('/users', [UserController::class, 'index'])
        ->name('users.index');

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

        Route::patch('/periode-evaluasi/{periode}', [
        PeriodeEvaluasiController::class,
        'update',
        ])->whereUuid('periode')
        ->name('periode-evaluasi.update');

        Route::get('/pilihan/opd', 
        PilihanOpdController::class)
        ->name('pilihan.opd');

        Route::get('/pilihan/pic', 
        PilihanPicController::class)
        ->name('pilihan.pic');

        Route::post('/rencana-kegiatan', [
        RencanaKegiatanController::class,
        'store',
        ])->name('rencana-kegiatan.store');

        Route::get('/rencana-kegiatan', [RencanaKegiatanController::class, 'index']);

        Route::get('/rencana-kegiatan/{rencanaKegiatan}', [
        RencanaKegiatanController::class,
        'show',
        ])->whereUuid('rencanaKegiatan')
        ->name('rencana-kegiatan.show');

        Route::patch('/rencana-kegiatan/{rencanaKegiatan}', [
        RencanaKegiatanController::class,
        'update',
        ])->whereUuid('rencanaKegiatan')
        ->name('rencana-kegiatan.update');

        Route::put('/rencana-kegiatan/{rencanaKegiatan}/indikator',
        [RencanaKegiatanController::class, 'syncIndikator']
        )->whereUuid('rencanaKegiatan')
        ->name('rencana-kegiatan.indikator.sync');

        Route::get('/periode-evaluasi/{periode}/indikator', PeriodeIndikatorController::class
        )->whereUuid('periode')
        ->name('periode-evaluasi.indikator.index');

        Route::delete('/periode-evaluasi/{periode}', [
            PeriodeEvaluasiController::class, 
            'destroy']
        )->name('periode-evaluasi.destroy');

        Route::delete('/rencana-kegiatan/{rencanaKegiatan}',
        [RencanaKegiatanController::class, 'destroy']
        );

        Route::post('/rencana-kegiatan/{rencanaKegiatan}/dokumen-bukti',
        [DokumenBuktiController::class, 'store']
        )->whereUuid('rencanaKegiatan')
        ->name('rencana-kegiatan.dokumen-bukti.store');

        Route::get('/rencana-kegiatan/{rencanaKegiatan}/dokumen-bukti',
        [DokumenBuktiController::class, 'index']
        )->whereUuid('rencanaKegiatan')
        ->name('rencana-kegiatan.dokumen-bukti.index');

        Route::get('/rencana-kegiatan/{rencanaKegiatan}/dokumen-bukti/{dokumenBukti}/download',
        [DokumenBuktiController::class, 'download']
        )->whereUuid('rencanaKegiatan')
        ->whereUuid('dokumenBukti')
        ->name('rencana-kegiatan.dokumen-bukti.download');

        Route::post('/rencana-kegiatan/{rencanaKegiatan}/dokumen-bukti/{dokumenBukti}/versi',
        [DokumenBuktiController::class, 'storeRevision']
        )->whereUuid('rencanaKegiatan')
        ->whereUuid('dokumenBukti')
        ->name('rencana-kegiatan.dokumen-bukti.revision.store');

        Route::get('/periode-evaluasi/{periode}/ekspor-bukti', EksporBuktiController::class
        )->whereUuid('periode')
        ->name('periode-evaluasi.ekspor-bukti');

        Route::get('/periode-evaluasi/{periode}/ajuan-bukti',
        [AjuanBuktiController::class, 'index']
        )->whereUuid('periode')
        ->name('periode-evaluasi.ajuan-bukti.index');

        Route::put('/rencana-kegiatan/{rencanaKegiatan}/ajuan-bukti/{indikator}',
        [AjuanBuktiController::class, 'update']
        )->whereUuid('rencanaKegiatan')
        ->whereUuid('indikator')
        ->name('rencana-kegiatan.ajuan-bukti.update');

        Route::patch('/ajuan-bukti/{ajuanBukti}/verifikasi',
        [AjuanBuktiController::class, 'verify']
        )->whereUuid('ajuanBukti')
        ->name('ajuan-bukti.verify');

    });
});


