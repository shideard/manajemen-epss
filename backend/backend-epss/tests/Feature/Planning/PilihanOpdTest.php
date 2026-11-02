<?php

namespace Tests\Feature\Planning;

use App\Enums\UserRole;
use App\Models\Opd;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PilihanOpdTest extends TestCase
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

    public function test_verifikator_only_receives_active_opd_options(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);

        $aktif = new Opd([
            'kode' => 'UJI-A',
            'nama' => 'OPD Aktif Pengujian',
        ]);

        $aktif->status_aktif = true;
        $aktif->save();

        $nonaktif = new Opd([
            'kode' => 'UJI-N',
            'nama' => 'OPD Nonaktif Pengujian',
        ]);

        $nonaktif->status_aktif = false;
        $nonaktif->save();

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/pilihan/opd')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $aktif->id)
            ->assertJsonPath('data.0.kode', 'UJI-A')
            ->assertJsonPath('data.0.nama', 'OPD Aktif Pengujian')
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.per_page', 20);

        $this->assertDatabaseHas('opds', [
            'id' => $nonaktif->id,
            'status_aktif' => false,
        ]);
    }

    public function test_operator_and_super_admin_cannot_access_planning_opd_options(): void
    {
        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createActor($role);

            $this->actingAs($actor, 'web')
                ->getJson('/api/pilihan/opd')
                ->assertForbidden();
        }
    }

    public function test_guest_cannot_access_opd_options(): void
    {
        $this->getJson('/api/pilihan/opd')
            ->assertUnauthorized();
    }
}