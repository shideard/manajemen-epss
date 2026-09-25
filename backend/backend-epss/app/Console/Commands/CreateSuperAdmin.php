<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CreateSuperAdmin extends Command
{
    protected $signature = 'epss:create-super-admin';

    protected $description = 'Membuat akun administrator bidang pertama';

    public function handle(): int {
        $adminExists = User::query()
            ->where('role', UserRole::SUPER_ADMIN_BIDANG->value)
            ->exists();

        if ($adminExists){
            $this->error(
                'Akun administrator sudah ada. Akun baru tidak dibuat.'
            );

            return self::FAILURE;
        }

        $name = $this->ask('Nama administrator');

        $username = Str::lower(
            (string) $this->ask('Username administrator')
        );

        $password = $this->secret('Password administrator');

        $passwordConfirmation = $this->secret('Ulangi password');

        $validator = Validator::make([
            'name' => $name,
            'username' => $username,
            'password' => $password,
            'password_confirmation' => $passwordConfirmation,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'bail',
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/\A[a-z0-9._-]+\z/',
                'unique:users,username',
            ],
            'password' => [
                'required',
                'string',
                'min:12',
                'confirmed',
            ],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message){
                $this->error($message);
            }

            return self::FAILURE;
        }
        
        $data = $validator->validated();

        $user = new User();
        $user->name = $data['name'];
        $user->username = $data['username'];
        $user->password = $data['password'];
        $user->email = null;
        $user->role = UserRole::SUPER_ADMIN_BIDANG;
        $user->status_aktif = true;

        try {
            $user->save();
        } catch (UniqueConstraintViolationException $exception){
            $this->error('Pembuatan ditolak: username sudah dipakai atau admin administrator sudah ada.');

            return self::FAILURE;
        }

        $this->info('Administrator berhasil dibuat.');
        $this->line('Username: '. $user->username);

        return self::SUCCESS;
    }
}
