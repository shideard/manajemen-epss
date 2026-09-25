<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserStatusController;

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('/user', function(Request $request){
        return $request->user();
    });

    Route::patch('/users/{user}/status', [
        UserStatusController::class,
        'update',
    ])->name('users.status.update');
});
