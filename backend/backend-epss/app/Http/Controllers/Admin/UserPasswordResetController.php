<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class UserPasswordResetController extends Controller
{
    public function __invoke(User $user): JsonResponse
    {
        Gate::authorize('resetPassword', $user);

        $temporaryPassword = Str::password(24);

        DB::transaction(function () use ($user, $temporaryPassword): void {
            $user->password = $temporaryPassword;
            $user->must_change_password = true;
            $user->password_changed_at = null;
            $user->setRememberToken(Str::random(60));
            $user->save();

            DB::table('sessions')->where('user_id', $user->id)->delete();
        });

        return response()->json([
            'message' => 'Password sementara dibuat. Berikan kepada pengguna melalui kanal yang aman.',
            'temporary_password' => $temporaryPassword,
        ]);
    }
}
