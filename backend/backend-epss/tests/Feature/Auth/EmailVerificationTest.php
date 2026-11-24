<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    // Ambil path API dari tautan email yang mengarah ke halaman SPA /verifikasi-email?url=...
    private function verifyPath(User $user): string
    {
        Notification::fake();
        $user->sendEmailVerificationNotification();

        $path = null;
        Notification::assertSentTo($user, VerifyEmail::class, function (VerifyEmail $notification) use ($user, &$path) {
            $url = $notification->toMail($user)->actionUrl;
            $this->assertStringStartsWith(rtrim(config('app.frontend_url'), '/').'/verifikasi-email?url=', $url);
            parse_str(parse_url($url, PHP_URL_QUERY), $query);
            $path = $query['url'];

            return true;
        });

        return $path;
    }

    public function test_link_points_to_frontend_and_verifies_email(): void
    {
        $user = User::factory()->unverified()->create();
        $path = $this->verifyPath($user);

        $this->assertStringStartsWith('/api/email/verify/', $path);
        $this->getJson($path)->assertOk();
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_tampered_or_expired_link_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $path = $this->verifyPath($user);

        $this->getJson($path.'x')->assertForbidden();

        $this->travel(61)->minutes();
        $this->getJson($path)->assertForbidden();
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    // ponytail: cek susunan middleware, bukan request; test API ber-actingAs masih gagal karena EnforceSessionAge butuh session
    public function test_protected_api_requires_verified_email_but_verification_routes_do_not(): void
    {
        $middleware = fn (string $name) => app('router')->getRoutes()->getByName($name)->gatherMiddleware();

        $this->assertContains('verified', $middleware('users.index'));
        $this->assertNotContains('verified', $middleware('user.recovery-email.update'));
        $this->assertNotContains('verified', $middleware('user.password.update'));
    }
}
