// Data saran kontekstual untuk wizard Pelaporan Metadata (MS-Keg).
//
// Sumber  : referensi/tabel_saran_sederhana.xlsx, sheet "Tabel Saran"
// Metode  : modus statistik per Cara Pengumpulan (Kompilasi Produk Administrasi vs Survei)
// Threshold: n (kegiatan) >= 5, OPD >= 3, pangsa modus >= 0.6
//
// Aturan penyaringan saat data ini dibuat:
// - Hanya modus AFIRMATIF yang disimpan. Baris yang modusnya "Tidak" dibuang,
//   karena pill hanya dipasang di opsi yang biasanya DIPILIH.
// - Opsi "Lainnya" dilewati (isinya teks bebas, tidak bisa ditampilkan sebagai pill).
// - 4.7 PAPI/CAPI/CATI pada Kompilasi dilewati (bertentangan dengan panduan, sudah berupa modus "Tidak").
// - 5.1-5.4 dan 6.5 tidak ada field-nya pada wizard ini.
//
// Struktur tiap entri:
//   jenis : 'tunggal' (radio) | 'centang' (checkbox)
//   opsi  : (khusus 'centang') label opsi UI yang dicentang mayoritas kegiatan
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
}
