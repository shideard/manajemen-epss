<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreatorUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_operator_and_verifikator_Without_email(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif'  => true,
        ]);

        $password = 'PassworPengguna-2026!';

        foreach ([UserRole::OPERATOR, UserRole::VERIFIKATOR] as $role) {
            $username = strtolower($role->value) . '.baru';

            $response = $this
                ->actingAs($admin, 'web')
                ->postJson('/api/users', [
                    'name' => 'Pengguna Pengujian',
                    'username' => strtoupper($username),
                    'password' => $password,
                    'password_confirmation' => $password,
                    'role' => $role->value,
                ]);

            $response->assertCreated();
            $response->assertJsonPath('data.username', $username);
            $response->assertJsonPath('data.email', null);
            $response->assertJsonPath('data.role', $role->value);
            $response->assertJsonPath('data.status_aktif', true);
            $response->assertJsonMissingPath('data.password');
            $response->assertJsonMissingPath('data.remember_token');

            $createdUser = User::where('username', $username)->firstOrFail();

            $this->assertSame($role, $createdUser->role);
            $this->assertNull($createdUser->email);
            $this->assertTrue($createdUser->status_aktif);
            $this->assertTrue(Hash::check($password, $createdUser->password));
        }

        $this->assertDatabaseCount('users', 3); // 1 admin + 2 created users
    }

    public function test_admin_cannot_create_another_admin_through_the_endpoint(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif'  => true,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->postJson('/api/users', [
                'name' => 'Admin Kedua',
                'username' => 'admin.kedua',
                'password' => 'PassworPengguna-2026!',
                'password_confirmation' => 'PassworPengguna-2026!',
                'role' => UserRole::SUPER_ADMIN_BIDANG->value,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['role']);
        
        $this->assertDatabaseCount('users', 1); // only the initial admin exists
        $this->assertDatabaseMissing('users', [
            'username' => 'admin.kedua',
        ]);
    }

    public function test_operator_cannot_create_user(): void
    {
        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif'  => true,
        ]);

        $response = $this
            ->actingAs($operator, 'web')
            ->postJson('/api/users', [
                'name' => 'Pengguna Baru',
                'username' => 'pengguna.baru',
                'password' => 'PassworPengguna-2026!',
                'password_confirmation' => 'PassworPengguna-2026!',
                'role' => UserRole::VERIFIKATOR->value,
            ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('users', 1); // only the initial operator exists
        $this->assertDatabaseMissing('users', [
            'username' => 'pengguna.baru',
        ]);
    }

    public function test_duplicate_username_is_rejected_after_normalization(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif'  => true,
        ]);

        $existingUser = User::factory()->create([
            'username' => 'operator.latihan',
            'role' => UserRole::OPERATOR,
            'status_aktif'  => true,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->postJson('/api/users', [
                'name' => 'Pengguna Duplikat',
                'username' => 'OPERATOR.LATIHAN', // same as existing but in lowercase
                'password' => 'PassworPengguna-2026!',
                'password_confirmation' => 'PassworPengguna-2026!',
                'role' => UserRole::VERIFIKATOR->value,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['username']);
        
        $this->assertDatabaseCount('users', 2); // only the initial admin and existing user exist

        $this->assertDatabaseHas('users', [
            'id' => $existingUser->id,
            'username' => 'operator.latihan',
            'role' => UserRole::OPERATOR->value,
        ]);
    }

    public function test_mismatched_password_confirmation_is_rejected(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif'  => true,
        ]);

        $response = $this
            ->actingAs($admin, 'web')
            ->postJson('/api/users', [
                'name' => 'Pengguna Baru',
                'username' => 'pengguna.baru',
                'password' => 'PassworPengguna-2026!',
                'password_confirmation' => 'PassworPengguna-2026!mismatch',
                'role' => UserRole::VERIFIKATOR->value,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['password']);
        
        $this->assertDatabaseCount('users', 1); // only the initial admin exists
        $this->assertDatabaseMissing('users', [
            'username' => 'pengguna.baru',
        ]);
    }

    public function test_verifikator_cannot_create_user(): void
    {
        $verifikator = User::factory()->create([
            'role' => UserRole::VERIFIKATOR,
            'status_aktif'  => true,
        ]);

        $response = $this
            ->actingAs($verifikator, 'web')
            ->postJson('/api/users', [
                'name' => 'Pengguna Baru',
                'username' => 'pengguna.baru',
                'password' => 'PassworPengguna-2026!',
                'password_confirmation' => 'PassworPengguna-2026!',
                'role' => UserRole::OPERATOR->value,
            ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('users', 1); // only the initial verifikator exists
        $this->assertDatabaseMissing('users', [
            'username' => 'pengguna.baru',
        ]);
    }
}
