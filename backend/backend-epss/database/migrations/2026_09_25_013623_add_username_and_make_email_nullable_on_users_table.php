<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable()->unique();
        });

        DB::statement(
            "UPDATE users
            SET username = CONCAT('user.', id)
            WHERE username IS NULL"
        );

        DB::statement(
            "ALTER TABLE users
            ALTER COLUMN username SET NOT NULL"
        );

        DB::statement(
            "ALTER TABLE users
            ADD CONSTRAINT users_username_format_check
            CHECK (username ~ '^[a-z0-9_.-]{3,50}$')"
        );

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
            if (DB::table('users')->whereNull('email')->exists()) {
                throw new \RuntimeException(
                    "Rollback dihentikan: isi email seluruh pengguna terlebih dahulu.");
            }

            DB::statement(
                "ALTER TABLE users
                DROP CONSTRAINT IF EXISTS users_username_format_check"
            );

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('username');
                $table->string('email')->nullable(false)->change();
            });
    }
};
