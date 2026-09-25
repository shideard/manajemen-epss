<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{

    public function up(): void
    {
        if (DB::table('sessions')->whereNotNull('user_id')->exists()) {
            throw new \RuntimeException(
                'Perubahan tipe dihentikan karena sessions.user_id masih berisi data.');
        }

        DB::statement('
        ALTER TABLE sessions
        ALTER COLUMN user_id TYPE uuid
        USING user_id::text::uuid'
        );
    }

    public function down(): void
    {
        if(DB::table('sessions')->whereNotNull('user_id')->exists()) {
            throw new \RuntimeException(
                'Rollback dihentikan karena sessions.user_id masih berisi data.');
        }
        
        DB::statement('
        ALTER TABLE sessions 
        ALTER COLUMN user_id TYPE bigint
        USING user_id::text::bigint'
        );
    }
};