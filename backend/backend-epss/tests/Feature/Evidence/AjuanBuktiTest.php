<?php

namespace Tests\Feature\Evidence;

use App\Enums\StatusAjuanBukti;
use App\Enums\StatusPeriode;
use App\Enums\StatusVersiInstrumen;
use App\Enums\UserRole;
use App\Models\AjuanBukti;
use App\Models\AspekEPSS;
use App\Models\DokumenBukti;
use App\Models\DomainEPSS;
use App\Models\IndikatorEPSS;
use App\Models\KegiatanIndikator;
use App\Models\Opd;
use App\Models\PeriodeEvaluasi;
use App\Models\RencanaKegiatan;
use App\Models\User;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class AjuanBuktiTest extends TestCase
{
    use RefreshDatabase;

    private const CHECKLIST = ['1' => [true, true], '2' => [true, false]];

    private function createUser(UserRole $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'status_aktif' => true,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);
    }

    // Guard sanctum menyimpan user dari request sebelumnya; reset supaya ganti aktor dalam satu test berlaku
    private function sebagai(User $user, string $guard = 'web'): static
    {
        $this->app['auth']->forgetGuards();

        return $this->actingAs($user, $guard);
    }

    private function createScenario(
        StatusPeriode $status = StatusPeriode::AKTIF,
        bool $denganDokumen = true
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
        ]);
        $periode->status = $status;
        $periode->save();

        $domain = DomainEPSS::create([
            'versi_instrumen_id' => $versi->id,
            'kode' => '1',
            'nama' => 'Domain Pengujian',
            'bobot' => '20.0000',
        ]);
        $aspek = AspekEPSS::create([
            'domain_id' => $domain->id,
            'kode' => '101',
            'nama' => 'Aspek Pengujian',
            'bobot' => '50.0000',
        ]);
        $indikator = IndikatorEPSS::create([
            'aspek_id' => $aspek->id,
            'kode' => '1',
            'nama' => 'Indikator Pengujian',
            'deskripsi' => 'Indikator untuk pengujian ajuan bukti.',
            'bobot' => '50.0000',
        ]);

        $verifikator = $this->createUser(UserRole::VERIFIKATOR);
        $pic = $this->createUser(UserRole::OPERATOR);

        $opd = new Opd(['kode' => 'UJI-' . Str::uuid(), 'nama' => 'OPD Pengujian']);
        $opd->status_aktif = true;
        $opd->save();

        $kegiatan = RencanaKegiatan::forceCreate([
            'periode_id' => $periode->id,
            'created_by' => $verifikator->id,
            'pic_user_id' => $pic->id,
            'opd_id' => $opd->id,
            'nama_kegiatan' => 'Kegiatan Pengujian',
            'tahun_kegiatan' => today()->year,
            'tanggal_mulai_rencana' => today()->toDateString(),
            'tanggal_selesai_rencana' => today()->addDays(10)->toDateString(),
        ]);

        KegiatanIndikator::create([
            'kegiatan_id' => $kegiatan->id,
            'indikator_id' => $indikator->id,
            'created_by' => $verifikator->id,
        ]);

        if ($denganDokumen) {
            DokumenBukti::forceCreate([
                'kegiatan_id' => $kegiatan->id,
                'uploaded_by' => $pic->id,
                'version_number' => 1,
                'is_current' => true,
                'evidence_date' => today()->toDateString(),
                'nama_file' => 'bukti.pdf',
                'storage_key' => 'bukti/' . $kegiatan->id . '/bukti.pdf',
                'mime_type' => 'application/pdf',
                'size_bytes' => 1024,
                'sha256_hash' => str_repeat('a', 64),
            ]);
        }

        return compact('periode', 'indikator', 'verifikator', 'pic', 'kegiatan');
    }

    private function updateUrl(array $s): string
    {
        return '/api/rencana-kegiatan/' . $s['kegiatan']->id . '/ajuan-bukti/' . $s['indikator']->id;
    }

    private function ajuanMenunggu(array $s): AjuanBukti
    {
        $this->sebagai($s['pic'], 'web')
            ->putJson($this->updateUrl($s), ['checklist' => self::CHECKLIST, 'ajukan' => true])
            ->assertSuccessful();

        return AjuanBukti::firstOrFail();
    }

    public function test_pic_can_save_draft_checklist_then_submit(): void
    {
        $s = $this->createScenario();

        $this->sebagai($s['pic'], 'web')
            ->putJson($this->updateUrl($s), ['checklist' => self::CHECKLIST, 'ajukan' => false])
            ->assertCreated()
            ->assertJsonPath('data.status', 'DRAFT')
            ->assertJsonPath('data.checklist.1', [true, true])
            ->assertJsonPath('data.pengaju', null);

        $this->sebagai($s['pic'], 'web')
            ->putJson($this->updateUrl($s), ['checklist' => self::CHECKLIST, 'ajukan' => true])
            ->assertSuccessful()
            ->assertJsonPath('data.status', 'MENUNGGU')
            ->assertJsonPath('data.pengaju', $s['pic']->name)
            ->assertJsonPath('data.indikator.kode', '1');

        $this->assertDatabaseCount('ajuan_bukti', 1);
    }

    public function test_submit_requires_an_uploaded_document(): void
    {
        $s = $this->createScenario(denganDokumen: false);

        $this->sebagai($s['pic'], 'web')
            ->putJson($this->updateUrl($s), ['checklist' => self::CHECKLIST, 'ajukan' => true])
            ->assertStatus(422);
    }

    public function test_only_the_pic_operator_can_save_checklist(): void
    {
        $s = $this->createScenario();

        foreach ([$this->createUser(UserRole::OPERATOR), $s['verifikator']] as $actor) {
            $this->sebagai($actor, 'web')
                ->putJson($this->updateUrl($s), ['checklist' => self::CHECKLIST, 'ajukan' => false])
                ->assertForbidden();
        }
    }

    public function test_unmapped_indicator_is_rejected(): void
    {
        $s = $this->createScenario();
        $lain = IndikatorEPSS::create([
            'aspek_id' => $s['indikator']->aspek_id,
            'kode' => '2',
            'nama' => 'Indikator Lain',
            'deskripsi' => 'Tidak dipetakan.',
            'bobot' => '50.0000',
        ]);

        $this->sebagai($s['pic'], 'web')
            ->putJson('/api/rencana-kegiatan/' . $s['kegiatan']->id . '/ajuan-bukti/' . $lain->id, [
                'checklist' => self::CHECKLIST,
                'ajukan' => false,
            ])
            ->assertNotFound();
    }

    public function test_waiting_submission_cannot_be_changed_by_operator(): void
    {
        $s = $this->createScenario();
        $this->ajuanMenunggu($s);

        $this->sebagai($s['pic'], 'web')
            ->putJson($this->updateUrl($s), ['checklist' => [], 'ajukan' => false])
            ->assertStatus(409);
    }

    public function test_verifikator_approves_with_level(): void
    {
        $s = $this->createScenario();
        $ajuan = $this->ajuanMenunggu($s);

        $this->sebagai($s['verifikator'], 'web')
            ->patchJson('/api/ajuan-bukti/' . $ajuan->id . '/verifikasi', [
                'keputusan' => 'TERVERIFIKASI',
                'checklist' => self::CHECKLIST,
                'level' => 1,
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'TERVERIFIKASI')
            ->assertJsonPath('data.level', 1)
            ->assertJsonPath('data.catatan', null)
            ->assertJsonPath('data.verifikator', $s['verifikator']->name);
    }

    public function test_verifikator_requests_revision_with_note_and_operator_can_resubmit(): void
    {
        $s = $this->createScenario();
        $ajuan = $this->ajuanMenunggu($s);

        $this->sebagai($s['verifikator'], 'web')
            ->patchJson('/api/ajuan-bukti/' . $ajuan->id . '/verifikasi', [
                'keputusan' => 'PERBAIKAN',
                'checklist' => self::CHECKLIST,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('catatan');

        $this->sebagai($s['verifikator'], 'web')
            ->patchJson('/api/ajuan-bukti/' . $ajuan->id . '/verifikasi', [
                'keputusan' => 'PERBAIKAN',
                'checklist' => self::CHECKLIST,
                'catatan' => '  Lengkapi SK.  ',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'PERBAIKAN')
            ->assertJsonPath('data.level', null)
            ->assertJsonPath('data.catatan', 'Lengkapi SK.');

        $this->sebagai($s['pic'], 'web')
            ->putJson($this->updateUrl($s), ['checklist' => self::CHECKLIST, 'ajukan' => true])
            ->assertSuccessful()
            ->assertJsonPath('data.status', 'MENUNGGU');
    }

    public function test_only_waiting_submission_can_be_decided(): void
    {
        $s = $this->createScenario();

        $this->sebagai($s['pic'], 'web')
            ->putJson($this->updateUrl($s), ['checklist' => self::CHECKLIST, 'ajukan' => false])
            ->assertSuccessful();

        $this->sebagai($s['verifikator'], 'web')
            ->patchJson('/api/ajuan-bukti/' . AjuanBukti::firstOrFail()->id . '/verifikasi', [
                'keputusan' => 'TERVERIFIKASI',
                'checklist' => self::CHECKLIST,
                'level' => 1,
            ])
            ->assertStatus(409);
    }

    public function test_operator_cannot_verify_and_locked_period_cannot_be_verified(): void
    {
        $s = $this->createScenario();
        $ajuan = $this->ajuanMenunggu($s);
        $payload = ['keputusan' => 'TERVERIFIKASI', 'checklist' => self::CHECKLIST, 'level' => 1];

        $this->sebagai($s['pic'], 'web')
            ->patchJson('/api/ajuan-bukti/' . $ajuan->id . '/verifikasi', $payload)
            ->assertForbidden();

        $s['periode']->status = StatusPeriode::TERKUNCI;
        $s['periode']->save();

        $this->sebagai($s['verifikator'], 'web')
            ->patchJson('/api/ajuan-bukti/' . $ajuan->id . '/verifikasi', $payload)
            ->assertForbidden();

        $this->assertSame(StatusAjuanBukti::MENUNGGU, $ajuan->refresh()->status);
    }

    public function test_uploaded_file_can_be_downloaded_submitted_and_verified(): void
    {
        Storage::fake();
        $s = $this->createScenario(denganDokumen: false);
        $base = '/api/rencana-kegiatan/' . $s['kegiatan']->id . '/dokumen-bukti';

        $dokumenId = $this->sebagai($s['pic'], 'web')
            ->post($base, [
                'file' => UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf'),
                'evidence_date' => today()->toDateString(),
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->json('data.id');

        Storage::assertExists(DokumenBukti::findOrFail($dokumenId)->storage_key);

        $this->sebagai($s['verifikator'], 'web')
            ->get($base . '/' . $dokumenId . '/download')
            ->assertOk()
            ->assertDownload('bukti.pdf');

        $this->sebagai($s['pic'], 'web')
            ->putJson($this->updateUrl($s), ['checklist' => self::CHECKLIST, 'ajukan' => true])
            ->assertCreated();

        $this->sebagai($s['verifikator'], 'web')
            ->patchJson('/api/ajuan-bukti/' . AjuanBukti::firstOrFail()->id . '/verifikasi', [
                'keputusan' => 'TERVERIFIKASI',
                'checklist' => self::CHECKLIST,
                'level' => 1,
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'TERVERIFIKASI')
            ->assertJsonPath('data.level', 1);
    }

    public function test_period_listing_returns_its_submissions(): void
    {
        $s = $this->createScenario();
        $this->ajuanMenunggu($s);

        $this->sebagai($s['verifikator'], 'web')
            ->getJson('/api/periode-evaluasi/' . $s['periode']->id . '/ajuan-bukti')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.kegiatan_id', $s['kegiatan']->id)
            ->assertJsonPath('data.0.status', 'MENUNGGU');

        $this->sebagai($this->createUser(UserRole::SUPER_ADMIN_BIDANG), 'web')
            ->getJson('/api/periode-evaluasi/' . $s['periode']->id . '/ajuan-bukti')
            ->assertForbidden();
    }

    public function test_operator_cannot_list_submissions_for_draft_period(): void
    {
        $scenario = $this->createScenario(StatusPeriode::DRAFT);

        AjuanBukti::forceCreate([
            'kegiatan_id' => $scenario['kegiatan']->id,
            'indikator_id' => $scenario['indikator']->id,
            'status' => StatusAjuanBukti::DRAFT->value,
            'checklist' => [],
        ]);

        $this->sebagai($scenario['pic'], 'web')
            ->getJson(
                '/api/periode-evaluasi/' . $scenario['periode']->id . '/ajuan-bukti'
            )
            ->assertForbidden();
    }
}
