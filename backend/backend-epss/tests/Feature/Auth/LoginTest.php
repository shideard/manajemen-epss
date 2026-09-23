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
            'email' => 'operator@example.test',
            'password' => $password,
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertOk();

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_active_user_cannot_login_with_wrong_password(): void{
        $user = User::factory()->create([
            'email' => 'operator@example.test',
            'password' => 'PasswordBenar-2026!',
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
            ]);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'PasswordSalah-2026!',
        ]);

        $response->assertUnprocessable();

        $response->assertJsonValidationErrors('email');

        $this->assertGuest('web');
    }

    public function test_inactive_user_cannot_login_with_correct_credentials(): void {
        $password = 'PasswordBenar-2026!';

        $user = User::factory()->create([
            'email' => 'operator@example.test',
            'password' => $password,
            'role' => UserRole::OPERATOR,
            'status_aktif' => false,
        ]);
        
        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertUnprocessable();

        $response->assertJsonValidationErrors('email');

        $this->assertGuest('web');
    }
}
