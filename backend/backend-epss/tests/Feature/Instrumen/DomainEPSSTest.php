<?php

namespace Tests\Feature\Instrumen;

use App\Models\DomainEPSS;
use App\Enums\StatusVersiInstrumen;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DomainEPSSTest extends TestCase
{
    use RefreshDatabase;

    private function createVersion(string $label): VersiInstrumenEPSS
    {
        return VersiInstrumenEPSS::create([
            'nama' => 'Instrumen pengujian',
            'versi' => $label,
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);
    }

    public function test_instrument_version_can_have_multiple_domains(): void
    {
        $versi = $this->createVersion('UJI-2026.1');

        $domain1 = $versi->domains()->create([
            'kode' => '1',
            'nama' => 'Domain 1',
            'bobot' => 20.00,
        ]);

        $domain2 = $versi->domains()->create([
            'kode' => '2',
            'nama' => 'Domain 2',
            'bobot' => 24.00,
        ]);

        $this->assertTrue(Str::isUuid($domain2->id));

        $this->assertDatabaseHas('domain_epss', [
            'id' => $domain2->id,
            'versi_instrumen_id' => $versi->id,
            'kode' => '2',
            'nama' => 'Domain 2',
            'bobot' => 24.00,
        ]);

        $domainTersimpan = $domain2->fresh();

        $this->assertNotNull($domainTersimpan);
        $this->assertSame('24.0000', $domainTersimpan->bobot);
        $this->assertTrue(
            $domainTersimpan->versiInstrumen->is($versi)
        );

        $versiTersimpan = $versi->fresh();
        $domains = $versiTersimpan->domains;

        $this->assertCount(2, $versi->domains);
        $this->assertTrue($domains->contains($domain1));
        $this->assertTrue($domains->contains($domain2));
    }

    public function test_domain_code_cannot_repeat_within_one_version(): void
    {
        $versi = $this->createVersion('UJI-A');

        $versi->domains()->create([
            'kode' => '1',
            'nama' => 'Domain 1',
            'bobot' => 20.00,
        ]);

        $this->expectException(QueryException::class);
        $this->expectExceptionMessage('domain_epss_versi_kode_unique');

        $versi->domains()->create([
            'kode' => '1', // Duplicate kode
            'nama' => 'Domain 1 duplikat',
            'bobot' => 24.00,
        ]);
    }

    public function test_domain_code_can_repeat_in_different_versions(): void 
    {
        $versi1 = $this->createVersion('UJI-B1');
        $versi2 = $this->createVersion('UJI-B2');

        foreach ([$versi1, $versi2] as $versi) {
            $domain = $versi->domains()->create([
                'kode' => '1',
                'nama' => 'Domain 1',
                'bobot' => 20.00,
            ]);

            $this->assertDatabaseHas('domain_epss', [
                'id' => $domain->id,
                'versi_instrumen_id' => $versi->id,
                'kode' => '1',
            ]);
        }
    }

    public function test_domain_cannot_reference_a_missing_version(): void
    {
        $this->expectException(QueryException::class);
        $this->expectExceptionMessage('SQLSTATE[23503]'); // foreign key violation

        DomainEPSS::create([
            'versi_instrumen_id' => Str::uuid(), // Non-existent versi_instrumen_id
            'kode' => '1',
            'nama' => 'Domain 1',
            'bobot' => 20.00,
        ]);
    }

    public function test_version_with_domains_cannot_be_deleted(): void
    {
        $versi = $this->createVersion('UJI-C');

        $versi->domains()->create([
            'kode' => '1',
            'nama' => 'Domain 1',
            'bobot' => 20.00,
        ]);

        $this->expectException(QueryException::class);
        $this->expectExceptionMessage('SQLSTATE[23503]'); // foreign key violation

        $versi->delete();
    }

    public function test_domain_weight_cannot_be_negative(): void
    {
        $versi = $this->createVersion('UJI-BOBOT-NEGATIF');

        $this->expectException(QueryException::class);
        $this->expectExceptionMessage('domain_epss_bobot_check');

        $versi->domains()->create([
            'kode' => '1',
            'nama' => 'Domain pengujian',
            'bobot' => '-0.0001',
        ]);
    }

public function test_domain_weight_cannot_exceed_one_hundred(): void
    {
        $versi = $this->createVersion('UJI-BOBOT-LEBIH');

        $this->expectException(QueryException::class);
        $this->expectExceptionMessage('domain_epss_bobot_check');

        $versi->domains()->create([
            'kode' => '1',
            'nama' => 'Domain pengujian',
            'bobot' => '100.0001',
        ]);
    }

public function test_domain_weight_accepts_zero_and_one_hundred(): void
    {
        $bobotValid = [
            'UJI-BOBOT-NOL' => '0.0000',
            'UJI-BOBOT-SERATUS' => '100.0000',
        ];

        foreach ($bobotValid as $labelVersi => $bobot) {
            $versi = $this->createVersion($labelVersi);

            $domain = $versi->domains()->create([
                'kode' => '1',
                'nama' => 'Domain pengujian',
                'bobot' => $bobot,
            ]);

            $this->assertDatabaseHas('domain_epss', [
                'id' => $domain->id,
                'bobot' => $bobot,
            ]);

            $this->assertSame($bobot, $domain->fresh()->bobot);
        }
    }
    
}
