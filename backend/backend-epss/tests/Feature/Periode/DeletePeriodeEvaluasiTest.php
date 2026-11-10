<?php

namespace Tests\Feature\Periode;

use App\Enums\StatusPeriode;
use App\Enums\StatusVersiInstrumen;
use App\Enums\UserRole;
use App\Models\PeriodeEvaluasi;
use App\Models\User;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeletePeriodeEvaluasiTest extends TestCase
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

    private function createLockedPeriod(User $verifikator): PeriodeEvaluasi
    {
        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen pengujian penghapusan',
            'versi' => 'UJI-HAPUS',
            'berlaku_mulai' => '2025-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $periode = new PeriodeEvaluasi([
            'versi_instrumen_id' => $versi->id,
            'nama_periode' => 'Periode pengujian penghapusan',
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2026,
        ]);

        $periode->status = StatusPeriode::TERKUNCI;
        $periode->closed_by = $verifikator->id;
        $periode->closed_at = now();
        $periode->save();

        return $periode->refresh();
    }

    public function test_verifikator_can_delete_locked_period_without_related_data(): void
    {
        $this->withoutExceptionHandling();
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createLockedPeriod($verifikator);

        $this->actingAs($verifikator, 'web')
            ->deleteJson("/api/periode-evaluasi/{$periode->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('periode_evaluasi', [
            'id' => $periode->id,
        ]);
    }

    public function test_operator_and_super_admin_cannot_delete_period(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createLockedPeriod($verifikator);

        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createActor($role);

            $this->actingAs($actor, 'web')
                ->deleteJson("/api/periode-evaluasi/{$periode->id}")
                ->assertForbidden();
        }

        $this->assertDatabaseHas('periode_evaluasi', [
            'id' => $periode->id,
        ]);
    }

    public function test_guest_cannot_delete_period(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createLockedPeriod($verifikator);

        $this->deleteJson("/api/periode-evaluasi/{$periode->id}")
            ->assertUnauthorized();

        $this->assertDatabaseHas('periode_evaluasi', [
            'id' => $periode->id,
        ]);
    }
}