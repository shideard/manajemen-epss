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
//   id      : kunci unik, dipakai sebagai `id` popover
//   istilah : judul yang tampil di popover
//   definisi: teks penjelasan (bahasa awam, setia pada PDF)

export const KAMUS_ISTILAH = [
  // ------------------------------------------------------------------ Umum
  // "Cara Pengumpulan Data" muncul di Halaman Awal, sebelum blok mana pun.
  {
    id: 'cara-survei',
    istilah: 'Survei',
    definisi:
      'Cara pengumpulan data yang dilakukan melalui pencacahan sampel untuk memperkirakan karakteristik suatu populasi pada saat tertentu.',
  },
  {
    id: 'cara-sensus',
    istilah: 'Sensus (Pencacahan Lengkap)',
    definisi:
      'Cara pengumpulan data yang dilakukan melalui pencacahan seluruh unit populasi pada pengambilan sampel tahap terakhir untuk memperkirakan karakteristik suatu populasi pada saat tertentu.',
  },
  {
    id: 'cara-kompilasi',
    istilah: 'Kompilasi Produk Administrasi',
    definisi:
      'Cara pengumpulan, pengolahan, penyajian, dan analisis data yang didasarkan pada catatan administrasi yang ada pada pemerintah, swasta, dan/atau masyarakat.',
  },
  {
    // PDF tidak merumuskan definisi kalimat penuh; hanya memberi contoh.
    id: 'cara-lain-ti',
    istilah: 'Cara Lain Sesuai Perkembangan TI',
    definisi:
      'Cara pengumpulan data di luar survei, sensus, dan kompilasi produk administrasi, yaitu memanfaatkan perkembangan teknologi informasi. Contoh: pemanfaatan big data (data dari Shopee, Tokopedia, tagar Instagram, tagar Twitter, dan lain-lain) serta metode crawling.',
  },

  // ---------------------------------------------------------------- Blok IV
  {
    id: 'tipe-longitudinal-panel',
    istilah: 'Longitudinal Panel',
    definisi:
      'Pengumpulan data beberapa variabel pada periode waktu tertentu terhadap kelompok sampel yang sama, untuk mengetahui perubahan kondisi atau hubungan dalam populasi pada periode waktu berbeda.',
  },
  {
    id: 'tipe-longitudinal-cross-sectional',
    istilah: 'Longitudinal Cross Sectional',
    definisi:
      'Pengumpulan data beberapa variabel pada periode waktu tertentu untuk mengetahui hubungan antar variabel dan perubahannya pada populasi yang diamati di periode waktu berbeda. Sampel antar periode tidak harus sama.',
  },
  {
    id: 'tipe-cross-sectional',
    istilah: 'Cross Sectional',
    definisi:
      'Pengumpulan data beberapa variabel pada satu waktu, untuk mengetahui hubungan satu variabel dengan variabel lain pada waktu tersebut.',
  },
  {
    id: 'papi',
    istilah: 'PAPI (Paper-assisted Personal Interviewing)',
    definisi: 'Wawancara tatap muka langsung dengan media kertas.',
  },
  {
    id: 'capi',
    istilah: 'CAPI (Computer-assisted Personal Interviewing)',
    definisi:
      'Wawancara tatap muka langsung, tetapi pertanyaan dan daftar jawaban ditampilkan pada perangkat multimedia (misalnya aplikasi Android).',
  },
  {
    id: 'cati',
    istilah: 'CATI (Computer-assisted Telephones Interviewing)',
    definisi: 'Wawancara langsung tetapi dilakukan melalui telepon.',
  },
  {
    id: 'cawi',
    istilah: 'CAWI (Computer Aided Web Interviewing)',
    definisi:
      'Pengumpulan data dengan kuesioner online melalui komputer atau perangkat lain yang terhubung ke internet.',
  },
  {
    id: 'mail',
    istilah: 'Mail',
    definisi: 'Pengumpulan data melalui surat, baik dalam bentuk hardcopy maupun softcopy.',
  },
  {
    id: 'unit-pengumpulan',
    istilah: 'Unit Pengumpulan Data',
    definisi: 'Unit pengamatan yang digunakan pada saat pengumpulan data.',
  },

  // ----------------------------------------------------------------- Blok V
  {
    id: 'single-stage',
    istilah: 'Single Stage / Phase',
    definisi:
      'Pengambilan sampel hanya satu tahap, yang dilakukan langsung pada unit populasi.',
  },
  {
    id: 'multi-stage',
    istilah: 'Multi Stage / Phase',
    definisi:
      'Pengambilan sampel melalui dua tahap atau lebih. Metode pemilihan sampel pada masing-masing tahap bisa sama atau berbeda.',
  },
  {
    id: 'sampel-probabilitas',
    istilah: 'Sampel Probabilitas',
    definisi:
      'Metode pemilihan sampel yang memberi peluang sama bagi setiap unit populasi untuk dipilih sebagai sampel.',
  },
  {
    id: 'sampel-nonprobabilitas',
    istilah: 'Sampel Nonprobabilitas',
    definisi:
      'Teknik pemilihan sampel yang tidak memberi peluang sama bagi setiap unit populasi untuk dipilih sebagai sampel.',
  },
  {
    id: 'simple-random-sampling',
    istilah: 'Simple Random Sampling',
    definisi:
      'Pengambilan sampel secara acak tanpa memperhatikan strata dalam populasi. Cocok untuk populasi yang homogen.',
  },
  {
    id: 'systematic-random-sampling',
    istilah: 'Systematic Random Sampling',
    definisi:
      'Pengambilan sampel dengan mengurutkan unit sampel lalu menentukan interval k. Sampel yang diambil adalah unit ke-k, ke-2k, dan seterusnya.',
  },
  {
    id: 'stratified-random-sampling',
    istilah: 'Stratified Random Sampling',
    definisi:
      'Pengambilan sampel yang biasa digunakan pada populasi dengan unit sampel bertingkat atau berkelompok. Cocok untuk populasi yang tidak homogen.',
  },
  {
    id: 'cluster-sampling',
    istilah: 'Cluster Sampling',
    definisi:
      'Pemilihan sampel dari kelompok-kelompok unit yang kecil. Metode ini didasarkan pada gugus atau cluster.',
  },
  {
    id: 'multistage-sampling',
    istilah: 'Multistage Sampling',
    definisi:
      'Pengambilan sampel dengan menggunakan kombinasi dari metode pengambilan sampel yang berbeda dalam beberapa tahap.',
  },
  {
    id: 'quota-sampling',
    istilah: 'Quota Sampling',
    definisi:
      'Penetapan sampel dengan menentukan kuota terlebih dahulu pada masing-masing kelompok, karena besar dan kriteria sampel sudah ditentukan lebih dahulu.',
  },
  {
    id: 'accidental-sampling',
    istilah: 'Accidental Sampling',
    definisi: 'Penentuan sampel berdasarkan kebetulan ditemui.',
  },
  {
    id: 'purposive-sampling',
    istilah: 'Purposive Sampling',
    definisi:
      'Pengambilan sampel dengan kriteria tertentu, disebut juga judgement sampling. Responden dipilih karena dianggap mampu memberi informasi yang benar.',
  },
  {
    id: 'snowball-sampling',
    istilah: 'Snowball Sampling',
    definisi:
      'Pengambilan sampel berantai: informasi mengenai responden berikutnya diperoleh dari responden sebelumnya. Dipakai jika responden sulit diidentifikasi.',
  },
  {
    id: 'saturation-sampling',
    istilah: 'Saturation Sampling',
    definisi:
      'Pengambilan sampel dengan menggunakan semua anggota populasi sebagai sampel. Syaratnya populasi tidak banyak, atau peneliti ingin membuat generalisasi dengan kesalahan sangat kecil.',
  },
  {
    id: 'kerangka-sampel',
    istilah: 'Kerangka Sampel',
    definisi:
      'Daftar semua unit dalam populasi yang akan dijadikan sampel untuk disurvei. Kerangka sampel menjadi dasar penarikan sampel.',
  },
  {
    id: 'list-frame',
    istilah: 'List Frame',
    definisi:
      'Kerangka sampel yang berisi daftar unit-unit sampel, misalnya daftar rumah tangga atau customer list.',
  },
  {
    id: 'area-frame',
    istilah: 'Area Frame',
    definisi:
      'Kerangka sampel berupa peta dengan batas yang jelas, permanen, mudah dikenali, dan tidak terlampau luas. Elemen di dalam area (misalnya tempat tinggal atau rumah tangga usaha) dijadikan unit sampel.',
  },
  {
    id: 'fraksi-sampel',
    istilah: 'Fraksi Sampel',
    definisi:
      'Rasio ukuran sampel (n) terhadap ukuran populasi (N). Untuk pengambilan sampel beberapa tahap, fraksi sampel keseluruhan diperoleh dengan mengalikan fraksi sampel setiap tahap. Fraksi sampel erat hubungannya dengan weighting.',
  },
  {
    id: 'sampling-error',
    istilah: 'Sampling Error',
    definisi:
      'Penyimpangan yang terjadi karena adanya kesalahan dalam pemakaian sampel. Semakin besar sampel yang diambil, semakin kecil sampling error. Pada tingkat kepercayaan 95%, perkiraan sampling error adalah 5%.',
  },
  {
    id: 'unit-sampel',
    istilah: 'Unit Sampel',
    definisi: 'Unit terkecil dari populasi yang akan diambil sebagai sampel.',
  },
  {
    id: 'unit-observasi',
    istilah: 'Unit Observasi',
    definisi: 'Unit pengamatan yang digunakan pada pengumpulan data.',
  },

  // ---------------------------------------------------------------- Blok VI
  {
    id: 'pilot-study',
    istilah: 'Uji Coba (Pilot Study)',
    definisi:
      'Pelaksanaan uji coba instrumen sebelum kegiatan utama. Penjelasannya mencakup lokasi uji coba, jumlah unit observasi, waktu pelaksanaan, dan berapa kali uji coba dilakukan.',
  },
  {
    id: 'kunjungan-kembali',
    istilah: 'Kunjungan Kembali (Revisit)',
    definisi:
      'Pengunjungan ulang untuk melengkapi isian instrumen, atau jika terdapat isian yang dinilai kurang sesuai.',
  },
  {
    id: 'supervisi',
    istilah: 'Supervisi',
    definisi:
      'Pengawasan terhadap pelaksana lapangan, dilakukan untuk perbaikan kualitas pada saat kegiatan berlangsung.',
  },
  {
    id: 'task-force',
    istilah: 'Task Force',
    definisi:
      'Seseorang atau satuan tim khusus yang dibentuk untuk melakukan pencacahan atau pengumpulan data lapangan, umumnya bersamaan dengan pelaksanaan kegiatan.',
  },
  {
    id: 'nonrespon',
    istilah: 'Nonrespon',
    definisi:
      'Kondisi instrumen atau dokumen pengumpulan data tidak dapat terisi, yang umumnya terkait dengan responden.',
  },
  {
    id: 'pendidikan-terendah',
    istilah: 'Pendidikan Terendah Petugas',
    definisi: 'Pendidikan terakhir yang ditamatkan oleh petugas pengumpulan data.',
  },
  {
    id: 'supervisor',
    istilah: 'Supervisor / Pengawas',
    definisi:
      'Petugas yang memberikan pengawasan kepada enumerator, mencakup petugas pengumpul data serta program atau teknologi informasi yang digunakan dalam pengumpulan data.',
  },
  {
    id: 'enumerator',
    istilah: 'Enumerator / Pengumpul Data',
    definisi: 'Petugas yang melakukan pengumpulan data di lapangan secara langsung.',
  },
  {
    id: 'pelatihan-petugas',
    istilah: 'Pelatihan Petugas',
    definisi:
      'Tidak harus berupa pelatihan formal. Setiap bentuk transfer pemahaman kepada petugas mengenai jenis data yang dikumpulkan, tata cara pengumpulan data, dan teknik pengumpulan data termasuk pelatihan petugas.',
  },

  // --------------------------------------------------------------- Blok VII
  {
    id: 'editing',
    istilah: 'Penyuntingan (Editing)',
    definisi:
      'Kegiatan memeriksa kesalahan dan ketidakkonsistenan pengisian rincian pertanyaan.',
  },
  {
    id: 'coding',
    istilah: 'Penyandian (Coding)',
    definisi:
      'Kegiatan memberikan kode pada rincian pertanyaan. Coding dilakukan untuk memudahkan entry data.',
  },
  {
    id: 'data-entry',
    istilah: 'Input Data (Data Entry)',
    definisi:
      'Kegiatan memasukkan data ke dalam form data entry. Bisa dilakukan dengan aplikasi Excel atau aplikasi yang dibuat tersendiri.',
  },
  {
    id: 'validasi',
    istilah: 'Penyahihan (Validasi)',
    definisi: 'Kegiatan pemeriksaan dan perbaikan data hasil entri data.',
  },
  {
    id: 'analisis-deskriptif',
    istilah: 'Analisis Deskriptif',
    definisi:
      'Analisis yang bertujuan menggambarkan karakteristik data menggunakan metode statistik sederhana.',
  },
  {
    id: 'analisis-inferensia',
    istilah: 'Analisis Inferensia',
    definisi:
      'Analisis yang bertujuan menarik kesimpulan pada sampel untuk digeneralisir ke populasi, menggunakan metode statistik yang lebih mendalam seperti anova, korelasi, regresi, chi-square, faktor, cluster, dan diskriminan.',
  },
  {
    id: 'analisis-deskriptif-inferensia',
    istilah: 'Analisis Deskriptif dan Inferensia',
    definisi:
      'Kegiatan memakai kedua metode sekaligus: analisis deskriptif untuk menggambarkan karakteristik data dengan statistik sederhana, lalu analisis inferensia untuk menarik kesimpulan dari sampel dan digeneralisir ke populasi.',
  },
  {
    id: 'unit-analisis',
    istilah: 'Unit Analisis',
    definisi:
      'Unit data yang akan dianalisis. Unit analisis bisa sama dan bisa berbeda dengan unit sampel, unit observasi, dan tingkat penyajian.',
  },
  {
    id: 'tingkat-penyajian',
    istilah: 'Tingkat Penyajian',
    definisi:
      'Kemampuan data hasil kegiatan statistik untuk menyajikan data/informasi karakteristik unit sampel/observasi dalam mewakili tingkat daerah tertentu.',
  },
]

// Peta id -> entri, untuk pencarian cepat di komponen.
export const KAMUS_BY_ID = Object.fromEntries(KAMUS_ISTILAH.map((item) => [item.id, item]))

export function ambilIstilah(id) {
  return KAMUS_BY_ID[id] || null
}
