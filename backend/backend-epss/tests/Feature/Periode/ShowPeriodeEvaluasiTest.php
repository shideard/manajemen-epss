<?php

namespace Tests\Feature\Periode;

use App\Enums\StatusPeriode;
use App\Enums\StatusVersiInstrumen;
use App\Enums\UserRole;
use App\Models\PeriodeEvaluasi;
use App\Models\User;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ShowPeriodeEvaluasiTest extends TestCase
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
            'nama' => 'Instrumen pengujian detail',
            'versi' => 'UJI-DETAIL',
            'berlaku_mulai' => '2025-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        return PeriodeEvaluasi::create([
            'versi_instrumen_id' => $versi->id,
            'nama_periode' => 'Evaluasi kegiatan 2025–2026',
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2026,
            'tanggal_mulai' => '2027-03-01',
            'tanggal_selesai' => '2027-06-30',
        ])->refresh();
    }

    public function test_verifikator_can_read_draft_with_instrument_details(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createPeriod();

        $this->actingAs($verifikator, 'web')
            ->getJson("/api/periode-evaluasi/{$periode->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $periode->id)
            ->assertJsonPath('data.status', 'DRAFT')
            ->assertJsonPath('data.tahun_mulai', 2025)
            ->assertJsonPath('data.tanggal_mulai', '2027-03-01')
            ->assertJsonPath(
                'data.versi_instrumen.id',
                $periode->versi_instrumen_id
            )
            ->assertJsonPath(
                'data.versi_instrumen.versi',
                'UJI-DETAIL'
            );
    }

    public function test_operator_cannot_read_draft_but_can_read_active_and_locked_period(): void
    {
        $operator = $this->createActor(UserRole::OPERATOR);
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $periode = $this->createPeriod();

        $this->actingAs($operator, 'web')
            ->getJson("/api/periode-evaluasi/{$periode->id}")
            ->assertForbidden();

        foreach ([
            StatusPeriode::AKTIF,
            StatusPeriode::TERKUNCI,
        ] as $status) {
            $periode->status = $status;

            if ($status === StatusPeriode::TERKUNCI) {
                $periode->closed_by = $verifikator->id;
                $periode->closed_at = now();
            }

            $periode->save();

            $this->getJson("/api/periode-evaluasi/{$periode->id}")
                ->assertOk()
                ->assertJsonPath('data.status', $status->value);
        }
    }

    public function test_super_admin_cannot_read_period_details(): void
    {
        $admin = $this->createActor(UserRole::SUPER_ADMIN_BIDANG);
        $periode = $this->createPeriod();

        $this->actingAs($admin, 'web')
            ->getJson("/api/periode-evaluasi/{$periode->id}")
            ->assertForbidden();
    }

    public function test_guest_cannot_read_period_details(): void
    {
        $periode = $this->createPeriod();

        $this->getJson("/api/periode-evaluasi/{$periode->id}")
            ->assertUnauthorized();
    }

    public function test_missing_period_returns_not_found(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $missingId = (string) Str::uuid();

        $this->actingAs($verifikator, 'web')
            ->getJson("/api/periode-evaluasi/{$missingId}")
            ->assertNotFound();
    }
}