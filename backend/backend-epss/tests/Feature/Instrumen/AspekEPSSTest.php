<?php

namespace Tests\Feature\Instrumen;

use App\Models\DomainEPSS;
use App\Enums\StatusVersiInstrumen;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Database\QueryException;
use Tests\TestCase;

class AspekEPSSTest extends TestCase
{
    use RefreshDatabase;

    private function createDomain(string $labelVersi): DomainEPSS
    {
        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen pengujian aspek',
            'versi' => $labelVersi,
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        return $versi->domains()->create([
            'kode' => '2',
            'nama' => 'Kualitas Data',
            'bobot' => '24.00',
        ]);
    }

    public function test_domain_can_have_multiple_aspects(): void
    {
        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen pengujian aspek',
            'versi' => 'UJI-ASPEK-2026',
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $domain = $versi->domains()->create([
            'kode' => '2',
            'nama' => 'Kualitas Data',
            'bobot' => '24.00',
        ]);

        $aspekPertama = $domain->aspek()->create([
            'kode' => '201',
            'nama' => 'Aspek pengujian pertama',
            'bobot' => '40.00',
        ]);

        $aspekKedua = $domain->aspek()->create([
            'kode' => '202',
            'nama' => 'Aspek pengujian kedua',
            'bobot' => '60.00',
        ]);

        $this->assertTrue(Str::isUuid($aspekPertama->id));

        $this->assertDatabaseHas('aspek_epss', [
            'id' => $aspekPertama->id,
            'domain_id' => $domain->id,
            'kode' => '201',
            'nama' => 'Aspek pengujian pertama',
            'bobot' => '40.0000',
        ]);

        $aspekTersimpan = $aspekPertama->fresh();

        $this->assertNotNull($aspekTersimpan);
        $this->assertSame('40.0000', $aspekTersimpan->bobot);
        $this->assertTrue(
            $aspekTersimpan->domain->is($domain)
        );
        $this->assertTrue(
            $aspekTersimpan->domain->versiInstrumen->is($versi)
        );

        $domainTersimpan = $domain->fresh();
        $daftarAspek = $domainTersimpan->aspek;

        $this->assertCount(2, $daftarAspek);
        $this->assertTrue($daftarAspek->contains($aspekPertama));
        $this->assertTrue($daftarAspek->contains($aspekKedua));
    }

    public function test_aspect_code_cannot_repeat_within_one_domain(): void
    {
        $domain = $this->createDomain('UJI-ASPEK-A');

        $domain->aspek()->create([
            'kode' => '201',
            'nama' => 'Aspek pertama',
            'bobot' => '40.00',
        ]);

        $this->expectException(QueryException::class);
        $this->expectExceptionMessage(
            'aspek_epss_domain_kode_unique'
        );

        $domain->aspek()->create([
            'kode' => '201',
            'nama' => 'Aspek duplikat',
            'bobot' => '60.00',
        ]);
    }

    public function test_aspect_code_can_repeat_in_different_domains(): void
    {
        $domainPertama = $this->createDomain('UJI-ASPEK-A');
        $domainKedua = $this->createDomain('UJI-ASPEK-B');

        foreach ([$domainPertama, $domainKedua] as $domain) {
            $aspek = $domain->aspek()->create([
                'kode' => '201',
                'nama' => 'Aspek pengujian',
                'bobot' => '40.00',
            ]);

            $this->assertDatabaseHas('aspek_epss', [
                'id' => $aspek->id,
                'domain_id' => $domain->id,
                'kode' => '201',
            ]);
        }
    }
}
