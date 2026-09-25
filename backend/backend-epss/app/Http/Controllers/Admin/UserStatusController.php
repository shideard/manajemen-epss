<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\User;
use Illuminate\Http\Response;

class UserStatusController extends Controller
{
    public function update(
        UpdateUserStatusRequest $request,
        User $user
    ): Response {
        $validated = $request->validated();

        $user->status_aktif = (bool) $validated['status_aktif'];
        $user->save();

        return response()->noContent();
    }
}
