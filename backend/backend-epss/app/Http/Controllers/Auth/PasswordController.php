<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PasswordController extends Controller
{
    public function update(UpdatePasswordRequest $request): Response
    {
        $validated = $request->validated();

        $user = $request->user();
        $currentSessionId = $request->session()->getId();

        DB::transaction(function () use (
            $user,
            $validated,
            $currentSessionId
        ): void {
            $user->password = $validated['password'];
            $user->must_change_password = false;
            $user->password_changed_at = now();
            $user->setRememberToken(Str::random(60));
            $user->save();

            DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('id', '!=', $currentSessionId)
                ->delete();
        });

        $request->session()->regenerate();

        return response()->noContent();
    }
}
