<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserStatusController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\PasswordController;

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
    });
    
});


