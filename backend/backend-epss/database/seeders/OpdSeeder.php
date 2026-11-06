<?php

namespace Database\Seeders;

use App\Models\Opd;
use Illuminate\Database\Seeder;

class OpdSeeder extends Seeder
{
    public function run(): void
    {
        $opds = [
            ['SETDA', 'Sekretariat Daerah Kota Bogor'],
            ['SETWAN', 'Sekretariat DPRD Kota Bogor'],
            ['INSPEKTORAT', 'Inspektorat Daerah Kota Bogor'],
            ['DISDIK', 'Dinas Pendidikan Kota Bogor'],
            ['DINKES', 'Dinas Kesehatan Kota Bogor'],
            ['DINSOS', 'Dinas Sosial Kota Bogor'],
            ['DPPPA', 'Dinas Pemberdayaan Perempuan dan Perlindungan Anak Kota Bogor'],
            ['DKPP', 'Dinas Ketahanan Pangan dan Pertanian Kota Bogor'],
            ['DLH', 'Dinas Lingkungan Hidup Kota Bogor'],
            ['DISKOMINFO', 'Dinas Komunikasi dan Informatika Kota Bogor'],
            ['DPMPTSP', 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kota Bogor'],
            ['DISPORA', 'Dinas Pemuda dan Olahraga Kota Bogor'],
            ['DISPARBUD', 'Dinas Pariwisata dan Kebudayaan Kota Bogor'],
            ['DAMKAR', 'Dinas Pemadam Kebakaran dan Penyelamatan Kota Bogor'],
            ['SATPOLPP', 'Satuan Polisi Pamong Praja Kota Bogor'],
            ['DPUPR', 'Dinas Pekerjaan Umum dan Penataan Ruang Kota Bogor'],
            ['DIARPUS', 'Dinas Arsip dan Perpustakaan Kota Bogor'],
            ['DISNAKER', 'Dinas Tenaga Kerja Kota Bogor'],
            ['DISDUKCAPIL', 'Dinas Kependudukan dan Pencatatan Sipil Kota Bogor'],
            ['DPPKB', 'Dinas Pengendalian Penduduk dan Keluarga Berencana Kota Bogor'],
            ['DISHUB', 'Dinas Perhubungan Kota Bogor'],
            ['DISKUKMDAGIN', 'Dinas Koperasi, Usaha Kecil dan Menengah, Perdagangan dan Perindustrian Kota Bogor'],
            ['DISPERUMKIM', 'Dinas Perumahan dan Permukiman Kota Bogor'],
            ['BAPPERIDA', 'Badan Perencanaan Pembangunan Daerah Kota Bogor'],
            ['BKPSDM', 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kota Bogor'],
            ['BKAD', 'Badan Keuangan dan Aset Daerah Kota Bogor'],
            ['BAPENDA', 'Badan Pendapatan Daerah Kota Bogor'],
            ['KESBANGPOL', 'Badan Kesatuan Bangsa dan Politik Kota Bogor'],
            ['BPBD', 'Badan Penanggulangan Bencana Daerah Kota Bogor'],
            ['RSUD', 'RSUD Kota Bogor'],
            ['KEC_BOGOR_UTARA', 'Kecamatan Bogor Utara Kota Bogor'],
            ['KEC_BOGOR_SELATAN', 'Kecamatan Bogor Selatan Kota Bogor'],
            ['KEC_BOGOR_TIMUR', 'Kecamatan Bogor Timur Kota Bogor'],
            ['KEC_BOGOR_BARAT', 'Kecamatan Bogor Barat Kota Bogor'],
            ['KEC_BOGOR_TENGAH', 'Kecamatan Bogor Tengah Kota Bogor'],
            ['KEC_TANAH_SAREAL', 'Kecamatan Tanah Sareal Kota Bogor'],
            ['BAG_ADBANG', 'Bagian Administrasi Pembangunan'],
            ['BAG_KESRA', 'Bagian Kesejahteraan Masyarakat'],
            ['BAG_EKONOMI', 'Bagian Perekonomian'],
            ['BAG_HUKUM', 'Bagian Hukum dan HAM'],
            ['BAG_PROKOPIM', 'Bagian Protokol dan Komunikasi Pimpinan'],
            ['BAG_ORGANISASI', 'Bagian Organisasi'],
            ['BAG_PEMERINTAHAN', 'Bagian Pemerintahan'],
            ['BAG_UMUM', 'Bagian Umum'],
            ['BAG_PBJ', 'Bagian Pengadaan Barang'],
        ];

        foreach ($opds as [$kode, $nama]) {
            Opd::firstOrCreate(
                ['kode' => $kode],
                ['nama' => $nama, 'status_aktif' => true],
            );
        }

        $this->command?->info(count($opds) . ' OPD Kota Bogor tersedia.');
    }
}
