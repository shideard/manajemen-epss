// Data saran kontekstual untuk wizard Pelaporan Metadata (MS-Keg).
//
// Sumber  : referensi/tabel_saran_sederhana.xlsx, sheet "Tabel Saran"
// Metode  : modus statistik per Cara Pengumpulan (Kompilasi Produk Administrasi vs Survei)
// Threshold: n (kegiatan) >= 5, OPD >= 3, pangsa modus >= 0.6
//
// Aturan penyaringan saat data ini dibuat:
// - Sebagian besar entri menyimpan modus AFIRMATIF saja: pill dipasang di opsi
//   yang biasanya DIPILIH, sehingga modus "Tidak" dibuang.
// - Pengecualian: field yang mayoritas kegiatannya justru TIDAK memilih sesuatu
//   (6.1 Pilot Survey, 8.1 Data Mikro) menyimpan modus "Tidak" dengan
//   `arahCentang: false`; pill lalu berbunyi "Biasanya tidak dicentang" dan
//   dipasang di opsi "Tidak". 7.3 Unit Analisis Rumah Tangga juga disimpan
//   sebagai "Tidak" (arahCentang: false) karena opsi yang dicentang mayoritas
//   hanyalah "Lainnya", yang dilewati.
// - Opsi "Lainnya" dilewati (isinya teks bebas, tidak bisa ditampilkan sebagai pill).
// - 4.7 PAPI/CAPI/CATI pada Kompilasi dilewati (bertentangan dengan panduan, sudah berupa modus "Tidak").
// - 5.x dan 6.6 tidak dibuatkan entri: berupa daftar/angka bebas, bukan pilihan
//   opsi, sehingga tidak punya modus yang bisa ditampilkan sebagai pill.
//
// Struktur tiap entri:
//   jenis : 'tunggal' (radio) | 'centang' (checkbox)
//   opsi        : (khusus 'centang') label opsi UI yang dicentang mayoritas kegiatan
//   arahCentang : false bila modusnya "Tidak" (opsi biasanya tidak dicentang);
//                 tidak ditulis bila true
//   k     : jumlah kegiatan yang memilih modus
//   n     : jumlah kegiatan pada cara pengumpulan tersebut
//   opd   : jumlah OPD berbeda pemilik kegiatan tersebut

export const TABEL_SARAN = {
  // Blok IV - Desain Kegiatan
  'blok4.frekuensiKegiatan': {
    jenis: 'tunggal',
    Kompilasi: { modus: 'Berulang', k: 31, n: 31, opd: 26 },
    Survei: { modus: 'Berulang', k: 9, n: 10, opd: 4 },
  },
  'blok4.frekuensiPenyelenggaraan': {
    jenis: 'tunggal',
    Kompilasi: { modus: 'Tahunan', k: 31, n: 31, opd: 26 },
  },
  'blok4.tipePengumpulan': {
    jenis: 'tunggal',
    Kompilasi: { modus: 'Cross Sectional', k: 26, n: 32, opd: 26 },
    Survei: { modus: 'Longitudinal Cross Sectional', k: 6, n: 9, opd: 4 },
  },
  'blok4.cakupanWilayah': {
    jenis: 'tunggal',
    Kompilasi: { modus: 'Sebagian Wilayah Indonesia', k: 32, n: 32, opd: 26 },
    Survei: { modus: 'Sebagian Wilayah Indonesia', k: 10, n: 10, opd: 4 },
  },
  'blok4.metodePengumpulan': {
    jenis: 'centang',
    Kompilasi: { opsi: 'Pengumpulan Data Sekunder', k: 31, n: 32, opd: 26 },
  },
  'blok4.unitPengumpulan': {
    jenis: 'centang',
    Survei: [
      { opsi: 'Individu', k: 6, n: 10, opd: 4 },
      { opsi: 'Usaha/Perusahaan', k: 6, n: 10, opd: 4 },
    ],
  },

  // Blok VI - Pengumpulan Data
  'blok6.metodePemeriksaanKualitas': {
    jenis: 'centang',
    Kompilasi: { opsi: 'Supervisi', k: 26, n: 32, opd: 26 },
    Survei: [
      { opsi: 'Kunjungan Kembali', k: 6, n: 9, opd: 4 },
      { opsi: 'Supervisi', k: 5, n: 9, opd: 4 },
    ],
  },
  'blok6.penyesuaianNonrespon': {
    jenis: 'tunggal',
    Survei: { modus: 'Ya', k: 6, n: 10, opd: 4 },
  },
  'blok6.pilotSurvey': {
    jenis: 'tunggal',
    // Mayoritas kegiatan kompilasi justru TIDAK melakukan uji coba.
    Kompilasi: { modus: 'Tidak', arahCentang: false, k: 31, n: 32, opd: 26 },
  },
  'blok6.pelatihanPetugas': {
    jenis: 'tunggal',
    Survei: { modus: 'Ya', k: 9, n: 10, opd: 4 },
  },

  // Blok VII - Pengolahan dan Analisis
  'blok7.tahapanPengolahan.editing': {
    jenis: 'tunggal',
    Kompilasi: { modus: 'Ya', k: 18, n: 32, opd: 26 },
    Survei: { modus: 'Ya', k: 9, n: 10, opd: 4 },
  },
  'blok7.tahapanPengolahan.coding': {
    jenis: 'tunggal',
    Survei: { modus: 'Ya', k: 7, n: 10, opd: 4 },
  },
  'blok7.tahapanPengolahan.dataEntry': {
    jenis: 'tunggal',
    Kompilasi: { modus: 'Ya', k: 29, n: 32, opd: 26 },
    Survei: { modus: 'Ya', k: 9, n: 10, opd: 4 },
  },
  'blok7.tahapanPengolahan.validasi': {
    jenis: 'tunggal',
    Kompilasi: { modus: 'Ya', k: 27, n: 32, opd: 26 },
    Survei: { modus: 'Ya', k: 10, n: 10, opd: 4 },
  },
  'blok7.metodeAnalisis': {
    jenis: 'tunggal',
    Kompilasi: { modus: 'Deskriptif', k: 31, n: 32, opd: 26 },
    Survei: { modus: 'Deskriptif', k: 10, n: 10, opd: 4 },
  },
  'blok7.unitAnalisis': {
    jenis: 'centang',
    // Satu-satunya opsi mayoritas dicentang pada Kompilasi adalah "Lainnya"
    // (dilewati), sehingga yang tersimpan justru opsi yang TIDAK dicentang.
    Kompilasi: { opsi: 'Rumah Tangga', arahCentang: false, k: 31, n: 32, opd: 26 },
  },
  'blok7.tingkatPenyajian': {
    jenis: 'centang',
    Kompilasi: { opsi: 'Kabupaten/Kota', k: 29, n: 32, opd: 26 },
    Survei: { opsi: 'Kabupaten/Kota', k: 8, n: 10, opd: 4 },
  },

  // Blok VIII - Diseminasi Hasil
  'blok8.produkUmum.tercetak': {
    jenis: 'tunggal',
    Survei: { modus: 'Ya', k: 9, n: 10, opd: 4 },
  },
  'blok8.produkUmum.digital': {
    jenis: 'tunggal',
    Kompilasi: { modus: 'Ya', k: 32, n: 32, opd: 26 },
    Survei: { modus: 'Ya', k: 9, n: 10, opd: 4 },
  },
  'blok8.produkUmum.dataMikro': {
    jenis: 'tunggal',
    // Hampir semua kegiatan kompilasi tidak menyediakan data mikro.
    Kompilasi: { modus: 'Tidak', arahCentang: false, k: 32, n: 32, opd: 26 },
  },
}
