/**
 * Kontak instansi untuk mengisi otomatis Blok I (Penyelenggara).
 *
 * Sumber: halaman resmi "Perangkat Daerah" Pemerintah Kota Bogor
 *   https://kotabogor.go.id/detail/perangkat-daerah
 * Diakses: 23 November 2026.
 *
 * Catatan isi:
 * - Dikunci dengan `kode` OPD (sama dengan `OpdSeeder` di backend) agar tidak
 *   rapuh terhadap perbedaan ejaan nama. `nama` disertakan supaya berkas ini
 *   bisa mencocokkan sendiri walau daftar OPD dari API tidak tersedia (mis.
 *   peran pengguna tidak punya akses `/api/pilihan/opd`).
 * - Ejaan nama OPD dan alamat mengikuti bentuk baku, bukan apa adanya di situs
 *   (mis. "Pemukiman" -> "Permukiman", "Pembagunan" -> "Pembangunan",
 *   "Pemuda Dan" -> "Pemuda dan", "Tanah Sereal" -> "Tanah Sareal").
 * - Halaman sumber tidak memuat nomor telepon/faksimile, jadi kedua isian itu
 *   tetap diisi manual.
 * - Alamat di bawah belum memuat kota/provinsi; akhiran itu ditambahkan
 *   terpusat oleh AKHIRAN_ALAMAT saat dipakai.
 */

export const AKHIRAN_ALAMAT = 'Kota Bogor, Jawa Barat'

export const ALAMAT_OPD = {
  SETDA: {
    nama: 'Sekretariat Daerah Kota Bogor',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'setda@kotabogor.go.id',
  },
  SETWAN: {
    nama: 'Sekretariat DPRD Kota Bogor',
    alamat: 'Jl. Pemuda No. 25, RT.01/RW.06, Tanah Sareal',
    email: 'setwan@kotabogor.go.id',
  },
  INSPEKTORAT: {
    nama: 'Inspektorat Daerah Kota Bogor',
    alamat: 'Jl. Raya Pajajaran No. 5, RT.02/RW.04, Baranangsiang',
    email: 'inspektorat@kotabogor.go.id',
  },
  DISDIK: {
    nama: 'Dinas Pendidikan Kota Bogor',
    alamat: 'Jl. Raya Pajajaran No. 125, Bantarjati',
    email: 'disdik@kotabogor.go.id',
  },
  DINKES: {
    nama: 'Dinas Kesehatan Kota Bogor',
    alamat: 'Jl. R.M. Tirto Adhi Soerjo, RT.02/RW.02, Tanah Sareal',
    email: 'dinkes@kotabogor.go.id',
  },
  DINSOS: {
    nama: 'Dinas Sosial Kota Bogor',
    alamat: 'Jl. Merdeka No. 142, RT.03/RW.05, Ciwaringin',
    email: 'dinsos@kotabogor.go.id',
  },
  DPPPA: {
    nama: 'Dinas Pemberdayaan Perempuan dan Perlindungan Anak Kota Bogor',
    alamat: 'Jl. Ciwaringin No. 99, RT.01/RW.09, Ciwaringin',
    email: 'dpppa@kotabogor.go.id',
  },
  DKPP: {
    nama: 'Dinas Ketahanan Pangan dan Pertanian Kota Bogor',
    alamat: 'Jl. Raya Cipaku Blok Mekar No. 5, RT.01/RW.03, Cipaku',
    email: 'dkpp@kotabogor.go.id',
  },
  DLH: {
    nama: 'Dinas Lingkungan Hidup Kota Bogor',
    alamat: 'Jl. Paledang No. 43, RT.01/RW.02, Paledang',
    email: 'dlh@kotabogor.go.id',
  },
  DISKOMINFO: {
    nama: 'Dinas Komunikasi dan Informatika Kota Bogor',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'kominfo@kotabogor.go.id',
  },
  DPMPTSP: {
    nama: 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kota Bogor',
    alamat: 'Jl. Kapten Muslihat No. 21, RT.01/RW.01, Pabaton',
    email: 'dpmptsp@kotabogor.go.id',
  },
  DISPORA: {
    nama: 'Dinas Pemuda dan Olahraga Kota Bogor',
    alamat: 'Jl. Pemuda No. 4, RT.04/RW.01, Tanah Sareal',
    email: 'dispora@kotabogor.go.id',
  },
  DISPARBUD: {
    nama: 'Dinas Pariwisata dan Kebudayaan Kota Bogor',
    alamat: 'Jl. Pandu Raya No. 45, Tegal Gundil',
    email: 'disbudpar@kotabogor.go.id',
  },
  DAMKAR: {
    nama: 'Dinas Pemadam Kebakaran dan Penyelamatan Kota Bogor',
    alamat: 'Jl. Raya Pajajaran No. 1, RT.07/RW.02, Sukasari',
    email: 'dpkp@kotabogor.go.id',
  },
  SATPOLPP: {
    nama: 'Satuan Polisi Pamong Praja Kota Bogor',
    alamat: 'Jl. Raya Pajajaran No. 121, RT.04/RW.03, Bantarjati',
    email: 'satpolpp@kotabogor.go.id',
  },
  DPUPR: {
    nama: 'Dinas Pekerjaan Umum dan Penataan Ruang Kota Bogor',
    alamat: 'Jl. Pool Bina Marga No. 2, RT.02/RW.01, Tanah Sareal',
    email: 'dpupr@kotabogor.go.id',
  },
  DIARPUS: {
    nama: 'Dinas Arsip dan Perpustakaan Kota Bogor',
    alamat: 'Jl. Medika 1A No. 2, Perum Menteng Asri, RT.02/RW.20',
    email: 'diskarpus@kotabogor.go.id',
  },
  DISNAKER: {
    nama: 'Dinas Tenaga Kerja Kota Bogor',
    alamat: 'Jl. Dr. Sumeru No. 33, RT.01/RW.02, Menteng',
    email: 'disnakertrans@kotabogor.go.id',
  },
  DISDUKCAPIL: {
    nama: 'Dinas Kependudukan dan Pencatatan Sipil Kota Bogor',
    alamat: 'Jl. Achmad Adnawijaya No. 45A, RT.01/RW.16, Tegal Gundil',
    email: 'disdukcapil@kotabogor.go.id',
  },
  DPPKB: {
    nama: 'Dinas Pengendalian Penduduk dan Keluarga Berencana Kota Bogor',
    alamat: 'Jl. Senam No. 1, RT.04/RW.02, Tanah Sareal',
    email: 'dppkb@kotabogor.go.id',
  },
  DISHUB: {
    nama: 'Dinas Perhubungan Kota Bogor',
    alamat: 'Jl. Raya Tajur No. 54, RT.01/RW.04, Pakuan',
    email: 'dishub@kotabogor.go.id',
  },
  DISKUKMDAGIN: {
    nama: 'Dinas Koperasi, Usaha Kecil dan Menengah, Perdagangan dan Perindustrian Kota Bogor',
    alamat: 'Jl. Dadali No. 4, RT.03/RW.06, Tanah Sareal',
    email: 'dinkumkmdagin@kotabogor.go.id',
  },
  DISPERUMKIM: {
    nama: 'Dinas Perumahan dan Permukiman Kota Bogor',
    alamat: 'Jl. Pengadilan No. 8A, RT.03/RW.01, Pabaton',
    email: 'disperumkim@kotabogor.go.id',
  },
  BAPPERIDA: {
    nama: 'Badan Perencanaan Pembangunan Daerah Kota Bogor',
    alamat: 'Jl. Kapten Muslihat No. 21, RT.01/RW.01, Pabaton',
    email: 'bapperida@kotabogor.go.id',
  },
  BKPSDM: {
    nama: 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kota Bogor',
    alamat: 'Jl. Julang I No. 7A, RT.02/RW.04, Tanah Sareal',
    email: 'bkpsdm@kotabogor.go.id',
  },
  BKAD: {
    nama: 'Badan Keuangan dan Aset Daerah Kota Bogor',
    alamat: 'Jl. Pemuda No. 31, RT.01/RW.06, Tanah Sareal',
    email: 'bkad@kotabogor.go.id',
  },
  BAPENDA: {
    nama: 'Badan Pendapatan Daerah Kota Bogor',
    alamat: 'Jl. Pemuda No. 31, RT.01/RW.06, Tanah Sareal',
    email: 'bapenda@kotabogor.go.id',
  },
  KESBANGPOL: {
    nama: 'Badan Kesatuan Bangsa dan Politik Kota Bogor',
    alamat: 'Jl. Kesehatan No. 2, RT.02/RW.02, Tanah Sareal',
    email: 'kesbangpol@kotabogor.go.id',
  },
  BPBD: {
    nama: 'Badan Penanggulangan Bencana Daerah Kota Bogor',
    alamat: 'Jl. Pool Bina Marga No. 2, RT.02/RW.01, Kayu Manis',
    email: 'bpbd@kotabogor.go.id',
  },
  RSUD: {
    nama: 'RSUD Kota Bogor',
    alamat: 'Jl. Dr. Sumeru No. 120, RT.03/RW.20, Menteng',
    email: 'rsud@kotabogor.go.id',
  },
  KEC_BOGOR_UTARA: {
    nama: 'Kecamatan Bogor Utara Kota Bogor',
    alamat: 'Jl. Gagalur II No. 2',
    email: 'kec.bout@kotabogor.go.id',
  },
  KEC_BOGOR_SELATAN: {
    nama: 'Kecamatan Bogor Selatan Kota Bogor',
    alamat: 'Jl. Layungsari III No. 41',
    email: 'kec.bosel@kotabogor.go.id',
  },
  KEC_BOGOR_TIMUR: {
    nama: 'Kecamatan Bogor Timur Kota Bogor',
    alamat: 'Jl. Raya Pajajaran No. 16, Baranangsiang',
    email: 'kec.botim@kotabogor.go.id',
  },
  KEC_BOGOR_BARAT: {
    nama: 'Kecamatan Bogor Barat Kota Bogor',
    alamat: 'Jl. KH. T.B. M. Falak No. 319, Loji',
    email: 'kec.bobar@kotabogor.go.id',
  },
  KEC_BOGOR_TENGAH: {
    nama: 'Kecamatan Bogor Tengah Kota Bogor',
    alamat: 'Jl. Kantin No. 2',
    email: 'kec.boteng@kotabogor.go.id',
  },
  KEC_TANAH_SAREAL: {
    nama: 'Kecamatan Tanah Sareal Kota Bogor',
    alamat: 'Jl. Kebon Pedes No. 20',
    email: 'kec.tansar@kotabogor.go.id',
  },
  BAG_ADBANG: {
    nama: 'Bagian Administrasi Pembangunan',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'bag.adbang@kotabogor.go.id',
  },
  BAG_KESRA: {
    nama: 'Bagian Kesejahteraan Masyarakat',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'bag.kesra@kotabogor.go.id',
  },
  BAG_EKONOMI: {
    nama: 'Bagian Perekonomian',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'bag.ekon@kotabogor.go.id',
  },
  BAG_HUKUM: {
    nama: 'Bagian Hukum dan HAM',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'bag.huk@kotabogor.go.id',
  },
  BAG_PROKOPIM: {
    nama: 'Bagian Protokol dan Komunikasi Pimpinan',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'bag.humas@kotabogor.go.id',
  },
  BAG_ORGANISASI: {
    nama: 'Bagian Organisasi',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'bag.org@kotabogor.go.id',
  },
  BAG_PEMERINTAHAN: {
    nama: 'Bagian Pemerintahan',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'bag.pem@kotabogor.go.id',
  },
  BAG_UMUM: {
    nama: 'Bagian Umum',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'bag.umum@kotabogor.go.id',
  },
  BAG_PBJ: {
    nama: 'Bagian Pengadaan Barang',
    alamat: 'Jl. Ir. H. Juanda No. 10, RT.01/RW.01, Pabaton',
    email: 'bag.pbj@kotabogor.go.id',
  },
}

// Bandingkan nama tanpa peduli huruf besar/kecil, spasi ganda, dan tanda baca.
export function normalNamaOpd(nama) {
  return String(nama ?? '')
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Ambil kontak berdasarkan `kode` OPD (mis. "DINKES").
 * Mengembalikan `{ alamat, email }` dengan akhiran kota/provinsi lengkap, atau
 * `null` bila kode tidak dikenal.
 */
export function kontakDariKode(kode) {
  const isi = ALAMAT_OPD[kode]
  if (!isi) return null
  return {
    alamat: `${isi.alamat}, ${AKHIRAN_ALAMAT}`,
    email: isi.email,
  }
}

/**
 * Cari alamat + email instansi berdasarkan namanya. Cadangan bila `kode` dari
 * API tidak tersedia (mis. peran pengguna tidak punya akses daftar OPD).
 */
export function cariKontakOpd(nama) {
  const kunci = normalNamaOpd(nama)
  if (!kunci) return null

  const kode = Object.keys(ALAMAT_OPD).find(
    (k) => normalNamaOpd(ALAMAT_OPD[k].nama) === kunci,
  )
  return kode ? kontakDariKode(kode) : null
}
