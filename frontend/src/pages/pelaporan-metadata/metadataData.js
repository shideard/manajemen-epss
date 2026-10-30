// Initial state & dummy data untuk modul Pelaporan Metadata Statistik Sektoral (MSB)

export const STORAGE_METADATA_KEY = 'epss_metadata_submissions'

export const INITIAL_METADATA_FORM = {
  // Metadata Dasar
  id: '',
  status: 'Draft',
  updatedAt: new Date().toISOString(),

  // Halaman Awal
  halamanAwal: {
    rekomendasiBps: 'Tidak', // 'Ya' | 'Tidak'
    judulKegiatan: '',
    tahun: new Date().getFullYear().toString(),
    caraPengumpulan: '', // 'Survei' | 'Sensus' | 'Kompilasi Produk Administrasi' | 'Cara Lain Sesuai Perkembangan TI'
    sektorKegiatan: '', // 'Sosial Budaya' | 'Ekonomi' | 'Politik Hukum dan Keamanan' | 'Pertanian' | 'Komunikasi dan Informatika'
  },

  // Blok I: Penyelenggara
  blok1: {
    instansiPenyelenggara: 'Dinas Komunikasi dan Informatika Kota Bogor',
    alamat: 'Jl. Ir. H. Juanda No. 10, Kota Bogor, Jawa Barat 16121',
    telepon: '(0251) 8321075',
    faksimile: '(0251) 8321075',
    email: 'diskominfo@kotabogor.go.id',
  },

  // Blok II: Penanggung Jawab
  blok2: {
    eselon1: 'Pemerintah Daerah Kota Bogor',
    eselon2: 'Kepala Dinas Komunikasi dan Informatika Kota Bogor',
    teknisNama: 'Ahmad Fauzi, S.Kom., M.Si.',
    teknisJabatan: 'Kepala Bidang Statistik Sektoral dan Pengelolaan Informasi',
    teknisAlamat: 'Gedung Diskominfo Lt. 3, Jl. Ir. H. Juanda No. 10, Bogor',
    teknisTelepon: '0812-3456-7890',
    teknisFaksimile: '(0251) 8321075',
    teknisEmail: 'bidang.statistik@kotabogor.go.id',
  },

  // Blok III: Perencanaan dan Persiapan
  blok3: {
    latarBelakang: 'Penyelenggaraan statistik sektoral ini dilaksanakan dalam rangka menyediakan data dukung perencanaan dan evaluasi pembangunan serta memperkuat Satu Data Indonesia tingkat Kota Bogor.',
    tujuan: 'Menyediakan indikator statistik sektoral yang valid, reliabel, dan mutakhir untuk kebutuhan pengambilan kebijakan daerah.',
    jadwal: [
      { tahapan: '1. Perencanaan Kegiatan', mulai: '2026-02-01', selesai: '2026-02-28' },
      { tahapan: '2. Desain Instrumen', mulai: '2026-03-01', selesai: '2026-03-20' },
      { tahapan: '3. Pengumpulan Data', mulai: '2026-04-01', selesai: '2026-05-15' },
      { tahapan: '4. Pengolahan Data', mulai: '2026-05-16', selesai: '2026-06-15' },
      { tahapan: '5. Analisis Hasil', mulai: '2026-06-16', selesai: '2026-07-10' },
      { tahapan: '6. Diseminasi Hasil', mulai: '2026-07-15', selesai: '2026-07-31' },
      { tahapan: '7. Evaluasi', mulai: '2026-08-01', selesai: '2026-08-15' },
    ],
    variabel: [
      {
        id: 1,
        nama: 'Tingkat Kepuasan Pengguna Layanan',
        konsep: 'Indeks persepsi masyarakat terhadap kemudahan dan kecepatan layanan',
        definisi: 'Skor agregat skala Likert 1-5 berdasarkan 9 unsur pelayanan publik',
        referensiWaktu: 'Tahun 2026',
      },
    ],
  },

  // Blok IV: Desain Kegiatan
  blok4: {
    frekuensiKegiatan: 'Berulang', // 'Hanya Sekali' | 'Berulang'
    // Hanya relevan jika frekuensiKegiatan === 'Berulang'
    frekuensiPenyelenggaraan: 'Tahunan', // 'Harian' | 'Minggu' | 'Bulanan' | 'Triwulanan' | 'Empat Bulanan' | 'Semesteran' | 'Tahunan' | 'Lebih Dari Dua Tahunan'
    tipePengumpulan: 'Cross Sectional', // 'Longitudinal Panel' | 'Longitudinal Cross Sectional' | 'Cross Sectional'
    cakupanWilayah: 'Sebagian Wilayah Indonesia', // 'Seluruh Wilayah Indonesia' | 'Sebagian Wilayah Indonesia'
    metodePengumpulan: ['Wawancara', 'Mengisi Kuesioner Sendiri'], // Array of checkboxes
    saranaPengumpulan: ['Computer Aided Web Interviewing (CAWI)', 'Computer-assisted Personal Interviewing (CAPI)'],
    unitPengumpulan: ['Individu', 'Rumah Tangga'],
  },

  // Blok V: Desain Sampel (hanya untuk kegiatan Survei)
  blok5: {
    rancanganSampel: 'Multi Stage Atau Phase', // 'Single Stage Atau Phase' | 'Multi Stage Atau Phase'
    metodePemilihanSampel: 'Sampel Probabilitas', // 'Sampel Probabilitas' | 'Sampel Nonprobabilitas'
    metodeSampel: 'Stratified Random Sampling', // Probabilitas: 'Simple Random Sampling' | 'Systematic Random Sampling' | 'Stratified Random Sampling' | 'Cluster Sampling' | 'Probability Proportional to Size Sampling'
    // Nonprobabilitas: 'Quota Sampling' | 'Accidental Sampling' | 'Purposive Sampling' | 'Snowball Sampling' | 'Saturation Sampling'
    kerangkaSampel: 'List Frame', // 'List Frame' | 'Area Frame'
    fraksiSampel: '0,05 (5 persen dari populasi terpilih)', // teks bebas
    samplingError: 'RSE ≤ 5% pada tingkat kepercayaan 95%', // teks bebas
    unitSampel: 'Individu penerima layanan publik yang terpilih',
    unitObservasi: 'Individu penerima layanan publik',
  },

  // Blok VI: Pengumpulan Data
  blok6: {
    pilotSurvey: 'Ya', // 'Ya' | 'Tidak'
    metodePemeriksaanKualitas: ['Supervisi', 'Kunjungan Kembali'],
    penyesuaianNonrespon: 'Ya', // 'Ya' | 'Tidak'
    petugasPengumpulan:
      'Staf Instansi Penyelenggara Dan Mitra Atau Tenaga Kontrak', // 'Staf Instansi Penyelenggara' | 'Mitra Atau Tenaga Kontrak' | 'Staf Instansi Penyelenggara Dan Mitra Atau Tenaga Kontrak'
    persyaratanPendidikan: 'Diploma IV Atau S1 Atau S2 Atau S3', // 'Kurang Dari Atau Sama Dengan SMP' | 'SMA Atau SMK' | 'Diploma I Atau II Atau III' | 'Diploma IV Atau S1 Atau S2 Atau S3'
    jumlahSupervisor: '4', // jumlah dalam satuan Orang
    jumlahEnumerator: '16', // jumlah dalam satuan Orang
    pelatihanPetugas: 'Ya', // 'Ya' | 'Tidak'
  },

  // Blok VII: Pengolahan dan Analisis
  blok7: {
    tahapanPengolahan: {
      editing: 'Ya',
      coding: 'Ya',
      dataEntry: 'Ya',
      validasi: 'Ya',
    },
    metodeAnalisis: 'Deskriptif Dan Inferensia', // 'Deskriptif' | 'Inferensia' | 'Deskriptif Dan Inferensia'
    unitAnalisis: ['Individu'],
    tingkatPenyajian: ['Kabupaten/Kota'],
  },

  // Blok VIII: Diseminasi Hasil
  blok8: {
    produkUmum: {
      tercetak: 'Ya',
      digital: 'Ya',
      dataMikro: 'Tidak',
    },
  },

  // Metadata catatan auto-fill AI
  aiPredictionsApplied: false,
  aiConfidence: null,
  predictedFields: [],
}

// Preset prediksi cerdas berdasarkan kata kunci pada judul kegiatan
export const AI_PREDICTION_PRESETS = [
  {
    keywordMatch: ['kepuasan', 'masyarakat', 'layanan', 'survei'],
    sampleTitle: 'Survei Kepuasan Masyarakat Terhadap Pelayanan Publik Kota Bogor 2026',
    confidence: '95%',
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
    predictedFieldsList: [
      'Cara Pengumpulan Data',
      'Sektor Kegiatan',
      'Desain Kegiatan (Blok IV: Frekuensi, Tipe, Metode, Sarana, Unit)',
      'Pengumpulan Data (Blok VI: Pilot, Supervisi, Non-respon)',
      'Pengolahan & Analisis (Blok VII: Tahapan, Metode Analisis, Unit, Tingkat)',
      'Diseminasi Hasil (Blok VIII: Produk Tersedia)',
    ],
  },
  {
    keywordMatch: ['kompilasi', 'produk', 'administrasi', 'data statistik'],
    sampleTitle: 'Kompilasi Data Statistik Sektoral Komunikasi dan Informatika Kota Bogor',
    confidence: '92%',
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
    predictedFieldsList: [
      'Cara Pengumpulan Data (Kompilasi Administrasi)',
      'Sektor Kegiatan (Kominfo)',
      'Metode Pengumpulan (Data Sekunder)',
      'Pengolahan & Analisis (Deskriptif)',
      'Diseminasi (Digital/Softcopy)',
    ],
  },
  {
    keywordMatch: ['umkm', 'usaha', 'ekonomi', 'pedagang', 'industri'],
    sampleTitle: 'Pendataan Potensi Pelaku Usaha Mikro dan Kecil Kota Bogor 2026',
    confidence: '88%',
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
    predictedFieldsList: [
      'Cara Pengumpulan & Sektor (Ekonomi)',
      'Metode & Sarana Pengumpulan (CAPI/PAPI)',
      'Unit Pengumpulan (Usaha/Perusahaan)',
      'Metode Analisis (Deskriptif)',
      'Diseminasi Hasil (Tercetak, Digital, Data Mikro)',
    ],
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
