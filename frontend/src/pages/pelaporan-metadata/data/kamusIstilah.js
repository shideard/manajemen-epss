// Kamus istilah wizard Pelaporan Metadata (MS-Keg).
//
// Sumber : referensi/panduan_teknis_pengisian_metadata.pdf (56 halaman).
// Sifat  : DEFINISI istilah, bukan modus historis kegiatan. Karena itu file ini
//          sengaja terpisah dari `tabelSaran.js` (saran statistik) dan tidak
//          boleh dicampur: `SaranPill` hanya untuk data tabel saran.
//
// Aturan penulisan definisi:
// - Definisi disalin/diringkas dari kalimat pembuka PDF pada rincian terkait.
// - Penegasan aturan pengisian TIDAK dimasukkan ke sini; itu masuk ke teks hint
//   di masing-masing step.
// - Istilah yang tidak punya definisi di PDF tidak dibuatkan entri. Kalau sebuah
//   opsi tidak bisa dijelaskan tanpa mengarang, jangan diberi tooltip.
//
// Struktur tiap entri:
//   id      : kunci unik, dipakai sebagai `id` popover dan anchor link
//   istilah : judul yang tampil di popover / glosarium
//   blok    : kelompok blok untuk halaman glosarium
//   definisi: teks penjelasan (bahasa awam, setia pada PDF)
//   terkait : id istilah lain yang sering tertukar (ditampilkan sebagai teks)
//   sumber  : halaman PDF asal definisi

export const BLOK_KAMUS = {
  umum: { judul: 'Istilah Umum', urutan: 0 },
  blok4: { judul: 'Blok IV. Desain Kegiatan', urutan: 4 },
  blok5: { judul: 'Blok V. Desain Sampel', urutan: 5 },
  blok6: { judul: 'Blok VI. Pengumpulan Data', urutan: 6 },
  blok7: { judul: 'Blok VII. Pengolahan dan Analisis', urutan: 7 },
}

export const KAMUS_ISTILAH = [
  // ------------------------------------------------------------------ Umum
  // "Cara Pengumpulan Data" muncul di Halaman Awal, sebelum blok mana pun.
  {
    id: 'cara-survei',
    istilah: 'Survei',
    blok: 'umum',
    definisi:
      'Cara pengumpulan data yang dilakukan melalui pencacahan sampel untuk memperkirakan karakteristik suatu populasi pada saat tertentu.',
    terkait: ['cara-sensus', 'cara-kompilasi'],
    sumber: 'PDF hal. 9 (Cara Pengumpulan Data)',
  },
  {
    id: 'cara-sensus',
    istilah: 'Sensus (Pencacahan Lengkap)',
    blok: 'umum',
    definisi:
      'Cara pengumpulan data yang dilakukan melalui pencacahan seluruh unit populasi pada pengambilan sampel tahap terakhir untuk memperkirakan karakteristik suatu populasi pada saat tertentu.',
    terkait: ['cara-survei', 'cara-kompilasi'],
    sumber: 'PDF hal. 9 (Cara Pengumpulan Data)',
  },
  {
    id: 'cara-kompilasi',
    istilah: 'Kompilasi Produk Administrasi',
    blok: 'umum',
    definisi:
      'Cara pengumpulan, pengolahan, penyajian, dan analisis data yang didasarkan pada catatan administrasi yang ada pada pemerintah, swasta, dan/atau masyarakat.',
    terkait: ['cara-survei', 'cara-sensus'],
    sumber: 'PDF hal. 9 (Cara Pengumpulan Data)',
  },
  {
    // PDF tidak merumuskan definisi kalimat penuh; hanya memberi contoh.
    id: 'cara-lain-ti',
    istilah: 'Cara Lain Sesuai Perkembangan TI',
    blok: 'umum',
    definisi:
      'Cara pengumpulan data di luar survei, sensus, dan kompilasi produk administrasi, yaitu memanfaatkan perkembangan teknologi informasi. Contoh: pemanfaatan big data (data dari Shopee, Tokopedia, tagar Instagram, tagar Twitter, dan lain-lain) serta metode crawling.',
    terkait: ['cara-kompilasi'],
    sumber: 'PDF hal. 9 (Cara Pengumpulan Data)',
  },

  // ---------------------------------------------------------------- Blok IV
  {
    id: 'tipe-longitudinal-panel',
    istilah: 'Longitudinal Panel',
    blok: 'blok4',
    definisi:
      'Pengumpulan data beberapa variabel pada periode waktu tertentu terhadap kelompok sampel yang sama, untuk mengetahui perubahan kondisi atau hubungan dalam populasi pada periode waktu berbeda.',
    terkait: ['tipe-longitudinal-cross-sectional', 'tipe-cross-sectional'],
    sumber: 'PDF hal. 19 (R.4.3)',
  },
  {
    id: 'tipe-longitudinal-cross-sectional',
    istilah: 'Longitudinal Cross Sectional',
    blok: 'blok4',
    definisi:
      'Pengumpulan data beberapa variabel pada periode waktu tertentu untuk mengetahui hubungan antar variabel dan perubahannya pada populasi yang diamati di periode waktu berbeda. Sampel antar periode tidak harus sama.',
    terkait: ['tipe-longitudinal-panel', 'tipe-cross-sectional'],
    sumber: 'PDF hal. 19 (R.4.3)',
  },
  {
    id: 'tipe-cross-sectional',
    istilah: 'Cross Sectional',
    blok: 'blok4',
    definisi:
      'Pengumpulan data beberapa variabel pada satu waktu, untuk mengetahui hubungan satu variabel dengan variabel lain pada waktu tersebut.',
    terkait: ['tipe-longitudinal-panel', 'tipe-longitudinal-cross-sectional'],
    sumber: 'PDF hal. 19 (R.4.3)',
  },
  {
    id: 'papi',
    istilah: 'PAPI (Paper-assisted Personal Interviewing)',
    blok: 'blok4',
    definisi: 'Wawancara tatap muka langsung dengan media kertas.',
    sumber: 'PDF hal. 22 (R.4.7)',
  },
  {
    id: 'capi',
    istilah: 'CAPI (Computer-assisted Personal Interviewing)',
    blok: 'blok4',
    definisi:
      'Wawancara tatap muka langsung, tetapi pertanyaan dan daftar jawaban ditampilkan pada perangkat multimedia (misalnya aplikasi Android).',
    terkait: ['cati', 'cawi'],
    sumber: 'PDF hal. 22 (R.4.7)',
  },
  {
    id: 'cati',
    istilah: 'CATI (Computer-assisted Telephones Interviewing)',
    blok: 'blok4',
    definisi: 'Wawancara langsung tetapi dilakukan melalui telepon.',
    terkait: ['capi', 'cawi'],
    sumber: 'PDF hal. 22 (R.4.7)',
  },
  {
    id: 'cawi',
    istilah: 'CAWI (Computer Aided Web Interviewing)',
    blok: 'blok4',
    definisi:
      'Pengumpulan data dengan kuesioner online melalui komputer atau perangkat lain yang terhubung ke internet.',
    terkait: ['capi', 'cati'],
    sumber: 'PDF hal. 22 (R.4.7)',
  },
  {
    id: 'mail',
    istilah: 'Mail',
    blok: 'blok4',
    definisi: 'Pengumpulan data melalui surat, baik dalam bentuk hardcopy maupun softcopy.',
    sumber: 'PDF hal. 22 (R.4.7)',
  },
  {
    id: 'unit-pengumpulan',
    istilah: 'Unit Pengumpulan Data',
    blok: 'blok4',
    definisi: 'Unit pengamatan yang digunakan pada saat pengumpulan data.',
    terkait: ['unit-observasi', 'unit-sampel', 'unit-analisis'],
    sumber: 'PDF hal. 23 (R.4.8)',
  },

  // ----------------------------------------------------------------- Blok V
  {
    id: 'single-stage',
    istilah: 'Single Stage / Phase',
    blok: 'blok5',
    definisi:
      'Pengambilan sampel hanya satu tahap, yang dilakukan langsung pada unit populasi.',
    terkait: ['multi-stage'],
    sumber: 'PDF hal. 24 (R.5.1)',
  },
  {
    id: 'multi-stage',
    istilah: 'Multi Stage / Phase',
    blok: 'blok5',
    definisi:
      'Pengambilan sampel melalui dua tahap atau lebih. Metode pemilihan sampel pada masing-masing tahap bisa sama atau berbeda.',
    terkait: ['single-stage'],
    sumber: 'PDF hal. 24 (R.5.1)',
  },
  {
    id: 'sampel-probabilitas',
    istilah: 'Sampel Probabilitas',
    blok: 'blok5',
    definisi:
      'Metode pemilihan sampel yang memberi peluang sama bagi setiap unit populasi untuk dipilih sebagai sampel.',
    terkait: ['sampel-nonprobabilitas'],
    sumber: 'PDF hal. 24 (R.5.2)',
  },
  {
    id: 'sampel-nonprobabilitas',
    istilah: 'Sampel Nonprobabilitas',
    blok: 'blok5',
    definisi:
      'Teknik pemilihan sampel yang tidak memberi peluang sama bagi setiap unit populasi untuk dipilih sebagai sampel.',
    terkait: ['sampel-probabilitas'],
    sumber: 'PDF hal. 24 (R.5.2)',
  },
  {
    id: 'simple-random-sampling',
    istilah: 'Simple Random Sampling',
    blok: 'blok5',
    definisi:
      'Pengambilan sampel secara acak tanpa memperhatikan strata dalam populasi. Cocok untuk populasi yang homogen.',
    sumber: 'PDF hal. 25 (R.5.3)',
  },
  {
    id: 'systematic-random-sampling',
    istilah: 'Systematic Random Sampling',
    blok: 'blok5',
    definisi:
      'Pengambilan sampel dengan mengurutkan unit sampel lalu menentukan interval k. Sampel yang diambil adalah unit ke-k, ke-2k, dan seterusnya.',
    sumber: 'PDF hal. 25 (R.5.3)',
  },
  {
    id: 'stratified-random-sampling',
    istilah: 'Stratified Random Sampling',
    blok: 'blok5',
    definisi:
      'Pengambilan sampel yang biasa digunakan pada populasi dengan unit sampel bertingkat atau berkelompok. Cocok untuk populasi yang tidak homogen.',
    sumber: 'PDF hal. 25 (R.5.3)',
  },
  {
    id: 'cluster-sampling',
    istilah: 'Cluster Sampling',
    blok: 'blok5',
    definisi:
      'Pemilihan sampel dari kelompok-kelompok unit yang kecil. Metode ini didasarkan pada gugus atau cluster.',
    sumber: 'PDF hal. 25 (R.5.3)',
  },
  {
    id: 'multistage-sampling',
    istilah: 'Multistage Sampling',
    blok: 'blok5',
    definisi:
      'Pengambilan sampel dengan menggunakan kombinasi dari metode pengambilan sampel yang berbeda dalam beberapa tahap.',
    sumber: 'PDF hal. 25 (R.5.3)',
  },
  {
    id: 'quota-sampling',
    istilah: 'Quota Sampling',
    blok: 'blok5',
    definisi:
      'Penetapan sampel dengan menentukan kuota terlebih dahulu pada masing-masing kelompok, karena besar dan kriteria sampel sudah ditentukan lebih dahulu.',
    sumber: 'PDF hal. 26 (R.5.3)',
  },
  {
    id: 'accidental-sampling',
    istilah: 'Accidental Sampling',
    blok: 'blok5',
    definisi: 'Penentuan sampel berdasarkan kebetulan ditemui.',
    sumber: 'PDF hal. 26 (R.5.3)',
  },
  {
    id: 'purposive-sampling',
    istilah: 'Purposive Sampling',
    blok: 'blok5',
    definisi:
      'Pengambilan sampel dengan kriteria tertentu, disebut juga judgement sampling. Responden dipilih karena dianggap mampu memberi informasi yang benar.',
    sumber: 'PDF hal. 26 (R.5.3)',
  },
  {
    id: 'snowball-sampling',
    istilah: 'Snowball Sampling',
    blok: 'blok5',
    definisi:
      'Pengambilan sampel berantai: informasi mengenai responden berikutnya diperoleh dari responden sebelumnya. Dipakai jika responden sulit diidentifikasi.',
    sumber: 'PDF hal. 26 (R.5.3)',
  },
  {
    id: 'saturation-sampling',
    istilah: 'Saturation Sampling',
    blok: 'blok5',
    definisi:
      'Pengambilan sampel dengan menggunakan semua anggota populasi sebagai sampel. Syaratnya populasi tidak banyak, atau peneliti ingin membuat generalisasi dengan kesalahan sangat kecil.',
    sumber: 'PDF hal. 26 (R.5.3)',
  },
  {
    id: 'kerangka-sampel',
    istilah: 'Kerangka Sampel',
    blok: 'blok5',
    definisi:
      'Daftar semua unit dalam populasi yang akan dijadikan sampel untuk disurvei. Kerangka sampel menjadi dasar penarikan sampel.',
    terkait: ['list-frame', 'area-frame'],
    sumber: 'PDF hal. 27 (R.5.4)',
  },
  {
    id: 'list-frame',
    istilah: 'List Frame',
    blok: 'blok5',
    definisi:
      'Kerangka sampel yang berisi daftar unit-unit sampel, misalnya daftar rumah tangga atau customer list.',
    terkait: ['kerangka-sampel', 'area-frame'],
    sumber: 'PDF hal. 27 (R.5.4)',
  },
  {
    id: 'area-frame',
    istilah: 'Area Frame',
    blok: 'blok5',
    definisi:
      'Kerangka sampel berupa peta dengan batas yang jelas, permanen, mudah dikenali, dan tidak terlampau luas. Elemen di dalam area (misalnya tempat tinggal atau rumah tangga usaha) dijadikan unit sampel.',
    terkait: ['kerangka-sampel', 'list-frame'],
    sumber: 'PDF hal. 27 (R.5.4)',
  },
  {
    id: 'fraksi-sampel',
    istilah: 'Fraksi Sampel',
    blok: 'blok5',
    definisi:
      'Rasio ukuran sampel (n) terhadap ukuran populasi (N). Untuk pengambilan sampel beberapa tahap, fraksi sampel keseluruhan diperoleh dengan mengalikan fraksi sampel setiap tahap. Fraksi sampel erat hubungannya dengan weighting.',
    sumber: 'PDF hal. 28 (R.5.5)',
  },
  {
    id: 'sampling-error',
    istilah: 'Sampling Error',
    blok: 'blok5',
    definisi:
      'Penyimpangan yang terjadi karena adanya kesalahan dalam pemakaian sampel. Semakin besar sampel yang diambil, semakin kecil sampling error. Pada tingkat kepercayaan 95%, perkiraan sampling error adalah 5%.',
    sumber: 'PDF hal. 29 (R.5.6)',
  },
  {
    id: 'unit-sampel',
    istilah: 'Unit Sampel',
    blok: 'blok5',
    definisi: 'Unit terkecil dari populasi yang akan diambil sebagai sampel.',
    terkait: ['unit-observasi', 'unit-analisis', 'unit-pengumpulan'],
    sumber: 'PDF hal. 29 (R.5.7)',
  },
  {
    id: 'unit-observasi',
    istilah: 'Unit Observasi',
    blok: 'blok5',
    definisi: 'Unit pengamatan yang digunakan pada pengumpulan data.',
    terkait: ['unit-sampel', 'unit-analisis', 'unit-pengumpulan'],
    sumber: 'PDF hal. 29 (R.5.8)',
  },

  // ---------------------------------------------------------------- Blok VI
  {
    id: 'pilot-study',
    istilah: 'Uji Coba (Pilot Study)',
    blok: 'blok6',
    definisi:
      'Pelaksanaan uji coba instrumen sebelum kegiatan utama. Penjelasannya mencakup lokasi uji coba, jumlah unit observasi, waktu pelaksanaan, dan berapa kali uji coba dilakukan.',
    sumber: 'PDF hal. 30 (R.6.1)',
  },
  {
    id: 'kunjungan-kembali',
    istilah: 'Kunjungan Kembali (Revisit)',
    blok: 'blok6',
    definisi:
      'Pengunjungan ulang untuk melengkapi isian instrumen, atau jika terdapat isian yang dinilai kurang sesuai.',
    terkait: ['supervisi', 'task-force'],
    sumber: 'PDF hal. 30 (R.6.2)',
  },
  {
    id: 'supervisi',
    istilah: 'Supervisi',
    blok: 'blok6',
    definisi:
      'Pengawasan terhadap pelaksana lapangan, dilakukan untuk perbaikan kualitas pada saat kegiatan berlangsung.',
    terkait: ['kunjungan-kembali', 'task-force'],
    sumber: 'PDF hal. 30 (R.6.2)',
  },
  {
    id: 'task-force',
    istilah: 'Task Force',
    blok: 'blok6',
    definisi:
      'Seseorang atau satuan tim khusus yang dibentuk untuk melakukan pencacahan atau pengumpulan data lapangan, umumnya bersamaan dengan pelaksanaan kegiatan.',
    terkait: ['kunjungan-kembali', 'supervisi'],
    sumber: 'PDF hal. 30 (R.6.2)',
  },
  {
    id: 'nonrespon',
    istilah: 'Nonrespon',
    blok: 'blok6',
    definisi:
      'Kondisi instrumen atau dokumen pengumpulan data tidak dapat terisi, yang umumnya terkait dengan responden.',
    sumber: 'PDF hal. 31 (R.6.3)',
  },
  {
    id: 'pendidikan-terendah',
    istilah: 'Pendidikan Terendah Petugas',
    blok: 'blok6',
    definisi: 'Pendidikan terakhir yang ditamatkan oleh petugas pengumpulan data.',
    sumber: 'PDF hal. 31 (R.6.5)',
  },
  {
    id: 'supervisor',
    istilah: 'Supervisor / Pengawas',
    blok: 'blok6',
    definisi:
      'Petugas yang memberikan pengawasan kepada enumerator, mencakup petugas pengumpul data serta program atau teknologi informasi yang digunakan dalam pengumpulan data.',
    terkait: ['enumerator'],
    sumber: 'PDF hal. 32 (R.6.6)',
  },
  {
    id: 'enumerator',
    istilah: 'Enumerator / Pengumpul Data',
    blok: 'blok6',
    definisi: 'Petugas yang melakukan pengumpulan data di lapangan secara langsung.',
    terkait: ['supervisor'],
    sumber: 'PDF hal. 32 (R.6.6)',
  },
  {
    id: 'pelatihan-petugas',
    istilah: 'Pelatihan Petugas',
    blok: 'blok6',
    definisi:
      'Tidak harus berupa pelatihan formal. Setiap bentuk transfer pemahaman kepada petugas mengenai jenis data yang dikumpulkan, tata cara pengumpulan data, dan teknik pengumpulan data termasuk pelatihan petugas.',
    sumber: 'PDF hal. 32 (R.6.7)',
  },

  // --------------------------------------------------------------- Blok VII
  {
    id: 'editing',
    istilah: 'Penyuntingan (Editing)',
    blok: 'blok7',
    definisi:
      'Kegiatan memeriksa kesalahan dan ketidakkonsistenan pengisian rincian pertanyaan.',
    terkait: ['coding', 'data-entry', 'validasi'],
    sumber: 'PDF hal. 33 (R.7.1)',
  },
  {
    id: 'coding',
    istilah: 'Penyandian (Coding)',
    blok: 'blok7',
    definisi:
      'Kegiatan memberikan kode pada rincian pertanyaan. Coding dilakukan untuk memudahkan entry data.',
    terkait: ['editing', 'data-entry', 'validasi'],
    sumber: 'PDF hal. 33 (R.7.1)',
  },
  {
    id: 'data-entry',
    istilah: 'Input Data (Data Entry)',
    blok: 'blok7',
    definisi:
      'Kegiatan memasukkan data ke dalam form data entry. Bisa dilakukan dengan aplikasi Excel atau aplikasi yang dibuat tersendiri.',
    terkait: ['editing', 'coding', 'validasi'],
    sumber: 'PDF hal. 33 (R.7.1)',
  },
  {
    id: 'validasi',
    istilah: 'Penyahihan (Validasi)',
    blok: 'blok7',
    definisi: 'Kegiatan pemeriksaan dan perbaikan data hasil entri data.',
    terkait: ['editing', 'coding', 'data-entry'],
    sumber: 'PDF hal. 33 (R.7.1)',
  },
  {
    id: 'analisis-deskriptif',
    istilah: 'Analisis Deskriptif',
    blok: 'blok7',
    definisi:
      'Analisis yang bertujuan menggambarkan karakteristik data menggunakan metode statistik sederhana.',
    terkait: ['analisis-inferensia'],
    sumber: 'PDF hal. 33 (R.7.2)',
  },
  {
    id: 'analisis-inferensia',
    istilah: 'Analisis Inferensia',
    blok: 'blok7',
    definisi:
      'Analisis yang bertujuan menarik kesimpulan pada sampel untuk digeneralisir ke populasi, menggunakan metode statistik yang lebih mendalam seperti anova, korelasi, regresi, chi-square, faktor, cluster, dan diskriminan.',
    terkait: ['analisis-deskriptif'],
    sumber: 'PDF hal. 33 (R.7.2)',
  },
  {
    id: 'unit-analisis',
    istilah: 'Unit Analisis',
    blok: 'blok7',
    definisi:
      'Unit data yang akan dianalisis. Unit analisis bisa sama dan bisa berbeda dengan unit sampel, unit observasi, dan tingkat penyajian.',
    terkait: ['unit-sampel', 'unit-observasi', 'tingkat-penyajian'],
    sumber: 'PDF hal. 34 (R.7.3)',
  },
  {
    id: 'tingkat-penyajian',
    istilah: 'Tingkat Penyajian',
    blok: 'blok7',
    definisi:
      'Kemampuan data hasil kegiatan statistik untuk menyajikan data/informasi karakteristik unit sampel/observasi dalam mewakili tingkat daerah tertentu.',
    terkait: ['unit-analisis'],
    sumber: 'PDF hal. 34 (R.7.4)',
  },
]

// Peta id -> entri, untuk pencarian cepat di komponen.
export const KAMUS_BY_ID = Object.fromEntries(KAMUS_ISTILAH.map((item) => [item.id, item]))

// Entri kamus dikelompokkan per blok dan diurutkan sesuai urutan blok.
export const KAMUS_PER_BLOK = Object.values(BLOK_KAMUS)
  .sort((a, b) => a.urutan - b.urutan)
  .map((blok) => ({
    ...blok,
    items: KAMUS_ISTILAH.filter((item) => item.blok === blok.id),
  }))
  .filter((blok) => blok.items.length > 0)

export function ambilIstilah(id) {
  return KAMUS_BY_ID[id] || null
}
