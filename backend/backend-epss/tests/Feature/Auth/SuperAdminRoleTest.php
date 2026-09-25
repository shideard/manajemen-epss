<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SuperAdminRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_one_admin_and_multiple_regular_users_can_exist(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
        ]);

        User::factory()->count(2)->create([
            'role' => UserRole::VERIFIKATOR,
        ]);

        User::factory()->count(2)->create([
            'role' => UserRole::OPERATOR,
        ]);

        $this->assertSame(
            UserRole::SUPER_ADMIN_BIDANG,
            $admin->fresh()->role
        );

        $this->assertDatabaseCount('users', 5);
    }

    public function test_inactive_admin_still_prevents_a_second_admin(): void {
        User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => false,
        ]);

        $this->expectException(QueryException::class);

        $this->expectExceptionMessage(
            "users_single_super_admin_bidang_unique"
        );

        DB::transaction(function() {
            User::factory()->create([
                'role' => UserRole::SUPER_ADMIN_BIDANG,
                'status_aktif' => true,
            ]);
        });
    }

}
