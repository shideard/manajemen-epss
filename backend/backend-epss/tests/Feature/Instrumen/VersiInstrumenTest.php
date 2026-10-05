<?php

namespace Tests\Feature\Instrumen;

use App\Enums\StatusVersiInstrumen;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Foundation\Testing\RefreshDatabase;
USE Illuminate\Support\Str;
use Tests\TestCase;
use Illuminate\Database\QueryException;

class VersiInstrumenTest extends TestCase
{
    use RefreshDatabase;

    public function test_instrument_version_can_be_saved_and_read(): void
    {
        $versi = VersiInstrumenEPSS::create([
            'nama' => 'Instrumen EPSS untuk pengujian',
            'versi' => 'UJI-2026.1',
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $this->assertTrue(Str::isUuid($versi->id));

        $this->assertDatabaseHas('versi_instrumen_epss', [
            'id' => $versi->id,
            'nama' => 'Instrumen EPSS untuk pengujian',
            'versi' => 'UJI-2026.1',
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => 'ACTIVE',
        ]);

        $tersimpan = $versi->fresh();

        $this->assertNotNull($tersimpan);
        $this->assertSame($versi->id, $tersimpan->id);
        $this->assertSame(StatusVersiInstrumen::ACTIVE, $tersimpan->status);
        $this->assertSame('2026-01-01', $tersimpan->berlaku_mulai->toDateString());
        $this->assertNull($tersimpan->berlaku_sampai);
    }

    public function test_instrument_version_label_must_be_unique(): void
    {
        VersiInstrumenEPSS::create([
            'nama' => 'Instrumen EPSS untuk pengujian',
            'versi' => 'UJI-2026.1',
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);

        $this->expectException(QueryException::class);
        $this->expectExceptionMessage('SQLSTATE[23505]'); // unique violation

        VersiInstrumenEPSS::create([
            'nama' => 'Instrumen EPSS untuk pengujian duplikat',
            'versi' => 'UJI-2026.1', // Duplicate versi
            'berlaku_mulai' => '2026-02-01',
            'berlaku_sampai' => null,
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);
    }

    public function test_instrument_end_date_cannot_precede_start_date(): void
    {
        $this->expectException(QueryException::class);
        $this->expectExceptionMessage('versi_instrumen_epss_tanggal_check');

        VersiInstrumenEPSS::create([
            'nama' => 'Instrumen dengan tanggal tidak valid',
            'versi' => 'UJI-2026.2',
            'berlaku_mulai' => '2026-01-01',
            'berlaku_sampai' => '2025-12-31', // Invalid: end date before start date
            'status' => StatusVersiInstrumen::ACTIVE,
        ]);
    }

    public function test_instrument_end_date_can_equal_or_follow_start_date(): void
    {
        $tanggalAkhirValid = [
            'UJI-TANGGAL-1' => '2026-01-01', // Equal to start date
            'UJI-TANGGAL-2' => '2026-12-31', // Follows start date
        ];

        foreach ($tanggalAkhirValid as $labelVersi => $tanggalAkhir) {
            $versi = VersiInstrumenEPSS::create([
                'nama' => "Instrumen dengan tanggal valid",
                'versi' => $labelVersi,
                'berlaku_mulai' => '2026-01-01',
                'berlaku_sampai' => $tanggalAkhir,
                'status' => StatusVersiInstrumen::ACTIVE,
            ]);

            $this->assertDatabaseHas('versi_instrumen_epss', [
                'id' => $versi->id,
                'berlaku_mulai' => '2026-01-01',
                'berlaku_sampai' => $tanggalAkhir,
            ]);
        }
    }
}
