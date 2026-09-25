<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class UserPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_admin_can_change_status_of_regular_users(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
        ]);

        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $verifikator = User::factory()->create([
            'role' => UserRole::VERIFIKATOR,
            'status_aktif' => false,
        ]);

        $this->assertTrue(
            Gate::forUser($admin)->allows('changeStatus', $operator)
        );

        $this->assertTrue(
            Gate::forUser($admin)->allows('changeStatus', $verifikator)
        );
    }

    public function test_admin_cannot_change_own_status(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
        ]);

        $this->assertFalse(
            Gate::forUser($admin)->allows('changeStatus', $admin)
        );
    }

    public function test_regular_users_cannot_change_account_status(): void
    {
        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR,
        ]);

        $verifikator = User::factory()->create([
            'role' => UserRole::VERIFIKATOR,
        ]);

        $this->assertFalse(
            Gate::forUser($operator)->allows('changeStatus', $verifikator)
        );

        $this->assertFalse(
            Gate::forUser($verifikator)->allows('changeStatus', $operator)
        );
    }

    public function test_inactive_admin_cannot_change_account_status(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => false,
        ]);

        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR,
        ]);

        $this->assertFalse(
            Gate::forUser($admin)->allows('changeStatus', $operator)
        );
    }
}
