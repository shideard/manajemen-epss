<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'sanctum.stateful' => ['127.0.0.1:8000'],
        ]);

        $this->withHeaders([
            'Accept' => 'application/json',
            'Origin' => 'http://127.0.0.1:8000',
        ]);
    }

    public function test_admin_requiring_password_change_cannot_manage_users(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
            'must_change_password' => true,
            'password_changed_at' => null,
        ]);

        $target = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $this->actingAs($admin, 'web')
            ->patchJson("/api/users/{$target->id}/status", [
                'status_aktif' => false,
            ])
            ->assertForbidden()
            ->assertJsonPath('code', 'PASSWORD_CHANGE_REQUIRED');

        $this->assertTrue($target->fresh()->status_aktif);
        $this->assertAuthenticatedAs($admin, 'web');
    }

    public function test_admin_with_expired_password_cannot_manage_users(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now()->subYears(2),
        ]);

        $target = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $this->actingAs($admin, 'web')
            ->patchJson("/api/users/{$target->id}/status", [
                'status_aktif' => false,
            ])
            ->assertForbidden()
            ->assertJsonPath('code', 'PASSWORD_CHANGE_REQUIRED');

        $this->assertTrue($target->fresh()->status_aktif);
    }

    public function test_user_can_change_initial_password_then_access_business_endpoint(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
            'password' => 'PasswordAwal-2026!',
            'must_change_password' => true,
            'password_changed_at' => null,
        ]);

        $target = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $this->actingAs($admin, 'web');

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $admin->id);

        $this->patchJson('/api/user/password', [
            'current_password' => 'PasswordAwal-2026!',
            'password' => 'PasswordBaru-2026!',
            'password_confirmation' => 'PasswordBaru-2026!',
        ])->assertNoContent();

        $this->patchJson("/api/users/{$target->id}/status", [
            'status_aktif' => false,
        ])->assertNoContent();

        $this->assertFalse($target->fresh()->status_aktif);
    }
}
