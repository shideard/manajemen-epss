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

class ActivatePeriodeEvaluasiTest extends TestCase
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

    private function createPeriod(): PeriodeEvaluasi
    {
        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen pengujian aktivasi',
            'versi' => 'UJI-AKTIVASI',
            'berlaku_mulai' => '2025-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $periode = PeriodeEvaluasi::create([
            'versi_instrumen_id' => $versi->id,
            'nama_periode' => 'Periode pengujian aktivasi',
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2026,
            'tanggal_mulai' => '2027-03-01',
            'tanggal_selesai' => '2027-06-30',
        ]);

        return $periode->refresh();
    }

    public function test_verifikator_can_activate_draft_period(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createPeriod();

        $this->actingAs($verifikator, 'web')
            ->patchJson("/api/periode-evaluasi/{$periode->id}/aktivasi")
            ->assertOk()
            ->assertJsonPath('data.status', 'AKTIF');

        $periode->refresh();

        $this->assertSame(StatusPeriode::AKTIF, $periode->status);
        $this->assertNull($periode->closed_by);
        $this->assertNull($periode->closed_at);

        $this->getJson('/api/periode-evaluasi')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $periode->id,
                'status' => 'AKTIF',
            ]);
    }

    public function test_operator_and_super_admin_cannot_activate_period(): void
    {
        $periode = $this->createPeriod();

        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createActor($role);

            $this->actingAs($actor, 'web')
                ->patchJson("/api/periode-evaluasi/{$periode->id}/aktivasi")
                ->assertForbidden();
        }

        $this->assertSame(
            StatusPeriode::DRAFT,
            $periode->fresh()->status
        );
    }

    public function test_active_period_cannot_be_activated_again(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createPeriod();

        $periode->status = StatusPeriode::AKTIF;
        $periode->save();

        $this->actingAs($verifikator, 'web')
            ->patchJson("/api/periode-evaluasi/{$periode->id}/aktivasi")
            ->assertStatus(409);

        $this->assertSame(
            StatusPeriode::AKTIF,
            $periode->fresh()->status
        );
    }

    public function test_verifikator_can_reactivate_locked_period_and_preserve_last_closure(): void
{
    $previousVerifikator = $this->createActor(UserRole::VERIFIKATOR);
    $currentVerifikator = $this->createActor(UserRole::VERIFIKATOR);

    $periode = $this->createPeriod();

    $periode->status = StatusPeriode::TERKUNCI;
    $periode->closed_by = $previousVerifikator->id;
    $periode->closed_at = now()->subDay()->startOfSecond();
    $periode->save();

    $periode->refresh();

    $previousClosedAt = $periode->closed_at;

    $this->actingAs($currentVerifikator, 'web')
        ->patchJson("/api/periode-evaluasi/{$periode->id}/aktivasi")
        ->assertOk()
        ->assertJsonPath('data.status', 'AKTIF');

    $periode->refresh();

    $this->assertSame(
        StatusPeriode::AKTIF,
        $periode->status
    );

    $this->assertSame(
        $previousVerifikator->id,
        $periode->closed_by
    );

    $this->assertNotNull($periode->closed_at);

    $this->assertTrue(
        $periode->closed_at->equalTo($previousClosedAt)
    );
}
}