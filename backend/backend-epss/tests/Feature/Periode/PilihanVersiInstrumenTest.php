<?php

namespace Tests\Feature\Periode;

use App\Enums\StatusVersiInstrumen;
use App\Enums\UserRole;
use App\Models\User;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PilihanVersiInstrumenTest extends TestCase
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

    public function test_verifikator_can_read_active_and_archived_versions(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);

        $arsip = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen lama',
            'versi' => 'UJI-2024',
            'berlaku_mulai' => '2024-01-01',
            'berlaku_sampai' => '2025-12-31',
            'status' => StatusVersiInstrumen::ARCHIVED,
        ]);

        $aktif = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen terbaru',
            'versi' => 'UJI-2026',
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/pilihan/versi-instrumen')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.per_page', 20)
            ->assertJsonPath('data.0.id', $aktif->id)
            ->assertJsonPath('data.0.versi', 'UJI-2026')
            ->assertJsonPath('data.0.status', 'ACTIVE')
            ->assertJsonPath('data.0.berlaku_sampai', null)
            ->assertJsonPath('data.1.id', $arsip->id)
            ->assertJsonPath('data.1.status', 'ARCHIVED')
            ->assertJsonPath('data.1.berlaku_sampai', '2025-12-31');

        $this->assertSame(
            StatusVersiInstrumen::ARCHIVED,
            $arsip->fresh()->status
        );
    }

    public function test_operator_and_super_admin_cannot_access_period_version_choices(): void
    {
        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createActor($role);

            $this->actingAs($actor, 'web')
                ->getJson('/api/pilihan/versi-instrumen')
                ->assertForbidden();
        }
    }

    public function test_guest_cannot_access_version_choices(): void
    {
        $this->getJson('/api/pilihan/versi-instrumen')
            ->assertUnauthorized();
    }
}