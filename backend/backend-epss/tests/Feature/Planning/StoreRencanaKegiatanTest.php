<?php

namespace Tests\Feature\Planning;

use App\Enums\StatusPeriode;
use App\Enums\StatusVersiInstrumen;
use App\Enums\UserRole;
use App\Models\Opd;
use App\Models\PeriodeEvaluasi;
use App\Models\User;
use App\Models\VersiInstrumenEPSS;
use App\Models\AspekEPSS;
use App\Models\DomainEPSS;
use App\Models\IndikatorEPSS;
use App\Models\KegiatanIndikator;
use App\Models\DokumenBukti;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

    public function test_verifikator_can_list_activities_in_a_period(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/rencana-kegiatan?periode_id=' . $scenario['periode']->id)
            ->assertOk()
            ->assertJsonPath('data.0.periode_id', $scenario['periode']->id);
    }

    public function test_operator_can_view_activities_assigned_to_other_users(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();
        $operatorLain = $this->createUser(UserRole::OPERATOR);

        $payloadOperatorLain = [
            ...$scenario['payload'],
            'pic_user_id' => $operatorLain->id,
            'nama_kegiatan' => 'Kegiatan milik operator lain',
        ];

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $payloadOperatorLain)
            ->assertCreated();

        $this->actingAs($scenario['pic'], 'web')
            ->getJson('/api/rencana-kegiatan?periode_id=' . $scenario['periode']->id)
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment([
                'pic_user_id' => $operatorLain->id,
            ]);
    }

    public function test_activity_list_includes_opd_and_pic_names(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/rencana-kegiatan?periode_id=' . $scenario['periode']->id)
            ->assertOk()
            ->assertJsonPath('data.0.nama_opd', $scenario['opd']->nama)
            ->assertJsonPath('data.0.nama_pic', $scenario['pic']->name);
    }

    public function test_activity_list_can_search_by_description(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $targetResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $payloadLain = [
            ...$scenario['payload'],
            'nama_kegiatan' => 'Kegiatan lainnya',
            'deskripsi' => 'Deskripsi yang tidak cocok.',
        ];

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $payloadLain)
            ->assertCreated();

        $query = http_build_query([
            'periode_id' => $scenario['periode']->id,
            'q' => 'Deskripsi kegiatan untuk pengujian',
        ]);

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/rencana-kegiatan?' . $query)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $targetResponse->json('data.id'));
    }

    public function test_activity_list_can_filter_by_year(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $tanggalMulaiTahunDepan = today()->addYear();
        $payloadTahunDepan = [
            ...$scenario['payload'],
            'nama_kegiatan' => 'Kegiatan tahun depan',
            'tanggal_mulai_rencana' => $tanggalMulaiTahunDepan->toDateString(),
            'tanggal_selesai_rencana' => $tanggalMulaiTahunDepan
                ->copy()
                ->addDays(10)
                ->toDateString(),
        ];

        $targetResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $payloadTahunDepan)
            ->assertCreated();

        $query = http_build_query([
            'periode_id' => $scenario['periode']->id,
            'tahun' => $tanggalMulaiTahunDepan->year,
        ]);

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/rencana-kegiatan?' . $query)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $targetResponse->json('data.id'));
    }

    public function test_activity_list_can_filter_by_opd(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $targetResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $opdLain = new Opd([
            'kode' => 'UJI-' . Str::uuid(),
            'nama' => 'OPD Lain',
        ]);
        $opdLain->status_aktif = true;
        $opdLain->save();

        $payloadOpdLain = [
            ...$scenario['payload'],
            'opd_id' => $opdLain->id,
            'nama_kegiatan' => 'Kegiatan OPD lain',
        ];

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $payloadOpdLain)
            ->assertCreated();

        $query = http_build_query([
            'periode_id' => $scenario['periode']->id,
            'opd_id' => $scenario['opd']->id,
        ]);

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/rencana-kegiatan?' . $query)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $targetResponse->json('data.id'));
    }

    public function test_activity_list_can_filter_by_pic(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();
        $picLain = $this->createUser(UserRole::OPERATOR);

        $targetResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $payloadPicLain = [
            ...$scenario['payload'],
            'pic_user_id' => $picLain->id,
            'nama_kegiatan' => 'Kegiatan PIC lain',
        ];

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $payloadPicLain)
            ->assertCreated();

        $query = http_build_query([
            'periode_id' => $scenario['periode']->id,
            'pic_user_id' => $scenario['pic']->id,
        ]);

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/rencana-kegiatan?' . $query)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $targetResponse->json('data.id'));
    }

    public function test_activity_list_can_filter_by_status(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $payloadBerjalan = [
            ...$scenario['payload'],
            'nama_kegiatan' => 'Kegiatan yang sedang berjalan',
            'tanggal_mulai_rencana' => today()->subDay()->toDateString(),
            'tanggal_selesai_rencana' => today()->addDay()->toDateString(),
        ];

        $targetResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $payloadBerjalan)
            ->assertCreated();

        $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $query = http_build_query([
            'periode_id' => $scenario['periode']->id,
            'status' => 'BERJALAN',
        ]);

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/rencana-kegiatan?' . $query)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $targetResponse->json('data.id'))
            ->assertJsonPath('data.0.status_kegiatan', 'BERJALAN');
    }

    public function test_verifikator_can_view_activity_detail(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/rencana-kegiatan/' . $activityId)
            ->assertOk()
            ->assertJsonPath('data.id', $activityId)
            ->assertJsonPath('data.nama_kegiatan', 'Kegiatan Pengujian')
            ->assertJsonPath('data.nama_opd', $scenario['opd']->nama)
            ->assertJsonPath('data.nama_pic', $scenario['pic']->name);
    }

    public function test_operator_can_view_activity_detail_as_reference(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $operatorLain = $this->createUser(UserRole::OPERATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        $this->actingAs($operatorLain, 'web')
            ->getJson('/api/rencana-kegiatan/' . $activityId)
            ->assertOk()
            ->assertJsonPath('data.id', $activityId)
            ->assertJsonPath('data.pic_user_id', $scenario['pic']->id);
    }

    public function test_verifikator_can_update_activity_in_active_period(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        $this->actingAs($verifikator, 'web')
            ->patchJson('/api/rencana-kegiatan/' . $activityId, [
                'nama_kegiatan' => 'Nama kegiatan diperbarui',
            ])
            ->assertOk()
            ->assertJsonPath('data.id', $activityId)
            ->assertJsonPath('data.nama_kegiatan', 'Nama kegiatan diperbarui');
    }

    public function test_locked_period_activity_cannot_be_updated(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        $scenario['periode']->status = StatusPeriode::TERKUNCI;
        $scenario['periode']->save();

        $this->actingAs($verifikator, 'web')
            ->patchJson('/api/rencana-kegiatan/' . $activityId, [
                'nama_kegiatan' => 'Tidak boleh berubah',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('rencana_kegiatan', [
            'id' => $activityId,
            'nama_kegiatan' => 'Kegiatan Pengujian',
        ]);
    }

    public function test_operator_and_super_admin_cannot_update_activity(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createUser($role);

            $this->app['auth']->forgetGuards();

            $this->assertSame($role, $actor->fresh()->role);

            $this->actingAs($actor, 'web')
                ->getJson('/api/user')
                ->assertOk()
                ->assertJsonPath('id', $actor->id);

            $this->actingAs($actor, 'web')
                ->patchJson('/api/rencana-kegiatan/' . $activityId, [
                    'nama_kegiatan' => 'Perubahan tidak diizinkan',
                ])
                ->assertForbidden();
        }

        $this->assertDatabaseHas('rencana_kegiatan', [
            'id' => $activityId,
            'nama_kegiatan' => 'Kegiatan Pengujian',
        ]);
    }

    public function test_verifikator_can_map_indicator_to_activity(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        $domain = DomainEPSS::create([
            'versi_instrumen_id' => $scenario['periode']->versi_instrumen_id,
            'kode' => '2',
            'nama' => 'Kualitas Data',
            'bobot' => '24.0000',
        ]);

        $aspek = AspekEPSS::create([
            'domain_id' => $domain->id,
            'kode' => '201',
            'nama' => 'Relevansi',
            'bobot' => '30.0000',
        ]);

        $indikator = IndikatorEPSS::create([
            'aspek_id' => $aspek->id,
            'kode' => '20101',
            'nama' => 'Relevansi Data terhadap Pengguna',
            'deskripsi' => 'Mengukur relevansi data terhadap kebutuhan pengguna.',
            'bobot' => '40.0000',
        ]);

        $this->actingAs($verifikator, 'web')
            ->putJson(
                '/api/rencana-kegiatan/' . $activityId . '/indikator',
                ['indikator_ids' => [$indikator->id]]
            )
            ->assertNoContent();

        $this->assertDatabaseHas('kegiatan_indikator', [
            'kegiatan_id' => $activityId,
            'indikator_id' => $indikator->id,
            'created_by' => $verifikator->id,
        ]);
    }


    public function test_operator_and_super_admin_cannot_map_indicators_to_activity(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            $actor = $this->createUser($role);

            $this->app['auth']->forgetGuards();

            $this->actingAs($actor, 'web')
                ->getJson('/api/user')
                ->assertOk()
                ->assertJsonPath('id', $actor->id);

            $this->actingAs($actor, 'web')
                ->putJson(
                    '/api/rencana-kegiatan/' . $activityId . '/indikator',
                    ['indikator_ids' => []]
                )
                ->assertForbidden();
        }

        $this->assertDatabaseCount('kegiatan_indikator', 0);
    }

    public function test_verifikator_cannot_map_indicator_from_another_instrument_version(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        $versiLain = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen Versi Lain',
            'versi' => 'LAIN-' . Str::uuid(),
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $domainLain = DomainEPSS::create([
            'versi_instrumen_id' => $versiLain->id,
            'kode' => '2',
            'nama' => 'Kualitas Data',
            'bobot' => '24.0000',
        ]);

        $aspekLain = AspekEPSS::create([
            'domain_id' => $domainLain->id,
            'kode' => '201',
            'nama' => 'Relevansi',
            'bobot' => '30.0000',
        ]);

        $indikatorLain = IndikatorEPSS::create([
            'aspek_id' => $aspekLain->id,
            'kode' => '20101',
            'nama' => 'Indikator dari versi lain',
            'deskripsi' => 'Indikator ini tidak termasuk versi periode kegiatan.',
            'bobot' => '40.0000',
        ]);

        $this->actingAs($verifikator, 'web')
            ->putJson(
                '/api/rencana-kegiatan/' . $activityId . '/indikator',
                ['indikator_ids' => [$indikatorLain->id]]
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['indikator_ids']);

        $this->assertDatabaseCount('kegiatan_indikator', 0);
    }

    public function test_mapping_update_adds_removes_and_preserves_existing_pairs(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        $domain = DomainEPSS::create([
            'versi_instrumen_id' => $scenario['periode']->versi_instrumen_id,
            'kode' => '2',
            'nama' => 'Kualitas Data',
            'bobot' => '24.0000',
        ]);

        $aspek = AspekEPSS::create([
            'domain_id' => $domain->id,
            'kode' => '201',
            'nama' => 'Relevansi',
            'bobot' => '30.0000',
        ]);

        $indikatorSatu = IndikatorEPSS::create([
            'aspek_id' => $aspek->id,
            'kode' => '20101',
            'nama' => 'Indikator pertama',
            'deskripsi' => 'Indikator pertama untuk pengujian.',
            'bobot' => '40.0000',
        ]);

        $indikatorDua = IndikatorEPSS::create([
            'aspek_id' => $aspek->id,
            'kode' => '20102',
            'nama' => 'Indikator kedua',
            'deskripsi' => 'Indikator kedua untuk pengujian.',
            'bobot' => '60.0000',
        ]);

        $this->actingAs($verifikator, 'web')
            ->putJson(
                '/api/rencana-kegiatan/' . $activityId . '/indikator',
                ['indikator_ids' => [$indikatorSatu->id]]
            )
            ->assertNoContent();

        $mappingSatuAwal = KegiatanIndikator::query()
            ->where('kegiatan_id', $activityId)
            ->where('indikator_id', $indikatorSatu->id)
            ->firstOrFail();

        $this->actingAs($verifikator, 'web')
            ->putJson(
                '/api/rencana-kegiatan/' . $activityId . '/indikator',
                ['indikator_ids' => [$indikatorSatu->id, $indikatorDua->id]]
            )
            ->assertNoContent();

        $mappingSatuSetelahUpdate = KegiatanIndikator::query()
            ->where('kegiatan_id', $activityId)
            ->where('indikator_id', $indikatorSatu->id)
            ->firstOrFail();

        $mappingDua = KegiatanIndikator::query()
            ->where('kegiatan_id', $activityId)
            ->where('indikator_id', $indikatorDua->id)
            ->firstOrFail();

        $this->assertSame($mappingSatuAwal->id, $mappingSatuSetelahUpdate->id);
        $this->assertSame($verifikator->id, $mappingSatuSetelahUpdate->created_by);
        $this->assertSame($verifikator->id, $mappingDua->created_by);
        $this->assertDatabaseCount('kegiatan_indikator', 2);

        $this->actingAs($verifikator, 'web')
            ->putJson(
                '/api/rencana-kegiatan/' . $activityId . '/indikator',
                ['indikator_ids' => [$indikatorDua->id]]
            )
            ->assertNoContent();

        $mappingDuaSetelahUpdate = KegiatanIndikator::query()
            ->where('kegiatan_id', $activityId)
            ->where('indikator_id', $indikatorDua->id)
            ->firstOrFail();

        $this->assertSame($mappingDua->id, $mappingDuaSetelahUpdate->id);
        $this->assertDatabaseMissing('kegiatan_indikator', [
            'kegiatan_id' => $activityId,
            'indikator_id' => $indikatorSatu->id,
        ]);
        $this->assertDatabaseCount('kegiatan_indikator', 1);
    }

    public function test_verifikator_can_list_indicators_for_period_version(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $domain = DomainEPSS::create([
            'versi_instrumen_id' => $scenario['periode']->versi_instrumen_id,
            'kode' => '2',
            'nama' => 'Kualitas Data',
            'bobot' => '24.0000',
        ]);

        $aspek = AspekEPSS::create([
            'domain_id' => $domain->id,
            'kode' => '201',
            'nama' => 'Relevansi',
            'bobot' => '30.0000',
        ]);

        $indikatorPeriode = IndikatorEPSS::create([
            'aspek_id' => $aspek->id,
            'kode' => '20101',
            'nama' => 'Relevansi Data terhadap Pengguna',
            'deskripsi' => 'Mengukur relevansi data terhadap kebutuhan pengguna.',
            'bobot' => '40.0000',
        ]);

        $versiLain = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen Versi Lain',
            'versi' => 'LAIN-' . Str::uuid(),
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $domainLain = DomainEPSS::create([
            'versi_instrumen_id' => $versiLain->id,
            'kode' => '2',
            'nama' => 'Kualitas Data Versi Lain',
            'bobot' => '24.0000',
        ]);

        $aspekLain = AspekEPSS::create([
            'domain_id' => $domainLain->id,
            'kode' => '201',
            'nama' => 'Aspek Versi Lain',
            'bobot' => '30.0000',
        ]);

        IndikatorEPSS::create([
            'aspek_id' => $aspekLain->id,
            'kode' => '20101',
            'nama' => 'Indikator versi lain',
            'deskripsi' => 'Tidak termasuk versi instrumen periode.',
            'bobot' => '40.0000',
        ]);

        $this->actingAs($verifikator, 'web')
            ->getJson(
                '/api/periode-evaluasi/'
                . $scenario['periode']->id
                . '/indikator'
            )
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $indikatorPeriode->id)
            ->assertJsonPath('data.0.kode', '20101')
            ->assertJsonPath('data.0.nama', 'Relevansi Data terhadap Pengguna')
            ->assertJsonPath('data.0.aspek.nama', 'Relevansi')
            ->assertJsonPath('data.0.domain.nama', 'Kualitas Data');
    }

    public function test_operator_can_view_active_period_indicators_but_super_admin_cannot(): void
    {
        $scenario = $this->createScenario();
        $url = '/api/periode-evaluasi/'
            . $scenario['periode']->id
            . '/indikator';

        $operator = $this->createUser(UserRole::OPERATOR);

        $this->actingAs($operator, 'web')
            ->getJson($url)
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $superAdmin = $this->createUser(UserRole::SUPER_ADMIN_BIDANG);

        $this->app['auth']->forgetGuards();

        $this->actingAs($superAdmin, 'web')
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $superAdmin->id);

        $this->actingAs($superAdmin, 'web')
            ->getJson($url)
            ->assertForbidden();
    }

    public function test_activity_detail_includes_mapped_indicators(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload'])
            ->assertCreated();

        $activityId = $createResponse->json('data.id');

        $domain = DomainEPSS::create([
            'versi_instrumen_id' => $scenario['periode']->versi_instrumen_id,
            'kode' => '2',
            'nama' => 'Kualitas Data',
            'bobot' => '24.0000',
        ]);

        $aspek = AspekEPSS::create([
            'domain_id' => $domain->id,
            'kode' => '201',
            'nama' => 'Relevansi',
            'bobot' => '30.0000',
        ]);

        $indikator = IndikatorEPSS::create([
            'aspek_id' => $aspek->id,
            'kode' => '20101',
            'nama' => 'Relevansi Data terhadap Pengguna',
            'deskripsi' => 'Mengukur relevansi data terhadap kebutuhan pengguna.',
            'bobot' => '40.0000',
        ]);

        $this->actingAs($verifikator, 'web')
            ->putJson(
                '/api/rencana-kegiatan/' . $activityId . '/indikator',
                ['indikator_ids' => [$indikator->id]]
            )
            ->assertNoContent();

        $this->actingAs($verifikator, 'web')
            ->getJson('/api/rencana-kegiatan/' . $activityId)
            ->assertOk()
            ->assertJsonPath('data.indikator.0.id', $indikator->id)
            ->assertJsonPath('data.indikator.0.kode', '20101')
            ->assertJsonPath(
                'data.indikator.0.nama',
                'Relevansi Data terhadap Pengguna'
            );
    }

    public function test_verifikator_can_delete_activity(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $createResponse = $this->actingAs($verifikator, 'web')
            ->postJson('/api/rencana-kegiatan', $scenario['payload']);

        $createResponse
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

        $activityId = $createResponse->json('data.id');

        $document = (new DokumenBukti())->forceFill([
            'kegiatan_id' => $activityId,
            'uploaded_by' => $scenario['pic']->id,
            'version_number' => 1,
            'is_current' => true,
            'evidence_date' => '2026-11-06',
            'nama_file' => 'bukti-pengujian.pdf',
            'storage_key' => 'evidence/pengujian/bukti-pengujian.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 1024,
            'sha256_hash' => hash('sha256', 'isi file pengujian'),
        ]);
        $document->save();

        $this->actingAs($verifikator, 'web')
            ->deleteJson("/api/rencana-kegiatan/{$activityId}")
            ->assertNoContent();

        $this->assertSoftDeleted('rencana_kegiatan', [
            'id' => $activityId,
        ]);

        $this->assertDatabaseHas('dokumen_bukti', [
            'id' => $document->id,
            'kegiatan_id' => $activityId,
            'uploaded_by' => $scenario['pic']->id,
        ]);
    }

    public function test_operator_and_super_admin_cannot_delete_activity(): void
    {
        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web');

        $createResponse = $this->postJson(
            '/api/rencana-kegiatan',
            $scenario['payload']
        )->assertCreated();

        $activityId = $createResponse->json('data.id');

        foreach ([
            UserRole::OPERATOR,
            UserRole::SUPER_ADMIN_BIDANG,
        ] as $role) {
            // Buang guard Sanctum yang mungkin masih menyimpan user request sebelumnya.
            $this->app['auth']->forgetGuards();

            $actor = $this->createUser($role);
            $this->actingAs($actor, 'web');

            $this->deleteJson("/api/rencana-kegiatan/{$activityId}")
                ->assertForbidden();
        }

        $this->assertDatabaseHas('rencana_kegiatan', [
            'id' => $activityId,
            'deleted_at' => null,
        ]);
    }


    public function test_pic_can_upload_pdf_evidence_to_assigned_activity(): void
    {
        Storage::fake('local');

        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web');

        $createResponse = $this->postJson(
            '/api/rencana-kegiatan',
            $scenario['payload']
        )->assertCreated();

        $activityId = $createResponse->json('data.id');

        // Route memakai auth:sanctum yang membaca guard web.
        // Reset guard agar request berikutnya memakai PIC, bukan user sebelumnya.
        $this->app['auth']->forgetGuards();

        $response = $this
            ->actingAs($scenario['pic'], 'web')
            ->withHeaders(['Accept' => 'application/json'])
            ->post(
                "/api/rencana-kegiatan/{$activityId}/dokumen-bukti",
                [
                    'evidence_date' => today()->toDateString(),
                    'file' => UploadedFile::fake()->create(
                        'bukti.pdf',
                        1,
                        'application/pdf'
                    ),
                ]
            );

        $response->assertCreated()
            ->assertJsonPath('data.kegiatan_id', $activityId)
            ->assertJsonPath('data.uploaded_by', $scenario['pic']->id)
            ->assertJsonPath('data.version_number', 1)
            ->assertJsonPath('data.is_current', true);

        $document = DokumenBukti::query()
            ->where('kegiatan_id', $activityId)
            ->firstOrFail();

        $this->assertSame('bukti.pdf', $document->nama_file);
        $this->assertSame('application/pdf', $document->mime_type);
        $this->assertSame(today()->toDateString(), $document->evidence_date->toDateString());

        Storage::disk('local')->assertExists($document->storage_key);
    }

    public function test_non_pic_operator_and_verifikator_cannot_upload_evidence(): void
    {
        Storage::fake('local');

        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web');

        $createResponse = $this->postJson(
            '/api/rencana-kegiatan',
            $scenario['payload']
        )->assertCreated();

        $activityId = $createResponse->json('data.id');
        $operatorLain = $this->createUser(UserRole::OPERATOR);

        foreach ([$operatorLain, $verifikator] as $actor) {
            $this->app['auth']->forgetGuards();

            $this->actingAs($actor, 'web')
                ->withHeaders(['Accept' => 'application/json'])
                ->post(
                    "/api/rencana-kegiatan/{$activityId}/dokumen-bukti",
                    [
                        'evidence_date' => today()->toDateString(),
                        'file' => UploadedFile::fake()->create(
                            'bukti.pdf',
                            1,
                            'application/pdf'
                        ),
                    ]
                )
                ->assertForbidden();
        }

        $this->assertDatabaseCount('dokumen_bukti', 0);

        $this->assertSame(
            [],
            Storage::disk('local')->allFiles("bukti/{$activityId}")
        );
    }

    public function test_upload_rejects_unsupported_and_oversized_files(): void
    {
        Storage::fake('local');

        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web');

        $createResponse = $this->postJson(
            '/api/rencana-kegiatan',
            $scenario['payload']
        )->assertCreated();

        $activityId = $createResponse->json('data.id');

        $cases = [
            UploadedFile::fake()->create(
                'bukti.exe',
                1,
                'application/octet-stream'
            ),
            UploadedFile::fake()->create(
                'bukti-terlalu-besar.pdf',
                10241,
                'application/pdf'
            ),
        ];

        foreach ($cases as $file) {
            $this->app['auth']->forgetGuards();

            $this->actingAs($scenario['pic'], 'web')
                ->withHeaders(['Accept' => 'application/json'])
                ->post(
                    "/api/rencana-kegiatan/{$activityId}/dokumen-bukti",
                    [
                        'evidence_date' => today()->toDateString(),
                        'file' => $file,
                    ]
                )
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['file']);
        }

        $this->assertDatabaseCount('dokumen_bukti', 0);

        $this->assertSame(
            [],
            Storage::disk('local')->allFiles("bukti/{$activityId}")
        );
    }

    public function test_verifikator_can_list_evidence_documents_for_activity(): void
    {
        Storage::fake('local');

        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web');

        $createResponse = $this->postJson(
            '/api/rencana-kegiatan',
            $scenario['payload']
        )->assertCreated();

        $activityId = $createResponse->json('data.id');
        $fileContents = '%PDF-1.4 dokumen pengujian';
        $storageKey = "bukti/{$activityId}/bukti-pengujian.pdf";

        Storage::disk('local')->put($storageKey, $fileContents);

        $document = (new DokumenBukti())->forceFill([
            'kegiatan_id' => $activityId,
            'uploaded_by' => $scenario['pic']->id,
            'parent_document_id' => null,
            'version_number' => 1,
            'is_current' => true,
            'evidence_date' => today()->toDateString(),
            'nama_file' => 'bukti-pengujian.pdf',
            'storage_key' => $storageKey,
            'mime_type' => 'application/pdf',
            'size_bytes' => strlen($fileContents),
            'sha256_hash' => hash('sha256', $fileContents),
        ]);

        $document->save();

        $this->getJson(
            "/api/rencana-kegiatan/{$activityId}/dokumen-bukti"
        )
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $document->id)
            ->assertJsonPath('data.0.nama_file', 'bukti-pengujian.pdf')
            ->assertJsonMissingPath('data.0.storage_key')
            ->assertJsonMissingPath('data.0.sha256_hash');
    }

    public function test_verifikator_can_download_evidence_document_for_activity(): void
    {
        Storage::fake('local');

        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web');

        $createResponse = $this->postJson(
            '/api/rencana-kegiatan',
            $scenario['payload']
        )->assertCreated();

        $activityId = $createResponse->json('data.id');
        $fileContents = '%PDF-1.4 dokumen pengujian';
        $storageKey = "bukti/{$activityId}/bukti-pengujian.pdf";

        Storage::disk('local')->put($storageKey, $fileContents);

        $document = (new DokumenBukti())->forceFill([
            'kegiatan_id' => $activityId,
            'uploaded_by' => $scenario['pic']->id,
            'parent_document_id' => null,
            'version_number' => 1,
            'is_current' => true,
            'evidence_date' => today()->toDateString(),
            'nama_file' => 'bukti-pengujian.pdf',
            'storage_key' => $storageKey,
            'mime_type' => 'application/pdf',
            'size_bytes' => strlen($fileContents),
            'sha256_hash' => hash('sha256', $fileContents),
        ]);

        $document->save();

        $this->get(
            "/api/rencana-kegiatan/{$activityId}/dokumen-bukti/{$document->id}/download"
        )
            ->assertOk()
            ->assertDownload('bukti-pengujian.pdf');
    }

    public function test_non_pic_operator_can_download_evidence_as_reference(): void
    {
        Storage::fake('local');

        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $scenario = $this->createScenario();

        $this->actingAs($verifikator, 'web');

        $createResponse = $this->postJson(
            '/api/rencana-kegiatan',
            $scenario['payload']
        )->assertCreated();

        $activityId = $createResponse->json('data.id');
        $fileContents = '%PDF-1.4 dokumen pengujian';
        $storageKey = "bukti/{$activityId}/bukti-pengujian.pdf";

        Storage::disk('local')->put($storageKey, $fileContents);

        $document = (new DokumenBukti())->forceFill([
            'kegiatan_id' => $activityId,
            'uploaded_by' => $scenario['pic']->id,
            'parent_document_id' => null,
            'version_number' => 1,
            'is_current' => true,
            'evidence_date' => today()->toDateString(),
            'nama_file' => 'bukti-pengujian.pdf',
            'storage_key' => $storageKey,
            'mime_type' => 'application/pdf',
            'size_bytes' => strlen($fileContents),
            'sha256_hash' => hash('sha256', $fileContents),
        ]);

        $document->save();

        $operatorLain = $this->createUser(UserRole::OPERATOR);
        $this->assertNotSame($scenario['pic']->id, $operatorLain->id);

        $this->app['auth']->forgetGuards();

        $this->actingAs($operatorLain, 'web')
            ->get(
                "/api/rencana-kegiatan/{$activityId}/dokumen-bukti/{$document->id}/download"
            )
            ->assertOk()
            ->assertDownload('bukti-pengujian.pdf');
    }
}