<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class UpdatePasswordTest extends TestCase
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

    public function test_user_can_change_password_with_correct_current_password(): void
    {
        $user = User::factory()->create([
            'password' => 'PasswordLama-2026!',
            'status_aktif' => true,
        ]);

        $oldRememberToken = $user->getRememberToken();

        $this->actingAs($user, 'web')
            ->patchJson('/api/user/password', [
                'current_password' => 'PasswordLama-2026!',
                'password' => 'PasswordBaru-2026!',
                'password_confirmation' => 'PasswordBaru-2026!',
            ])
            ->assertNoContent();

        $user->refresh();

        $this->assertTrue(
            Hash::check('PasswordBaru-2026!', $user->password)
        );

        $this->assertFalse(
            Hash::check('PasswordLama-2026!', $user->password)
        );

        $this->assertNotSame(
            $oldRememberToken,
            $user->getRememberToken()
        );

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_wrong_current_password_prevents_password_change(): void
    {
        $user = User::factory()->create([
            'password' => 'PasswordLama-2026!',
            'status_aktif' => true,
        ]);

        $originalHash = $user->password;

        $this->actingAs($user, 'web')
            ->patchJson('/api/user/password', [
                'current_password' => 'PasswordYangSalah-2026!',
                'password' => 'PasswordBaru-2026!',
                'password_confirmation' => 'PasswordBaru-2026!',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password']);

        $this->assertSame(
            $originalHash,
            $user->fresh()->password
        );
    }

    public function test_invalid_new_password_is_rejected(): void
    {
        $user = User::factory()->create([
            'password' => 'PasswordLama-2026!',
            'status_aktif' => true,
        ]);

        $originalHash = $user->password;

        $this->actingAs($user, 'web')
            ->patchJson('/api/user/password', [
                'current_password' => 'PasswordLama-2026!',
                'password' => 'passwordtanpakombinasi',
                'password_confirmation' => 'passwordtanpakombinasi',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->assertSame(
            $originalHash,
            $user->fresh()->password
        );
    }

    public function test_guest_cannot_change_password(): void
    {
        $this->patchJson('/api/user/password', [
            'current_password' => 'PasswordLama-2026!',
            'password' => 'PasswordBaru-2026!',
            'password_confirmation' => 'PasswordBaru-2026!',
        ])->assertUnauthorized();
    }

    public function test_password_change_removes_other_sessions_of_the_same_user(): void
    {
        $user = User::factory()->create([
            'password' => 'PasswordLama-2026!',
            'status_aktif' => true,
        ]);

        $anotherUser = User::factory()->create([
            'status_aktif' => true,
        ]);

        $otherSessionId = Str::random(40);
        $unrelatedSessionId = Str::random(40);

        DB::table('sessions')->insert([
            [
                'id' => $otherSessionId,
                'user_id' => $user->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Browser perangkat lain',
                'payload' => base64_encode(serialize([])),
                'last_activity' => now()->timestamp,
            ],
            [
                'id' => $unrelatedSessionId,
                'user_id' => $anotherUser->id,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Browser pengguna lain',
                'payload' => base64_encode(serialize([])),
                'last_activity' => now()->timestamp,
            ],
        ]);

        $this->actingAs($user, 'web')
            ->patchJson('/api/user/password', [
                'current_password' => 'PasswordLama-2026!',
                'password' => 'PasswordBaru-2026!',
                'password_confirmation' => 'PasswordBaru-2026!',
            ])
            ->assertNoContent();

        $this->assertDatabaseMissing('sessions', [
            'id' => $otherSessionId,
        ]);

        $this->assertDatabaseHas('sessions', [
            'id' => $unrelatedSessionId,
            'user_id' => $anotherUser->id,
        ]);

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_mismatched_confirmation_prevents_password_change(): void
    {
        $user = User::factory()->create([
            'password' => 'PasswordLama-2026!',
            'status_aktif' => true,
        ]);

        $originalHash = $user->password;

        $this->actingAs($user, 'web')
            ->patchJson('/api/user/password', [
                'current_password' => 'PasswordLama-2026!',
                'password' => 'PasswordBaru-2026!',
                'password_confirmation' => 'KonfirmasiBerbeda-2026!',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->assertSame(
            $originalHash,
            $user->fresh()->password
        );
    }

    public function test_new_password_cannot_equal_current_password(): void
    {
        $user = User::factory()->create([
            'password' => 'PasswordLama-2026!',
            'status_aktif' => true,
        ]);

        $originalHash = $user->password;

        $this->actingAs($user, 'web')
            ->patchJson('/api/user/password', [
                'current_password' => 'PasswordLama-2026!',
                'password' => 'PasswordLama-2026!',
                'password_confirmation' => 'PasswordLama-2026!',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->assertSame(
            $originalHash,
            $user->fresh()->password
        );
    }

    public function test_inactive_user_cannot_change_password(): void
    {
        $user = User::factory()->create([
            'password' => 'PasswordLama-2026!',
            'status_aktif' => true,
        ]);

        $this->actingAs($user, 'web');

        $user->status_aktif = false;
        $user->save();

        $originalHash = $user->password;

        $this->patchJson('/api/user/password', [
            'current_password' => 'PasswordLama-2026!',
            'password' => 'PasswordBaru-2026!',
            'password_confirmation' => 'PasswordBaru-2026!',
        ])->assertForbidden();

        $this->assertSame(
            $originalHash,
            $user->fresh()->password
        );

        $this->assertGuest('web');
    }

    public function test_new_user_requires_password_change_by_default(): void
    {
        $user = User::factory()->create();

        $user->refresh();

        $this->assertTrue($user->must_change_password);
        $this->assertNull($user->password_changed_at);
    }

    public function test_password_change_updates_password_lifecycle_fields(): void
    {
        $this->travelTo(
            now()->setDate(2026, 10, 19)->setTime(10, 0, 0)
        );

        try {
            $user = User::factory()->create([
                'password' => 'PasswordLama-2026!',
                'status_aktif' => true,
                'must_change_password' => true,
                'password_changed_at' => null,
            ]);

            $this->actingAs($user, 'web')
                ->patchJson('/api/user/password', [
                    'current_password' => 'PasswordLama-2026!',
                    'password' => 'PasswordBaru-2026!',
                    'password_confirmation' => 'PasswordBaru-2026!',
                ])
                ->assertNoContent();

            $user->refresh();

            $this->assertFalse($user->must_change_password);
            $this->assertNotNull($user->password_changed_at);
            
            $actual = $user->password_changed_at;
            $expected = now();

            $this->assertTrue($actual->equalTo($expected));
        } finally {
            $this->travelBack();
        }
    }
}
