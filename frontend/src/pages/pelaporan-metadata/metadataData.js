// Initial state & dummy data untuk modul Pelaporan Metadata Statistik Sektoral (MSB)

export const STORAGE_METADATA_KEY = 'epss_metadata_submissions'

export const INITIAL_METADATA_FORM = {
  // Metadata Dasar
  id: '',
  status: 'Draft',
  updatedAt: new Date().toISOString(),

  // Halaman Awal
  halamanAwal: {
    rekomendasiBps: '', // 'Ya' | 'Tidak'
    judulKegiatan: '',
    tahun: '',
    caraPengumpulan: '', // 'Survei' | 'Sensus' | 'Kompilasi Produk Administrasi' | 'Cara Lain Sesuai Perkembangan TI'
    sektorKegiatan: '', // 'Sosial Budaya' | 'Ekonomi' | 'Politik Hukum dan Keamanan' | 'Pertanian' | 'Komunikasi dan Informatika'
  },

  // Blok I: Penyelenggara
  // Nama instansi memang sudah diketahui; sisanya diisi manual oleh pengguna.
  blok1: {
    instansiPenyelenggara: 'Dinas Komunikasi dan Informatika Kota Bogor',
    alamat: '',
    telepon: '',
    faksimile: '',
    email: '',
  },

  // Blok II: Penanggung Jawab
  blok2: {
    eselon1: '',
    eselon2: '',
    teknisNama: '',
    teknisJabatan: '',
    teknisAlamat: '',
    teknisTelepon: '',
    teknisFaksimile: '',
    teknisEmail: '',
  },

  // Blok III: Perencanaan dan Persiapan
  blok3: {
    latarBelakang: '',
    tujuan: '',
    // Baris tahapan dipertahankan sebagai kerangka (nama tahapan baku),
    // tetapi tanggal mulai/selesai dikosongkan agar diisi manual.
    jadwal: [
      { tahapan: '1. Perencanaan Kegiatan', mulai: '', selesai: '' },
      { tahapan: '2. Desain Instrumen', mulai: '', selesai: '' },
      { tahapan: '3. Pengumpulan Data', mulai: '', selesai: '' },
      { tahapan: '4. Pengolahan Data', mulai: '', selesai: '' },
      { tahapan: '5. Analisis Hasil', mulai: '', selesai: '' },
      { tahapan: '6. Diseminasi Hasil', mulai: '', selesai: '' },
      { tahapan: '7. Evaluasi', mulai: '', selesai: '' },
    ],
    // Satu baris kosong supaya tabel variabel sudah bisa diisi langsung.
    variabel: [
      { id: 1, nama: '', konsep: '', definisi: '', referensiWaktu: '' },
    ],
  },

  // Blok IV: Desain Kegiatan
  blok4: {
    frekuensiKegiatan: '', // 'Hanya Sekali' | 'Berulang'
    // Hanya relevan jika frekuensiKegiatan === 'Berulang'
    frekuensiPenyelenggaraan: '', // 'Harian' | 'Minggu' | 'Bulanan' | 'Triwulanan' | 'Empat Bulanan' | 'Semesteran' | 'Tahunan' | 'Lebih Dari Dua Tahunan'
    tipePengumpulan: '', // 'Longitudinal Panel' | 'Longitudinal Cross Sectional' | 'Cross Sectional'
    cakupanWilayah: '', // 'Seluruh Wilayah Indonesia' | 'Sebagian Wilayah Indonesia'
    metodePengumpulan: [], // Array of checkboxes
    saranaPengumpulan: [],
    unitPengumpulan: [],
  },

  // Blok V: Desain Sampel (hanya untuk kegiatan Survei)
  blok5: {
    rancanganSampel: '', // 'Single Stage Atau Phase' | 'Multi Stage Atau Phase'
    metodePemilihanSampel: '', // 'Sampel Probabilitas' | 'Sampel Nonprobabilitas'
    metodeSampel: '', // Probabilitas: 'Simple Random Sampling' | 'Systematic Random Sampling' | 'Stratified Random Sampling' | 'Cluster Sampling' | 'Probability Proportional to Size Sampling'
    // Nonprobabilitas: 'Quota Sampling' | 'Accidental Sampling' | 'Purposive Sampling' | 'Snowball Sampling' | 'Saturation Sampling'
    kerangkaSampel: '', // 'List Frame' | 'Area Frame'
    fraksiSampel: '', // teks bebas
    samplingError: '', // teks bebas
    unitSampel: '',
    unitObservasi: '',
  },

  // Blok VI: Pengumpulan Data
  blok6: {
    pilotSurvey: '', // 'Ya' | 'Tidak'
    metodePemeriksaanKualitas: [],
    penyesuaianNonrespon: '', // 'Ya' | 'Tidak'
    petugasPengumpulan: '', // 'Staf Instansi Penyelenggara' | 'Mitra Atau Tenaga Kontrak' | 'Staf Instansi Penyelenggara Dan Mitra Atau Tenaga Kontrak'
    persyaratanPendidikan: '', // 'Kurang Dari Atau Sama Dengan SMP' | 'SMA Atau SMK' | 'Diploma I Atau II Atau III' | 'Diploma IV Atau S1 Atau S2 Atau S3'
    jumlahSupervisor: '', // jumlah dalam satuan Orang
    jumlahEnumerator: '', // jumlah dalam satuan Orang
    pelatihanPetugas: '', // 'Ya' | 'Tidak'
  },

  // Blok VII: Pengolahan dan Analisis
  blok7: {
    tahapanPengolahan: {
      editing: '',
      coding: '',
      dataEntry: '',
      validasi: '',
    },
    metodeAnalisis: '', // 'Deskriptif' | 'Inferensia' | 'Deskriptif Dan Inferensia'
    unitAnalisis: [],
    tingkatPenyajian: [],
  },

  // Blok VIII: Diseminasi Hasil
  blok8: {
    produkUmum: {
      tercetak: '',
      digital: '',
      dataMikro: '',
    },
  },

  // Catatan rekomendasi historis yang dipilih sendiri oleh pengguna.
  // Hanya berisi kunci field yang direkomendasikan dan memang diterapkan
  // lewat aksi eksplisit. Sistem TIDAK PERNAH mengisi form secara otomatis.
  rekomendasiDiterapkan: [],
}

// Minimal panjang judul kegiatan sebelum rekomendasi boleh ditampilkan.
export const MIN_JUDUL_REKOMENDASI = 3

// Preset rekomendasi berdasarkan kata kunci pada judul kegiatan.
// Bersifat SARAN saja: nilai tidak pernah ditulis ke form tanpa aksi pengguna.
export const AI_PREDICTION_PRESETS = [
  {
    keywordMatch: ['kepuasan', 'masyarakat', 'layanan', 'survei'],
    predictions: {
      caraPengumpulan: 'Survei',
      sektorKegiatan: 'Sosial Budaya',
      frekuensiKegiatan: 'Berulang',
      tipePengumpulan: 'Cross Sectional',
      cakupanWilayah: 'Sebagian Wilayah Indonesia',
      metodePengumpulan: ['Wawancara', 'Mengisi Kuesioner Sendiri'],
      saranaPengumpulan: ['Computer Aided Web Interviewing (CAWI)', 'Computer-assisted Personal Interviewing (CAPI)'],
      unitPengumpulan: ['Individu'],
      pilotSurvey: 'Ya',
      metodePemeriksaanKualitas: ['Supervisi'],
      penyesuaianNonrespon: 'Ya',
      tahapanPengolahan: { editing: 'Ya', coding: 'Ya', dataEntry: 'Ya', validasi: 'Ya' },
      metodeAnalisis: 'Deskriptif Dan Inferensia',
      unitAnalisis: ['Individu'],
      tingkatPenyajian: ['Kabupaten/Kota'],
      produkUmum: { tercetak: 'Ya', digital: 'Ya', dataMikro: 'Tidak' },
    },
  },
  {
    keywordMatch: ['kompilasi', 'produk', 'administrasi', 'data statistik'],
    predictions: {
      caraPengumpulan: 'Kompilasi Produk Administrasi',
      sektorKegiatan: 'Komunikasi dan Informatika',
      frekuensiKegiatan: 'Berulang',
      tipePengumpulan: 'Cross Sectional',
      cakupanWilayah: 'Sebagian Wilayah Indonesia',
      metodePengumpulan: ['Pengumpulan Data Sekunder'],
      saranaPengumpulan: ['Computer Aided Web Interviewing (CAWI)'],
      unitPengumpulan: ['Usaha/Perusahaan', 'Lainnya'],
      pilotSurvey: 'Tidak',
      metodePemeriksaanKualitas: ['Supervisi', 'Task Force'],
      penyesuaianNonrespon: 'Tidak',
      tahapanPengolahan: { editing: 'Ya', coding: 'Tidak', dataEntry: 'Ya', validasi: 'Ya' },
      metodeAnalisis: 'Deskriptif',
      unitAnalisis: ['Usaha/Perusahaan', 'Lainnya'],
      tingkatPenyajian: ['Kabupaten/Kota'],
      produkUmum: { tercetak: 'Tidak', digital: 'Ya', dataMikro: 'Tidak' },
    },
  },
  {
    keywordMatch: ['umkm', 'usaha', 'ekonomi', 'pedagang', 'industri'],
    predictions: {
      caraPengumpulan: 'Survei',
      sektorKegiatan: 'Ekonomi',
      frekuensiKegiatan: 'Hanya Sekali',
      tipePengumpulan: 'Cross Sectional',
      cakupanWilayah: 'Sebagian Wilayah Indonesia',
      metodePengumpulan: ['Wawancara', 'Pengamatan'],
      saranaPengumpulan: ['Computer-assisted Personal Interviewing (CAPI)', 'Paper-assisted Personal Interviewing (PAPI)'],
      unitPengumpulan: ['Usaha/Perusahaan'],
      pilotSurvey: 'Ya',
      metodePemeriksaanKualitas: ['Kunjungan Kembali', 'Supervisi'],
      penyesuaianNonrespon: 'Ya',
      tahapanPengolahan: { editing: 'Ya', coding: 'Ya', dataEntry: 'Ya', validasi: 'Ya' },
      metodeAnalisis: 'Deskriptif',
      unitAnalisis: ['Usaha/Perusahaan'],
      tingkatPenyajian: ['Kabupaten/Kota'],
      produkUmum: { tercetak: 'Ya', digital: 'Ya', dataMikro: 'Ya' },
    },
  },
]

// Mock data list untuk dashboard & pelaporan awal
export const MOCK_METADATA_SUBMISSIONS = [
  {
    id: 'MSB-2026-001',
    judulKegiatan: 'Survei Kepuasan Masyarakat Terhadap Pelayanan Publik Kota Bogor',
    instansi: 'Diskominfo Kota Bogor',
    tahun: '2026',
    status: 'Sedang diperiksa',
    caraPengumpulan: 'Survei',
    tanggalPengajuan: '12 Okt 2026',
    skorKelengkapan: '100%',
    aiAssisted: true,
  },
  {
    id: 'MSB-2026-002',
    judulKegiatan: 'Kompilasi Data Statistik Sektoral Komunikasi dan Informatika',
    instansi: 'Diskominfo Kota Bogor',
    tahun: '2026',
    status: 'Draft',
    caraPengumpulan: 'Kompilasi Produk Administrasi',
    tanggalPengajuan: '14 Okt 2026',
    skorKelengkapan: '65%',
    aiAssisted: true,
  },
  {
    id: 'MSB-2025-014',
    judulKegiatan: 'Pendataan Profil Kemiskinan Ekstrem Berbasis Spasial',
    instansi: 'Bappeda Kota Bogor',
    tahun: '2025',
    status: 'Diterima',
    caraPengumpulan: 'Sensus',
    tanggalPengajuan: '20 Nov 2025',
    skorKelengkapan: '100%',
    aiAssisted: false,
  },
]

export const STATUS_BADGE_STYLE = {
  Draft: 'bg-grey-50 text-grey-200 border-grey-75',
  Submit: 'bg-blue-50 text-blue-700 border-blue-200',
  'Sedang diperiksa': 'bg-lime-100 text-lime-500 border-lime-300 font-semibold',
  'Perlu perbaikan': 'bg-amber-50 text-amber-700 border-amber-300',
  'Sudah diperbaiki': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Ditolak: 'bg-red-50 text-red-700 border-red-200',
  Diterima: 'bg-green-50 text-emerald-700 border-emerald-300 font-semibold',
}
