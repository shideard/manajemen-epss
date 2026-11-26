<?php

namespace Tests\Feature\Planning;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PilihanPicTest extends TestCase
{
    use RefreshDatabase;

    private function createActor(UserRole $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);
    }

    public function test_verifikator_only_receives_active_operators(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);

        $operator = User::factory()->create([
            'name' => 'Operator Pengujian',
            'username' => 'operator.pic',
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
            'must_change_password' => true,
            'password_changed_at' => null,
        ]);

        User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => false,
        ]);

        $this->createActor(UserRole::SUPER_ADMIN_BIDANG);

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/pilihan/pic')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.per_page', 20)
            ->assertJsonPath('data.0.id', $operator->id)
            ->assertJsonPath('data.0.name', 'Operator Pengujian')
            ->assertJsonPath('data.0.username', 'operator.pic')
            ->assertJsonMissingPath('data.0.email')
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonMissingPath('data.0.remember_token');
    }

    public function test_operator_and_super_admin_cannot_access_pic_options(): void
    {
        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createActor($role);

            $this->actingAs($actor, 'web')
                ->getJson('/api/pilihan/pic')
                ->assertForbidden();
        }
    }

    public function test_guest_cannot_access_pic_options(): void
    {
        $this->getJson('/api/pilihan/pic')
            ->assertUnauthorized();
    }
}