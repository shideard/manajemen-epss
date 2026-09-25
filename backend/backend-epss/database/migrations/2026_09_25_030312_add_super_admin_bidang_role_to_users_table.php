<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{

    public function up(): void
    {
        DB::statement(
            'ALTER TABLE users
            DROP CONSTRAINT users_role_check'
        );

        DB::statement(
            "ALTER TABLE users
            ADD CONSTRAINT users_role_check
            CHECK (
                role IN (
                        'SUPER_ADMIN_BIDANG',
                        'VERIFIKATOR',
                        'OPERATOR'
                        )
                    )"
        );

        // memastikan hanya ada satu role super admin bidang
        DB::statement(
            "CREATE UNIQUE INDEX users_single_super_admin_bidang_unique
            ON users (role)
            WHERE role = 'SUPER_ADMIN_BIDANG'"
        );
    }

    public function down(): void
    {
        if (
            DB::table('users')
            ->where('role', 'SUPER_ADMIN_BIDANG')
            ->exists()
        )
        {
            throw new \RuntimeException(
                'Rollback dihentikan karena akun SUPER_ADMIN_BIDANG masih ada.'
            );
        }

        DB::statement(
            'DROP INDEX users_single_super_admin_bidang_unique'
        );

        DB::statement(
            'ALTER TABLE users
            DROP CONSTRAINT users_role_check'
        );

        DB::statement(
            "ALTER TABLE users
            ADD CONSTRAINT users_role_check
            CHECK (role IN (
                'VERIFIKATOR',
                'OPERATOR'))"
        );
    }
};
