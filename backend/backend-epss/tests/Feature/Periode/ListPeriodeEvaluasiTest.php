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

class ListPeriodeEvaluasiTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_and_verifikator_can_list_available_periods(): void
    {
        $verifikator = User::factory()->create([
            'role' => UserRole::VERIFIKATOR,
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        $operator = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen pengujian',
            'versi' => 'UJI-PERIODE',
            'berlaku_mulai' => '2025-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $periodeIds = [];

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

            $periodeIds[$status->value] = $periode->id;
        }

        foreach ([$operator, $verifikator] as $user) {
            $response = $this->actingAs($user, 'web')
                ->getJson('/api/periode-evaluasi');

            $response->assertOk()
                ->assertJsonCount(2, 'data')
                ->assertJsonPath('meta.total', 2)
                ->assertJsonPath('meta.per_page', 6);

            $this->assertEqualsCanonicalizing(
                [
                    $periodeIds['AKTIF'],
                    $periodeIds['TERKUNCI'],
                ],
                array_column($response->json('data'), 'id')
            );

            $response->assertJsonFragment([
                'tahun_mulai' => 2025,
                'tahun_selesai' => 2026,
                'tanggal_mulai' => '2027-03-01',
                'tanggal_selesai' => '2027-06-30',
            ]);
        }
    }

    public function test_super_admin_cannot_access_period_selection(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        $this->actingAs($admin, 'web')
            ->getJson('/api/periode-evaluasi')
            ->assertForbidden();
    }

    public function test_guest_cannot_list_periods(): void
    {
        $this->getJson('/api/periode-evaluasi')
            ->assertUnauthorized();
    }
}
