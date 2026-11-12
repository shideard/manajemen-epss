<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RecoverSuperAdmin extends Command
{
    protected $signature = 'epss:recover-super-admin';

    protected $description = 'Memulihkan username dan password super admin yang sudah ada';

    public function handle(): int
    {
        $admin = User::query()
            ->where('role', UserRole::SUPER_ADMIN_BIDANG->value)
            ->first();

        if ($admin === null) {
            $this->error('Akun super admin belum ada.');

            return self::FAILURE;
        }

        $this->line('Akun super admin ditemukan: '.$admin->username);

        $username = Str::lower((string) $this->ask(
            'Username baru (kosongkan untuk tetap memakai username saat ini)',
            $admin->username,
        ));
        $password = $this->secret('Password baru');
        $passwordConfirmation = $this->secret('Ulangi password baru');

        $validator = Validator::make([
            'username' => $username,
            'password' => $password,
            'password_confirmation' => $passwordConfirmation,
        ], [
            'username' => [
                'bail',
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/\A[a-z0-9._-]+\z/',
                Rule::unique('users', 'username')->ignore($admin->id),
            ],
            'password' => [
                'required',
                'string',
                Password::defaults(),
                'confirmed',
            ],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $data = $validator->validated();

        DB::transaction(function () use ($admin, $data): void {
            $admin->username = $data['username'];
            $admin->password = $data['password'];
            $admin->must_change_password = false;
            $admin->password_changed_at = now();
            $admin->setRememberToken(Str::random(60));
            $admin->save();

            DB::table('sessions')->where('user_id', $admin->id)->delete();
        });

        $this->info('Kredensial super admin berhasil diperbarui.');
        $this->line('Username: '.$admin->username);

        return self::SUCCESS;
    }
}
