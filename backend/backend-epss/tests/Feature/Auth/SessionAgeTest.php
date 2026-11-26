<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionAgeTest extends TestCase
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

    private function user(): User
    {
        return User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);
    }

    public function test_session_is_valid_before_twelve_hours_and_private_responses_are_not_cached(): void
    {
        $user = $this->user();
        $loginAt = now()->subHours(11)->timestamp;

        $response = $this->actingAs($user, 'web')
            ->withSession(['auth.login_at' => $loginAt])
            ->getJson('/api/user');

        $response->assertOk()
            ->assertHeader('Pragma', 'no-cache')
            ->assertHeader('Expires', '0');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_session_expires_after_twelve_hours_even_if_user_is_active(): void
    {
        $user = $this->user();
        $loginAt = now()->timestamp;

        $this->actingAs($user, 'web')
            ->withSession(['auth.login_at' => $loginAt]);

        $this->travel(12)->hours();

        $response = $this->getJson('/api/user');

        $response->assertUnauthorized()
            ->assertJsonPath('message', 'Sesi berakhir. Silakan masuk kembali.')
            ->assertHeader('Pragma', 'no-cache');

        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));

        $this->assertGuest('web');
    }

    public function test_authenticated_session_without_login_timestamp_is_rejected(): void
    {
        $this->actingAs($this->user(), 'web');

        $this->getJson('/api/user')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Sesi berakhir. Silakan masuk kembali.');

        $this->assertGuest('web');
    }
}
