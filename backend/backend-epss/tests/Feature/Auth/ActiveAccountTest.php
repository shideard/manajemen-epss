<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActiveAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_deactivated_after_login_is_rejected_and_logged_out(): void {
        $user = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $this->actingAs($user, 'web');
        $this->assertAuthenticatedAs($user, 'web');

        $user->status_aktif = false;
        $user->save();

        $response = $this
        ->withHeader('Origin', 'http://127.0.0.1:8000')
        ->getJson('/api/user');

        $response->assertForbidden();

        $response->assertJsonPath(
            'message',
            'Akun Anda tidak aktif.'
        );

        $this->assertGuest('web');
    }
}
