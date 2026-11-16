<?php

namespace Tests\Feature\Notifikasi;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PreferensiNotifikasiTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/user/notifikasi';

    private function user(): User
    {
        return User::factory()->create([
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);
    }

    public function test_defaults_then_saved_settings_are_per_user(): void
    {
        $a = $this->user();
        $b = $this->user();

        $this->actingAs($a, 'web')->getJson(self::URL)
            ->assertOk()
            ->assertExactJson(['data' => ['hari_pengingat' => [1, 7, 14, 30], 'dibaca' => []]]);

        $this->actingAs($a, 'web')->putJson(self::URL, ['hari_pengingat' => [7]])
            ->assertOk()
            ->assertJsonPath('data.hari_pengingat', [7]);

        // Dibaca digabung, bukan ditimpa, dan tidak mengubah pengaturan hari
        $this->actingAs($a, 'web')->putJson(self::URL, ['dibaca' => ['k1:7']])->assertOk();
        $this->actingAs($a, 'web')->putJson(self::URL, ['dibaca' => ['k1:7', 'k2:1']])
            ->assertOk()
            ->assertExactJson(['data' => ['hari_pengingat' => [7], 'dibaca' => ['k1:7', 'k2:1']]]);

        $this->app['auth']->forgetGuards();
        $this->actingAs($b, 'web')->getJson(self::URL)
            ->assertExactJson(['data' => ['hari_pengingat' => [1, 7, 14, 30], 'dibaca' => []]]);
    }

    public function test_invalid_day_and_guest_are_rejected(): void
    {
        $this->getJson(self::URL)->assertUnauthorized();

        $this->actingAs($this->user(), 'web')
            ->putJson(self::URL, ['hari_pengingat' => [3]])
            ->assertJsonValidationErrors(['hari_pengingat.0']);
    }
}
