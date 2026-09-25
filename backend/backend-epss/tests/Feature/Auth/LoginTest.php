<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_user_can_login_with_correct_credentials(): void {
        $password = 'PasswordTesting-2026!';

        $user = User::factory()->create([
            'username' => 'operator.latihan',
            'email' => null,
            'email_verified_at' => null,
            'password' => $password,
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $response = $this->postJson('/login', [
            'username' => $user->username,
            'password' => $password,
        ]);

        $response->assertOk();

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_active_user_cannot_login_with_wrong_password(): void{
        $user = User::factory()->create([
            'username' => 'operator.latihan',
            'password' => 'PasswordBenar-2026!',
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
            ]);

        $response = $this->postJson('/login', [
            'username' => $user->username,
            'password' => 'PasswordSalah-2026!',
        ]);

        $response->assertUnprocessable();

        $response->assertJsonValidationErrors('username');

        $this->assertGuest('web');
    }

    public function test_inactive_user_cannot_login_with_correct_credentials(): void {
        $password = 'PasswordBenar-2026!';

        $user = User::factory()->create([
            'username' => 'operator.latihan',
            'password' => $password,
            'role' => UserRole::OPERATOR,
            'status_aktif' => false,
        ]);
        
        $response = $this->postJson('/login', [
            'username' => $user->username,
            'password' => $password,
        ]);

        $response->assertUnprocessable();

        $response->assertJsonValidationErrors('username');

        $this->assertGuest('web');
    }

    public function test_username_is_stored_in_lowercase_and_login_accepts_uppercase(): void 
    {
        $password = 'PasswordTesting-2026!';

        $user = User::factory()->create(
            ['username' => 'Operator.Latihan',
            'email' => null,
            'email_verified_at' => null,
            'password' => $password,
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,]
        );

        $this->assertSame(
            'operator.latihan',
            $user->fresh()->username
        );

        $response = $this->postJson('/login', [
            'username' => 'OPERATOR.LATIHAN',
            'password' => $password,
        ]);

        $response->assertOk();

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_email_cannot_replace_username_in_login_request(): void
    {
        $password = 'PasswordTesting-2026!';

        $user = User::factory()->create([
            'username' => 'operator.latihan',
            'email' => 'operator@example.test',
            'password' => $password,
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertUnprocessable();

        $response->assertJsonValidationErrors(['username']);

        $this->assertGuest('web');
    }
}
