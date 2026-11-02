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

class UpdatePeriodeEvaluasiTest extends TestCase
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
            'nama' => 'Instrumen pengujian edit',
            'versi' => 'UJI-EDIT',
            'berlaku_mulai' => '2025-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        return PeriodeEvaluasi::create([
            'versi_instrumen_id' => $versi->id,
            'nama_periode' => 'Nama awal',
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2026,
            'tanggal_mulai' => '2027-03-01',
            'tanggal_selesai' => '2027-06-30',
        ])->refresh();
    }

    public function test_verifikator_can_edit_draft_and_active_periods(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createPeriod();

        foreach ([
            StatusPeriode::DRAFT,
            StatusPeriode::AKTIF,
        ] as $status) {
            $periode->status = $status;
            $periode->save();

            $name = 'Nama baru ' . $status->value;

            $this->actingAs($verifikator, 'web')
                ->patchJson("/api/periode-evaluasi/{$periode->id}", [
                    'nama_periode' => $name,
                ])
                ->assertOk()
                ->assertJsonPath('data.nama_periode', $name)
                ->assertJsonPath('data.status', $status->value)
                ->assertJsonPath('data.tanggal_mulai', '2027-03-01');

            $this->assertDatabaseHas('periode_evaluasi', [
                'id' => $periode->id,
                'nama_periode' => $name,
                'tahun_mulai' => 2025,
                'tahun_selesai' => 2026,
                'tanggal_selesai' => '2027-06-30',
            ]);
        }
    }

    public function test_verifikator_can_clear_optional_dates(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createPeriod();

        $this->actingAs($verifikator, 'web')
            ->patchJson("/api/periode-evaluasi/{$periode->id}", [
                'tanggal_mulai' => null,
                'tanggal_selesai' => null,
            ])
            ->assertOk()
            ->assertJsonPath('data.tanggal_mulai', null)
            ->assertJsonPath('data.tanggal_selesai', null);

        $this->assertDatabaseHas('periode_evaluasi', [
            'id' => $periode->id,
            'tanggal_mulai' => null,
            'tanggal_selesai' => null,
        ]);
    }

    public function test_partial_update_validates_ranges_against_stored_values(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createPeriod();

        $this->actingAs($verifikator, 'web')
            ->patchJson("/api/periode-evaluasi/{$periode->id}", [
                'tahun_mulai' => 2028,
                'tanggal_mulai' => '2027-07-01',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'tahun_selesai',
                'tanggal_selesai',
            ]);

        $this->assertDatabaseHas('periode_evaluasi', [
            'id' => $periode->id,
            'tahun_mulai' => 2025,
            'tanggal_mulai' => '2027-03-01',
        ]);
    }

    public function test_locked_period_cannot_be_edited(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createPeriod();

        $periode->status = StatusPeriode::TERKUNCI;
        $periode->closed_by = $verifikator->id;
        $periode->closed_at = now()->startOfSecond();
        $periode->save();

        $this->actingAs($verifikator, 'web')
            ->patchJson("/api/periode-evaluasi/{$periode->id}", [
                'nama_periode' => 'Tidak boleh tersimpan',
            ])
            ->assertStatus(409);

        $this->assertSame(
            'Nama awal',
            $periode->fresh()->nama_periode
        );
    }

    public function test_operator_and_super_admin_cannot_edit_period(): void
    {
        $periode = $this->createPeriod();

        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createActor($role);

            $this->actingAs($actor, 'web')
                ->patchJson("/api/periode-evaluasi/{$periode->id}", [
                    'nama_periode' => 'Tidak boleh tersimpan',
                ])
                ->assertForbidden();
        }

        $this->assertSame(
            'Nama awal',
            $periode->fresh()->nama_periode
        );
    }
}