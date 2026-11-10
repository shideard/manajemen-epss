<?php

namespace Tests\Feature\Planning;

use App\Enums\StatusPeriode;
use App\Enums\StatusVersiInstrumen;
use App\Enums\UserRole;
use App\Models\OutputBukti;
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

class OutputBuktiTest extends TestCase
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

    private function sebagai(User $user): static
    {
        $this->app['auth']->forgetGuards();

        return $this->actingAs($user, 'web');
    }

    private function createScenario(): array
    {
        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen Pengujian',
            'versi' => 'UJI-' . Str::uuid(),
            'berlaku_mulai' => '2026-01-01',
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);
        $periode = new PeriodeEvaluasi([
            'versi_instrumen_id' => $versi->id,
            'nama_periode' => 'Periode Pengujian',
            'tahun_mulai' => today()->year,
            'tahun_selesai' => today()->year + 1,
        ]);
        $periode->status = StatusPeriode::AKTIF;
        $periode->save();

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
            'nama_kegiatan' => 'Forum Satu Data',
            'tahun_kegiatan' => today()->year,
            'tanggal_mulai_rencana' => today()->toDateString(),
            'tanggal_selesai_rencana' => today()->addDays(10)->toDateString(),
        ]);

        return compact('verifikator', 'pic', 'kegiatan');
    }

    public function test_verifikator_adds_target_outputs_and_pic_downloads_the_example(): void
    {
        Storage::fake();
        $s = $this->createScenario();
        $base = '/api/rencana-kegiatan/' . $s['kegiatan']->id . '/output-bukti';

        $this->sebagai($s['verifikator'])
            ->postJson($base, ['judul' => 'Notulen rapat forum', 'jenis' => 'PDF'])
            ->assertCreated()
            ->assertJsonPath('data.contoh', null);

        $id = $this->sebagai($s['verifikator'])
            ->post($base, [
                'judul' => '',
                'jenis' => 'Word',
                'contoh' => UploadedFile::fake()->create('Contoh SK Tim.docx', 20, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.judul', 'Contoh SK Tim.docx')
            ->assertJsonPath('data.contoh.nama', 'Contoh SK Tim.docx')
            ->json('data.id');

        $this->sebagai($s['pic'])
            ->getJson('/api/rencana-kegiatan/' . $s['kegiatan']->id)
            ->assertJsonCount(2, 'data.output')
            ->assertJsonPath('data.output.0.judul', 'Notulen rapat forum');

        $this->sebagai($s['pic'])
            ->get($base . '/' . $id . '/contoh')
            ->assertOk()
            ->assertDownload('Contoh SK Tim.docx');
    }

    public function test_only_verifikator_manages_outputs_and_delete_removes_the_file(): void
    {
        Storage::fake();
        $s = $this->createScenario();
        $base = '/api/rencana-kegiatan/' . $s['kegiatan']->id . '/output-bukti';

        $this->sebagai($s['pic'])
            ->postJson($base, ['judul' => 'Laporan'])
            ->assertForbidden();

        $this->sebagai($s['verifikator'])
            ->postJson($base, ['judul' => '', 'jenis' => 'Video'])
            ->assertJsonValidationErrors(['judul', 'jenis']);

        $id = $this->sebagai($s['verifikator'])
            ->post($base, ['contoh' => UploadedFile::fake()->create('contoh.pdf', 5, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertCreated()
            ->json('data.id');
        $key = OutputBukti::findOrFail($id)->contoh_storage_key;
        Storage::assertExists($key);

        $this->sebagai($s['pic'])->deleteJson($base . '/' . $id)->assertForbidden();
        $this->sebagai($s['verifikator'])->deleteJson($base . '/' . $id)->assertNoContent();

        $this->assertDatabaseMissing('output_bukti', ['id' => $id]);
        Storage::assertMissing($key);
    }
}
