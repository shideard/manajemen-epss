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

class ManagePeriodeEvaluasiTest extends TestCase
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

    public function test_verifikator_can_list_periods_in_all_statuses(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);

        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen pengujian pengelolaan',
            'versi' => 'UJI-PENGELOLAAN',
            'berlaku_mulai' => '2025-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        foreach (StatusPeriode::cases() as $status) {
            $periode = new PeriodeEvaluasi([
                'versi_instrumen_id' => $versi->id,
                'nama_periode' => 'Periode ' . $status->value,
                'tahun_mulai' => 2025,
                'tahun_selesai' => 2026,
                'tanggal_mulai' => '2027-03-01',
                'tanggal_selesai' => '2027-06-30',
            ]);

            $periode->status = $status;

            if ($status === StatusPeriode::TERKUNCI) {
                $periode->closed_by = $verifikator->id;
                $periode->closed_at = '2027-06-30 10:00:00';
            }

            $periode->save();
        }

        $response = $this->actingAs($verifikator, 'web')
            ->getJson('/api/pengelolaan/periode-evaluasi');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.per_page', 7);

        $this->assertEqualsCanonicalizing(
            ['DRAFT', 'AKTIF', 'TERKUNCI'],
            array_column($response->json('data'), 'status')
        );
    }

    public function test_operator_and_super_admin_cannot_list_management_periods(): void
    {
        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createActor($role);

            $this->actingAs($actor, 'web')
                ->getJson('/api/pengelolaan/periode-evaluasi')
                ->assertForbidden();
        }
    }

    public function test_guest_cannot_list_management_periods(): void
        {
            $this->getJson('/api/pengelolaan/periode-evaluasi')
                ->assertUnauthorized();
        }
}
