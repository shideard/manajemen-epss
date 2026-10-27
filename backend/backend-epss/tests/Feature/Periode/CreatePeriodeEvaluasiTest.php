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


class CreatePeriodeEvaluasiTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(): array
    {
        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen pengujian periode',
            'versi' => 'UJI-CREATE-PERIODE',
            'berlaku_mulai' => '2025-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        return [
            'versi_instrumen_id' => $versi->id,
            'nama_periode' => 'Evaluasi kegiatan 2025–2026',
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2026,
            'tanggal_mulai' => '2027-03-01',
            'tanggal_selesai' => '2027-06-30',
        ];
    }

    private function createActor(UserRole $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);
    }

    public function test_verifikator_can_create_a_draft_period(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $payload = $this->validPayload();

        $response = $this->actingAs($verifikator, 'web')
            ->postJson('/api/periode-evaluasi', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.nama_periode', $payload['nama_periode'])
            ->assertJsonPath('data.status', 'DRAFT')
            ->assertJsonPath('data.closed_at', null);

        $periode = PeriodeEvaluasi::findOrFail(
            $response->json('data.id')
        );

        $this->assertSame(StatusPeriode::DRAFT, $periode->status);
        $this->assertNull($periode->closed_by);
        $this->assertNull($periode->closed_at);

        $this->assertDatabaseHas('periode_evaluasi', $payload);
    }

    public function test_operator_and_super_admin_cannot_create_periods(): void
    {
        $payload = $this->validPayload();

        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createActor($role);

            $this->actingAs($actor, 'web')
                ->postJson('/api/periode-evaluasi', $payload)
                ->assertForbidden();
        }

        $this->assertDatabaseCount('periode_evaluasi', 0);
    }

    public function test_reversed_year_and_date_ranges_are_rejected(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $payload = $this->validPayload();

        $payload['tahun_selesai'] = 2024;
        $payload['tanggal_selesai'] = '2027-02-28';

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/periode-evaluasi', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'tahun_selesai',
                'tanggal_selesai',
            ]);

        $this->assertDatabaseCount('periode_evaluasi', 0);
    }

    public function test_client_cannot_set_status_or_closure_metadata(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $payload = $this->validPayload();

        $payload['status'] = StatusPeriode::TERKUNCI->value;
        $payload['closed_by'] = $verifikator->id;
        $payload['closed_at'] = '2027-06-30T10:00:00Z';

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/periode-evaluasi', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'status',
                'closed_by',
                'closed_at',
            ]);

        $this->assertDatabaseCount('periode_evaluasi', 0);
    }

    public function test_creating_period_reactivates_archived_instrument(): void
    {
        $verifikator = $this->createActor(UserRole::VERIFIKATOR);
        $payload = $this->validPayload();

        $versi = VersiInstrumenEPSS::findOrFail(
            $payload['versi_instrumen_id']
        );

        $versi->status = StatusVersiInstrumen::ARCHIVED;
        $versi->save();

        $this->assertSame(
            StatusVersiInstrumen::ARCHIVED,
            $versi->fresh()->status
        );

        $response = $this->actingAs($verifikator, 'web')
            ->postJson('/api/periode-evaluasi', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'DRAFT')
            ->assertJsonPath(
                'data.versi_instrumen_id',
                $versi->id
            );

        $this->assertSame(
            StatusVersiInstrumen::ACTIVE,
            $versi->fresh()->status
        );

        $this->assertDatabaseHas('periode_evaluasi', [
            'id' => $response->json('data.id'),
            'versi_instrumen_id' => $versi->id,
            'status' => 'DRAFT',
        ]);
    }

    public function test_invalid_period_does_not_reactivate_archived_instrument(): void
        {
            $verifikator = $this->createActor(UserRole::VERIFIKATOR);
            $payload = $this->validPayload();

            $versi = VersiInstrumenEPSS::findOrFail(
                $payload['versi_instrumen_id']
            );

            $versi->status = StatusVersiInstrumen::ARCHIVED;
            $versi->save();

            $payload['tanggal_selesai'] = '2027-02-28';

            $this->actingAs($verifikator, 'web')
                ->postJson('/api/periode-evaluasi', $payload)
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['tanggal_selesai']);

            $this->assertSame(
                StatusVersiInstrumen::ARCHIVED,
                $versi->fresh()->status
            );

            $this->assertDatabaseCount('periode_evaluasi', 0);
        }

        public function test_period_dates_are_optional(): void
        {
            $verifikator = $this->createActor(UserRole::VERIFIKATOR);
            $basePayload = $this->validPayload();

            unset(
                $basePayload['tanggal_mulai'],
                $basePayload['tanggal_selesai']
            );

            $cases = [
                'omitted' => [],
                'explicit_null' => [
                    'tanggal_mulai' => null,
                    'tanggal_selesai' => null,
                ],
                'start_only' => [
                    'tanggal_mulai' => '2027-03-01',
                ],
                'end_only' => [
                    'tanggal_selesai' => '2027-06-30',
                ],
            ];

            foreach ($cases as $name => $dates) {
                $payload = array_merge($basePayload, $dates, [
                    'nama_periode' => 'Periode pengujian ' . $name,
                ]);

                $expectedStart = $dates['tanggal_mulai'] ?? null;
                $expectedEnd = $dates['tanggal_selesai'] ?? null;

                $response = $this->actingAs($verifikator, 'web')
                    ->postJson('/api/periode-evaluasi', $payload);

                $response->assertCreated()
                    ->assertJsonPath('data.status', 'DRAFT')
                    ->assertJsonPath('data.tanggal_mulai', $expectedStart)
                    ->assertJsonPath('data.tanggal_selesai', $expectedEnd);

                $this->assertDatabaseHas('periode_evaluasi', [
                    'id' => $response->json('data.id'),
                    'tanggal_mulai' => $expectedStart,
                    'tanggal_selesai' => $expectedEnd,
                ]);

                $this->getJson(
                    '/api/periode-evaluasi/' . $response->json('data.id')
                )
                    ->assertOk()
                    ->assertJsonPath('data.tanggal_mulai', $expectedStart)
                    ->assertJsonPath('data.tanggal_selesai', $expectedEnd);
            }
        }
}
