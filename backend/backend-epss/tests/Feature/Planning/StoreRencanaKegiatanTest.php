<?php

namespace Tests\Feature\Planning;

use App\Enums\StatusPeriode;
use App\Enums\StatusVersiInstrumen;
use App\Enums\UserRole;
use App\Models\Opd;
use App\Models\PeriodeEvaluasi;
use App\Models\User;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class StoreRencanaKegiatanTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(UserRole $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);
    }

    private function createScenario(
        StatusPeriode $status = StatusPeriode::AKTIF
    ): array {
        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen Pengujian',
            'versi' => 'UJI-' . Str::uuid(),
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $periode = new PeriodeEvaluasi([
            'versi_instrumen_id' => $versi->id,
            'nama_periode' => 'Periode Pengujian',
            'tahun_mulai' => today()->year,
            'tahun_selesai' => today()->year + 1,
            'tanggal_mulai' => null,
            'tanggal_selesai' => null,
        ]);
        $periode->status = $status;
        $periode->save();

        $pic = $this->createUser(UserRole::OPERATOR);

        $opd = new Opd([
            'kode' => 'UJI-' . Str::uuid(),
            'nama' => 'OPD Pengujian',
        ]);
        $opd->status_aktif = true;
        $opd->save();

        $tanggalMulai = today()->addDay();
        $tanggalSelesai = $tanggalMulai->copy()->addDays(10);

        return [
            'periode' => $periode,
            'pic' => $pic,
            'opd' => $opd,
            'payload' => [
                'periode_id' => $periode->id,
                'pic_user_id' => $pic->id,
                'opd_id' => $opd->id,
                'nama_kegiatan' => 'Kegiatan Pengujian',
                'deskripsi' => 'Deskripsi kegiatan untuk pengujian.',
                'tanggal_mulai_rencana' => $tanggalMulai->toDateString(),
                'tanggal_selesai_rencana' => $tanggalSelesai->toDateString(),
                'reminder_mulai_hari' => 5,
                'reminder_selesai_hari' => 3,
            ],
        ];
    }

    public function test_verifikator_can_create_activity_and_server_sets_creator_and_year(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated()
            ->assertJsonPath('data.created_by', $verifikator->id)
            ->assertJsonPath(
                'data.tahun_kegiatan',
                (int) substr($scenario['payload']['tanggal_mulai_rencana'], 0, 4)
            )
            ->assertJsonPath('data.status_kegiatan', 'BELUM_MULAI');

        $this->assertDatabaseHas('rencana_kegiatan', [
            'periode_id' => $scenario['periode']->id,
            'created_by' => $verifikator->id,
            'pic_user_id' => $scenario['pic']->id,
            'opd_id' => $scenario['opd']->id,
            'tahun_kegiatan' => (int) substr(
                $scenario['payload']['tanggal_mulai_rencana'],
                0,
                4
            ),
        ]);
    }

    public function test_operator_and_super_admin_cannot_create_activity(): void
    {
        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createUser($role);

            $this->actingAs($actor, 'web')
                ->postJson('/api/rencana-kegiatan', [])
                ->assertForbidden();
        }
    }

    public function test_guest_cannot_create_activity(): void
    {
        $this->postJson('/api/rencana-kegiatan', [])
            ->assertUnauthorized();
    }

    public function test_locked_period_cannot_be_used_to_create_activity(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario(StatusPeriode::TERKUNCI);

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['periode_id']);

        $this->assertDatabaseCount('rencana_kegiatan', 0);
    }

    public function test_client_cannot_submit_creator_or_activity_year(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $payload = [
            ...$scenario['payload'],
            'created_by' => $verifikator->id,
            'tahun_kegiatan' => 1900,
        ];

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'created_by',
                'tahun_kegiatan',
            ]);

        $this->assertDatabaseCount('rencana_kegiatan', 0);
    }

    public function test_end_date_cannot_be_before_start_date(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $scenario['payload']['tanggal_selesai_rencana'] =
            today()->toDateString();

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['tanggal_selesai_rencana']);

        $this->assertDatabaseCount('rencana_kegiatan', 0);
    }
}