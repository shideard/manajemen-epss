<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateUserStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_deactivate_an_operator(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
        ]);

        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->patchJson("/api/users/{$operator->id}/status", [
                'status_aktif' => false,
            ]);

        $response->assertNoContent();

        $this->assertFalse($operator->fresh()->status_aktif);
    }

    public function test_admin_can_activate_an_inactive_verifikator(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
        ]);

        $verifikator = User::factory()->create([
            'role' => UserRole::VERIFIKATOR,
            'status_aktif' => false,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->patchJson("/api/users/{$verifikator->id}/status", [
                'status_aktif' => true,
            ]);

        $response->assertNoContent();

        $this->assertTrue($verifikator->fresh()->status_aktif);
    }

    public function test_admin_cannot_deactivate_own_account(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->patchJson("/api/users/{$admin->id}/status", [
                'status_aktif' => false,
            ]);

        $response->assertForbidden();

        $this->assertTrue($admin->fresh()->status_aktif);
    }

    public function test_operator_cannot_deactivate_another_user(): void
    {
        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $verifikator = User::factory()->create([
            'role' => UserRole::VERIFIKATOR,
            'status_aktif' => true,
        ]);

        $response = $this
            ->actingAs($operator, 'web')
            ->patchJson("/api/users/{$verifikator->id}/status", [
                'status_aktif' => false,
            ]);

        $response->assertForbidden();

        $this->assertTrue($verifikator->fresh()->status_aktif);
    }

    public function test_invalid_status_is_rejected_without_changing_the_user(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
        ]);

        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->patchJson("/api/users/{$operator->id}/status", [
                'status_aktif' => 'nonaktif',
            ]);

        $response->assertUnprocessable();

        $response->assertJsonValidationErrors(['status_aktif']);

        $this->assertTrue($operator->fresh()->status_aktif);
    }
}