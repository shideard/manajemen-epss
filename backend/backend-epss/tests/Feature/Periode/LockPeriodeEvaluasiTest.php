<?php

namespace Tests\Feature\Periode;

use App\Enums\StatusPeriode;
use App\Enums\StatusVersiInstrumen;
use App\Enums\UserRole;
use App\Models\PeriodeEvaluasi;
use App\Models\User;
use App\Models\VersiInstrumenEPSS;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LockPeriodeEvaluasiTest extends TestCase
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
            'nama' => 'Instrumen pengujian penguncian',
            'versi' => 'UJI-KUNCI',
            'berlaku_mulai' => '2025-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $periode = new PeriodeEvaluasi([
            'versi_instrumen_id' => $versi->id,
            'nama_periode' => 'Periode pengujian penguncian',
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2026,
            'tanggal_mulai' => '2027-03-01',
            'tanggal_selesai' => '2027-06-30',
        ]);

        $periode->status = StatusPeriode::AKTIF;
        $periode->save();

        return $periode->refresh();
    }

    public function test_verifikator_can_lock_and_update_last_closure(): void
    {
        $this->travelTo(
            CarbonImmutable::parse('2027-06-30 10:00:00', 'UTC')
        );

        try {
            $previousVerifikator = $this->createActor(
                UserRole::VERIFIKATOR
            );

            $currentVerifikator = $this->createActor(
                UserRole::VERIFIKATOR
            );

            $periode = $this->createPeriod();

            // Kondisi periode yang sebelumnya pernah ditutup,
            // lalu sudah dibuka kembali.
            $periode->closed_by = $previousVerifikator->id;
            $periode->closed_at = now()->subDay();
            $periode->save();

            $this->actingAs($currentVerifikator, 'web')
                ->patchJson("/api/periode-evaluasi/{$periode->id}/kunci")
                ->assertOk()
                ->assertJsonPath('data.status', 'TERKUNCI');

            $periode->refresh();

            $this->assertSame(
                StatusPeriode::TERKUNCI,
                $periode->status
            );

            $this->assertSame(
                $currentVerifikator->id,
                $periode->closed_by
            );

            $this->assertNotNull($periode->closed_at);

            $this->assertTrue(
                $periode->closed_at->equalTo(now())
            );
        } finally {
            $this->travelBack();
        }
    }

    public function test_operator_and_super_admin_cannot_lock_period(): void
    {
        $periode = $this->createPeriod();

        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createActor($role);

            $this->actingAs($actor, 'web')
                ->patchJson("/api/periode-evaluasi/{$periode->id}/kunci")
                ->assertForbidden();
        }

        $periode->refresh();

        $this->assertSame(StatusPeriode::AKTIF, $periode->status);
        $this->assertNull($periode->closed_by);
        $this->assertNull($periode->closed_at);
    }

    public function test_draft_and_locked_periods_cannot_be_locked(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createPeriod();

        foreach ([
            StatusPeriode::DRAFT,
            StatusPeriode::TERKUNCI,
        ] as $status) {
            $periode->status = $status;

            $periode->closed_by =
                $status === StatusPeriode::TERKUNCI
                    ? $verifikator->id
                    : null;

            $periode->closed_at =
                $status === StatusPeriode::TERKUNCI
                    ? now()->subDay()->startOfSecond()
                    : null;

            $periode->save();
            $periode->refresh();

            $before = $periode->only([
                'status',
                'closed_by',
                'closed_at',
            ]);

            $this->actingAs($verifikator, 'web')
                ->patchJson("/api/periode-evaluasi/{$periode->id}/kunci")
                ->assertStatus(409);

            $this->assertEquals(
                $before,
                $periode->fresh()->only([
                    'status',
                    'closed_by',
                    'closed_at',
                ])
            );
        }
    }
}