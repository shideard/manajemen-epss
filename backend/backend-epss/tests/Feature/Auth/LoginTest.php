<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN_TURNSTILE = 'token-turnstile-uji';

    private bool $turnstileSukses = true;

    // Login memverifikasi Turnstile ke Cloudflare; di tes respons siteverify dipalsukan supaya tidak ada request keluar
    protected function setUp(): void
    {
        parent::setUp();

        config(['services.turnstile.secret_key' => 'rahasia-turnstile-uji']);
        // Stub Http::fake pertama yang cocok selalu menang, jadi jawabannya dibaca dari properti, bukan didaftarkan ulang
        Http::fake([
            'challenges.cloudflare.com/*' => fn () => Http::response(
                $this->turnstileSukses
                    ? ['success' => true, 'action' => 'login']
                    : ['success' => false, 'error-codes' => ['invalid-input-response']]
            ),
        ]);
    }

    private function turnstileMenjawab(bool $sukses): void
    {
        $this->turnstileSukses = $sukses;
    }

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
            'turnstile_token' => self::TOKEN_TURNSTILE,
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
            'turnstile_token' => self::TOKEN_TURNSTILE,
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
            'turnstile_token' => self::TOKEN_TURNSTILE,
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
            'turnstile_token' => self::TOKEN_TURNSTILE,
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
            'turnstile_token' => self::TOKEN_TURNSTILE,
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertUnprocessable();

        $response->assertJsonValidationErrors(['username']);

        $this->assertGuest('web');
    }

    public function test_login_is_rejected_when_turnstile_verification_fails(): void
    {
        $this->turnstileMenjawab(false);
        $password = 'PasswordTesting-2026!';

        $user = User::factory()->create([
            'username' => 'operator.latihan',
            'password' => $password,
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
        ]);

        $this->postJson('/login', [
            'username' => $user->username,
            'password' => $password,
            'turnstile_token' => self::TOKEN_TURNSTILE,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('turnstile_token');

        $this->assertGuest('web');
        Http::assertSent(fn (Request $request) => $request['response'] === self::TOKEN_TURNSTILE
            && $request['secret'] === 'rahasia-turnstile-uji');
    }
}
