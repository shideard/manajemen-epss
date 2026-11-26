<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_user_with_valid_eight_character_password(): void
    {
        $admin = User::factory()->create([
        'role' => UserRole::SUPER_ADMIN_BIDANG,
        'status_aktif' => true,
        'must_change_password' => false,
        'password_changed_at' => now(),
    ]);

        $password = 'Abcd12!x';

        $this->actingAs($admin, 'web')
            ->postJson('/api/users', [
                'name' => 'Pengguna Pengujian',
                'username' => 'operator.password',
                'password' => $password,
                'password_confirmation' => $password,
                'role' => UserRole::OPERATOR->value,
            ])
            ->assertCreated();

        $user = User::where(
            'username',
            'operator.password'
        )->firstOrFail();

        $this->assertNotSame($password, $user->password);
        $this->assertTrue(Hash::check($password, $user->password));
    }

    public function test_admin_cannot_create_users_with_invalid_passwords(): void
    {
        $admin = User::factory()->create([
        'role' => UserRole::SUPER_ADMIN_BIDANG,
        'status_aktif' => true,
        'must_change_password' => false,
        'password_changed_at' => now(),
    ]);

        $invalidPasswords = [
            'too_short' => 'Ab12!xy',
            'no_uppercase' => 'abcd12!x',
            'no_lowercase' => 'ABCD12!X',
            'no_number' => 'Abcdef!x',
            'no_symbol' => 'Abcd123x',
            'space_only' => 'Abcd12 x',
        ];

        foreach ($invalidPasswords as $case => $password) {
            $username = 'operator.' . $case;

            $this->actingAs($admin, 'web')
                ->postJson('/api/users', [
                    'name' => 'Pengguna Pengujian',
                    'username' => $username,
                    'password' => $password,
                    'password_confirmation' => $password,
                    'role' => UserRole::OPERATOR->value,
                ])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['password']);

            $this->assertDatabaseMissing('users', [
                'username' => $username,
            ]);
        }

        $this->assertDatabaseCount('users', 1);
    }

    public function test_admin_command_rejects_password_without_required_combination(): void
    {
        $password = 'abcdefghijklmnop';

        $this->artisan('epss:create-super-admin')
            ->expectsQuestion('Nama administrator', 'Admin Pengujian')
            ->expectsQuestion('Username administrator', 'admin.password')
            ->expectsQuestion('Password administrator', $password)
            ->expectsQuestion('Ulangi password', $password)
            ->assertExitCode(1);

        $this->assertDatabaseCount('users', 0);
    }
}
