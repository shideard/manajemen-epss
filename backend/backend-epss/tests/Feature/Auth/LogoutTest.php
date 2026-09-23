<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_logout(): void {
        $user = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $this->actingAs($user, 'web');

        $this->assertAuthenticatedAs($user, 'web');

        $response = $this->postJson('/logout');

        $response->assertNoContent();

        $this->assertGuest('web');
    }
}
