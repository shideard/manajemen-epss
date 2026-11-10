<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListUsersTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(UserRole $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);
    }

    public function test_super_admin_lists_all_users_without_secrets(): void
    {
        $admin = $this->createUser(UserRole::SUPER_ADMIN_BIDANG);
        $this->createUser(UserRole::OPERATOR);
        $this->createUser(UserRole::VERIFIKATOR);

        $this->actingAs($admin, 'web')
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonStructure(['data' => [['id', 'name', 'username', 'email', 'role', 'status_aktif']]]);
    }

    public function test_operator_and_verifikator_cannot_list_users(): void
    {
        foreach ([UserRole::OPERATOR, UserRole::VERIFIKATOR] as $role) {
            $this->actingAs($this->createUser($role), 'web')
                ->getJson('/api/users')
                ->assertForbidden();
        }
    }
}
