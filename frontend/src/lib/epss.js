// Data referensi & logika murni EPSS (tanpa React), dicek oleh epss.check.js

// Warna bar kalender & ikon agenda, urutannya sama dengan ikon calendar-2-fill-{1..4}.svg
export const WARNA = ['#b57fd4', '#d47f81', '#7fa7d4', '#eef281']

// Tanggal lokal 'YYYY-MM-DD' (format sv-SE = ISO); string ISO aman dibandingkan dengan < dan >
export const toISODate = (date) => date.toLocaleDateString('sv-SE')

export function statusOf(kegiatan, today = toISODate(new Date())) {
  if (today < kegiatan.mulai) return 'Belum Mulai'
  if (today > kegiatan.selesai) return 'Selesai'
  return 'Berjalan'
}

// Kegiatan yang belum selesai, diurutkan dari yang paling dekat mulainya
export function agendaTerdekat(list, today, limit = 4) {
  return list
    .filter((k) => k.selesai >= today)
    .sort((a, b) => a.mulai.localeCompare(b.mulai))
    .slice(0, limit)
}

// Key localStorage untuk useStore
// ponytail: data disimpan di localStorage browser; pindahkan ke API Laravel saat endpoint-nya siap
export const KEYS = {
  kegiatan: 'epss.rencana-kegiatan',
  periode: 'epss.periode',
  periodeAktif: 'epss.periode-aktif',
  bukti: 'epss.bukti', // { 'kegiatanId:indikatorId': { checked, status, level, catatan } }
  berkas: 'epss.berkas', // { kegiatanId: [{ id, nama, ukuran, tanggal, oleh }] }
  levelIndikator: 'epss.level-indikator', // { indikatorId: level terverifikasi }
  snapshot: 'epss.snapshot',
  notifDibaca: 'epss.notif-dibaca',
  pengingat: 'epss.pengingat',
  users: 'epss.users',
  sesi: 'epss.sesi', // username akun yang sedang login
}

export const SEED_PERIODE = [
  { id: 'p2025', nama: 'Evaluasi EPSS Kota Bogor Siklus 2025–2026', tahun1: '2025', tahun2: '2026', batas: '2026-05-30', target: 2.85, actual: null, terkunci: false },
  { id: 'p2023', nama: 'Evaluasi EPSS Kota Bogor Siklus 2023–2024', tahun1: '2023', tahun2: '2024', batas: '2024-05-30', target: 2.5, actual: 2.32, terkunci: true },
]
export const SEED_USERS = [
  { id: 'u1', username: 'budi1234', email: 'budi1234@gmail.com', role: 'VERIFIKATOR' },
  { id: 'u2', username: 'ani1234', email: 'ani1234@gmail.com', role: 'OPERATOR' },
  { id: 'u3', username: 'deshi1234', email: 'deshi1234@gmail.com', role: 'VERIFIKATOR' },
]
// ponytail: login hanya di frontend dan semua akun memakai DEMO_PASSWORD; ganti dengan POST /login Laravel saat backend dipakai
export const DEMO_PASSWORD = 'password'
// Super admin tidak tampil di Kelola Pengguna supaya tidak bisa menghapus/menonaktifkan dirinya sendiri
export const SUPER_ADMIN = { id: 'admin', username: 'admin', name: 'Super Admin', role: 'SUPER_ADMIN_BIDANG' }
// Akun dari Kelola Pengguna belum punya nama; username dipakai untuk sapaan & PIC
export const cariAkun = (users, username) => {
  const akun = [SUPER_ADMIN, ...users].find((u) => u.username === username)
  return akun && { name: akun.username, ...akun }
}
export const SEED_PENGINGAT = [1, 7, 14, 30]
export const EMPTY_OBJECT = {}
export const EMPTY_LIST = []

export const periodeLabel = (p) => `${p.tahun1} - ${p.tahun2} (${p.terkunci ? 'Terkunci' : 'Aktif'})`

export const LEVELS = ['Rintisan', 'Terkelola', 'Terstandarisasi', 'Terpadu', 'Optimum']
export const levelLabel = (level) => (level ? `Level ${level} (${LEVELS[level - 1]})` : 'Belum terverifikasi')

// Kriteria & checklist bawaan tiap level; indikator boleh menimpa lewat `levels`
const DEFAULT_LEVELS = [
  {
    kriteria: 'Kegiatan statistik sudah dilakukan namun belum memiliki standar dan masih bergantung pada individu.',
    pemenuhan: ['Belum ada penetapan penanggung jawab kegiatan', 'Pelaksanaan belum terdokumentasi'],
    syarat: ['Daftar kebutuhan data OPD', 'Dokumentasi pelaksanaan kegiatan'],
  },
  {
    kriteria: 'Kegiatan dilakukan oleh setiap produsen data sesuai standarnya masing-masing.',
    pemenuhan: ['Seluruh produsen belum menerapkan standar yang sama; atau', 'Baru sebagian produsen data yang telah menerapkan standar'],
    syarat: ['SK Tim Pelaksana / Penetapan Penanggung Jawab Lapangan', 'Laporan pelaksanaan kegiatan'],
  },
  {
    kriteria: 'Kegiatan dilakukan dengan standar yang ditetapkan dan diterapkan oleh seluruh produsen data.',
    pemenuhan: ['Seluruh produsen data menerapkan standar yang ditetapkan'],
    syarat: ['SOP / pedoman pelaksanaan yang ditetapkan', 'Bukti penerapan standar pada seluruh produsen data', 'Daftar hadir sosialisasi standar', 'Laporan akhir kegiatan'],
  },
  {
    kriteria: 'Kegiatan terpadu antar produsen data dan dipantau secara berkala.',
    pemenuhan: ['Terdapat forum/koordinasi antar produsen data', 'Pemantauan dilakukan secara berkala'],
    syarat: ['Notulen forum koordinasi antar produsen data', 'Laporan pemantauan berkala'],
  },
  {
    kriteria: 'Kegiatan dievaluasi dan diperbaiki secara berkelanjutan.',
    pemenuhan: ['Hasil evaluasi ditindaklanjuti dengan perbaikan'],
    syarat: ['Laporan evaluasi', 'Bukti tindak lanjut perbaikan'],
  },
]

// ponytail: 32 indikator contoh (19 aspek) dengan nama & bobot sementara; ganti dengan indikator, aspek & bobot resmi
// Peraturan BPS No 3/2022 dari seed/API backend. Id i16–i32 ditambahkan belakangan, jadi urutan nomor ≠ urutan id.
// Indikator satu aspek harus berurutan supaya peta relasi tidak bersilangan.
export const DOMAINS = [
  {
    id: 'd1',
    nama: 'Prinsip Satu Data Indonesia (SDI)',
    indikator: [
      {
        id: 'i1',
        nama: 'Penerapan Standar Data Statistik',
        aspek: 'Standar Data Statistik',
        bobot: 3.5,
        levels: DEFAULT_LEVELS.map((level, i) =>
          i === 1
            ? {
                ...level,
                kriteria: 'Penerapan SDS telah dilakukan oleh setiap Produsen Data sesuai standarnya masing-masing',
                pemenuhan: ['Seluruh produsen belum menerapkan SDS; atau', 'Baru sebagian produsen data yang telah menerapkan SDS'],
              }
            : level,
        ),
      },
      { id: 'i16', nama: 'Penetapan Standar Data oleh Pembina Data', aspek: 'Standar Data Statistik', bobot: 3 },
      { id: 'i2', nama: 'Penerapan Metadata Statistik', aspek: 'Metadata Statistik', bobot: 3.5 },
      { id: 'i17', nama: 'Kelengkapan Metadata Kegiatan Statistik', aspek: 'Metadata Statistik', bobot: 3 },
      { id: 'i3', nama: 'Penerapan Interoperabilitas Data', aspek: 'Interoperabilitas Data', bobot: 4 },
      { id: 'i4', nama: 'Penerapan Kode Referensi dan/atau Data Induk', aspek: 'Kode Referensi dan/atau Data Induk', bobot: 4 },
    ],
  },
  {
    id: 'd2',
    nama: 'Kualitas Data',
    indikator: [
      { id: 'i5', nama: 'Relevansi Data terhadap Pengguna', aspek: 'Relevansi', bobot: 4 },
      { id: 'i18', nama: 'Identifikasi Kebutuhan Data Pengguna', aspek: 'Relevansi', bobot: 3 },
      { id: 'i6', nama: 'Akurasi Data', aspek: 'Akurasi', bobot: 4 },
      { id: 'i19', nama: 'Penilaian Akurasi Data', aspek: 'Akurasi', bobot: 3 },
      { id: 'i7', nama: 'Aktualitas dan Ketepatan Waktu', aspek: 'Aktualitas dan Ketepatan Waktu', bobot: 3 },
      { id: 'i20', nama: 'Jadwal Rilis Data Statistik', aspek: 'Aktualitas dan Ketepatan Waktu', bobot: 3 },
      { id: 'i21', nama: 'Aksesibilitas Data', aspek: 'Aksesibilitas', bobot: 3 },
      { id: 'i22', nama: 'Keterbandingan dan Konsistensi Data', aspek: 'Keterbandingan dan Konsistensi', bobot: 3 },
    ],
  },
  {
    id: 'd3',
    nama: 'Proses Bisnis Statistik',
    indikator: [
      { id: 'i8', nama: 'Perencanaan Kebutuhan Data', aspek: 'Perencanaan Data', bobot: 5 },
      { id: 'i23', nama: 'Penyusunan Rancangan Kegiatan Statistik', aspek: 'Perencanaan Data', bobot: 4 },
      { id: 'i9', nama: 'Pengumpulan Data Statistik Sektoral', aspek: 'Pengumpulan Data', bobot: 6 },
      { id: 'i24', nama: 'Pengawasan Lapangan Pengumpulan Data', aspek: 'Pengumpulan Data', bobot: 3 },
      { id: 'i10', nama: 'Pengolahan dan Analisis Data', aspek: 'Pemeriksaan Data', bobot: 5 },
      { id: 'i25', nama: 'Validasi dan Verifikasi Data', aspek: 'Pemeriksaan Data', bobot: 4 },
      { id: 'i11', nama: 'Diseminasi Data', aspek: 'Penyebarluasan Data', bobot: 4 },
      { id: 'i26', nama: 'Pemanfaatan Portal Satu Data', aspek: 'Penyebarluasan Data', bobot: 3 },
    ],
  },
  {
    id: 'd4',
    nama: 'Kelembagaan',
    indikator: [
      { id: 'i12', nama: 'Profesionalitas', aspek: 'Profesionalitas', bobot: 4 },
      { id: 'i27', nama: 'Penerapan Kode Etik Statistisi', aspek: 'Profesionalitas', bobot: 3 },
      { id: 'i13', nama: 'Kompetensi Sumber Daya Manusia', aspek: 'SDM yang Memadai dan Kapabel', bobot: 4 },
      { id: 'i28', nama: 'Pengembangan Kompetensi Pegawai', aspek: 'SDM yang Memadai dan Kapabel', bobot: 3 },
      { id: 'i29', nama: 'Pengorganisasian Penyelenggaraan Statistik', aspek: 'Pengorganisasian Statistik', bobot: 3 },
    ],
  },
  {
    id: 'd5',
    nama: 'Statistik Nasional',
    indikator: [
      { id: 'i30', nama: 'Pemanfaatan Data untuk Perencanaan Pembangunan', aspek: 'Pemanfaatan Data Statistik', bobot: 4 },
      { id: 'i14', nama: 'Tata Kelola Statistik Sektoral', aspek: 'Pengelolaan Kegiatan Statistik', bobot: 4 },
      { id: 'i31', nama: 'Rekomendasi Kegiatan Statistik', aspek: 'Pengelolaan Kegiatan Statistik', bobot: 3 },
      { id: 'i15', nama: 'Kolaborasi Penyelenggaraan Statistik', aspek: 'Penguatan Penyelenggaraan Statistik Sektoral', bobot: 3 },
      { id: 'i32', nama: 'Pembinaan Statistik Sektoral', aspek: 'Penguatan Penyelenggaraan Statistik Sektoral', bobot: 3 },
    ],
  },
]

// Daftar datar indikator dengan nomor urut & domain-nya
export const INDIKATOR = DOMAINS.flatMap((domain, d) =>
  domain.indikator.map((indikator) => ({ ...indikator, levels: indikator.levels ?? DEFAULT_LEVELS, domain, domainNomor: d + 1 })),
).map((indikator, i) => ({ ...indikator, nomor: i + 1 }))

export const indikatorById = Object.fromEntries(INDIKATOR.map((i) => [i.id, i]))
export const bobotDomain = (domain) => domain.indikator.reduce((sum, i) => sum + i.bobot, 0)

// Node & edge React Flow untuk peta Domain → Aspek → Indikator → Rencana Kegiatan (kolom 0–3).
// Indikator satu baris per indikator; aspek & domain di tengah anak-anaknya;
// kegiatan sedekat mungkin dengan indikatornya tanpa bertumpuk
export const PETA = { kolom: 290, baris: 76 }
export function petaRelasi(kegiatan, bukti) {
  const nodes = []
  const edges = []
  const node = (id, kolom, y, jenis, label, data) => nodes.push({ id, position: { x: kolom * PETA.kolom, y }, data: { jenis, label, kolom, ...data } })
  const edge = (source, target) => edges.push({ id: `${source}>${target}`, source, target })
  const tengah = (ys) => (Math.min(...ys) + Math.max(...ys)) / 2

  const aspek = new Map() // id node → { domain, nama, ys }
  INDIKATOR.forEach((i, n) => {
    const id = `a:${i.domain.id}:${i.aspek}`
    if (!aspek.has(id)) aspek.set(id, { domain: i.domain, nama: i.aspek, ys: [] })
    aspek.get(id).ys.push(n * PETA.baris)
    node(`i:${i.id}`, 2, n * PETA.baris, 'indikator', i.nama, { chip: `Indikator ${i.nomor}`, info: `Bobot ${i.bobot}` })
    edge(id, `i:${i.id}`)
  })
  const domain = new Map() // domain → ys aspeknya
  for (const [id, a] of aspek) {
    const y = tengah(a.ys)
    node(id, 1, y, 'aspek', a.nama, { chip: 'Aspek', info: `${a.ys.length} indikator` })
    edge(`d:${a.domain.id}`, id)
    domain.set(a.domain, [...(domain.get(a.domain) ?? []), y])
  }
  for (const [d, ys] of domain) {
    node(`d:${d.id}`, 0, tengah(ys), 'domain', d.nama, { chip: `Domain ${DOMAINS.indexOf(d) + 1}`, info: `${ys.length} aspek · ${d.indikator.length} indikator` })
  }

  // Baris indikator tiap kegiatan; kegiatan tanpa indikator (Math.min() = Infinity) di paling bawah
  const baris = Object.fromEntries(INDIKATOR.map((i, n) => [i.id, n]))
  const terkait = (k) => Object.values(bukti).filter((b) => b.kegiatanId === k.id && b.indikatorId in baris)
  let yBebas = 0
  kegiatan
    .map((k) => ({ k, rows: terkait(k).map((b) => baris[b.indikatorId]) }))
    .sort((a, b) => Math.min(...a.rows) - Math.min(...b.rows))
    .forEach(({ k, rows }) => {
      const y = Math.max(yBebas, rows.length ? tengah(rows) * PETA.baris : 0)
      yBebas = y + PETA.baris
      node(`k:${k.id}`, 3, y, 'kegiatan', k.nama, { chip: statusOf(k), info: k.opd, kegiatan: k })
      for (const row of rows) edge(`i:${INDIKATOR[row].id}`, `k:${k.id}`)
    })
  return { nodes, edges }
}

// Filter peta per tingkat { domain, aspek, indikator } (id node). Memilih satu tingkat ikut mengisi induknya;
// mengosongkan satu tingkat (id '') ikut mengosongkan tingkat di bawahnya.
const TINGKAT = ['domain', 'aspek', 'indikator']
export function pilihTingkat(edges, filter, jenis, id) {
  if (!id) return Object.fromEntries(TINGKAT.map((t, i) => [t, i < TINGKAT.indexOf(jenis) ? filter[t] : '']))
  const induk = (anak) => edges.find((e) => e.target === anak)?.source ?? ''
  const indikator = jenis === 'indikator' ? id : ''
  const aspek = jenis === 'aspek' ? id : indikator && induk(indikator)
  return { domain: jenis === 'domain' ? id : induk(aspek), aspek, indikator }
}

// Node yang satu jalur dengan `id`: semua induknya ke kiri dan semua turunannya ke kanan (untuk sorotan saat hover)
export function terhubung(edges, id) {
  const hasil = new Set([id])
  for (const [dari, ke] of [
    ['target', 'source'],
    ['source', 'target'],
  ]) {
    const antre = [id]
    while (antre.length) {
      const x = antre.pop()
      for (const e of edges) {
        if (e[dari] === x && !hasil.has(e[ke])) {
          hasil.add(e[ke])
          antre.push(e[ke])
        }
      }
    }
  }
  return hasil
}

// Indikator yang belum diverifikasi dihitung level 1 (Rintisan)
export function hitungIps(indikator, levels) {
  let total = 0
  let bobot = 0
  for (const i of indikator) {
    total += i.bobot * (levels[i.id] ?? 1)
    bobot += i.bobot
  }
  return bobot ? total / bobot : 0
}

// Predikat IPS sesuai Peraturan BPS No 3/2022
// Batas bawah tiap predikat, dari yang tertinggi (juga dipakai skala IPS di dashboard)
export const PREDIKAT_BATAS = [
  [4.2, 'Memuaskan'],
  [3.5, 'Sangat Baik'],
  [2.6, 'Baik'],
  [1.8, 'Cukup'],
  [1, 'Kurang'],
]

export const predikat = (ips) => PREDIKAT_BATAS.find(([batas]) => ips >= batas)?.[1] ?? 'Kurang'

// Verifikasi berjenjang: level terpenuhi = jumlah level berurutan dari level 1 yang semua syaratnya dicentang
export function levelTerpenuhi(levels, checked = {}) {
  let level = 0
  while (level < levels.length && levels[level].syarat.every((_, i) => checked[level + 1]?.[i])) level++
  return level
}

export const buktiKey = (kegiatanId, indikatorId) => `${kegiatanId}:${indikatorId}`

export function statusKegiatan(kegiatan, bukti, jumlahBerkas, today) {
  if (bukti.length > 0 && bukti.every((b) => b.status === 'terverifikasi')) return 'Terverifikasi'
  if (jumlahBerkas > 0) return 'Bukti dukung diunggah'
  if (kegiatan.mulai <= today && today <= kegiatan.selesai) return 'Sedang dilaksanakan'
  return 'Belum dilaksanakan'
}

export function geserHari(iso, hari) {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + hari)
  return toISODate(date)
}

export const selisihHari = (dari, sampai) => Math.round((new Date(`${sampai}T00:00:00`) - new Date(`${dari}T00:00:00`)) / 86400000)

// Pengingat H-n sebelum kegiatan mulai; tampil sejak tanggal pengingat sampai kegiatan selesai.
// Per kegiatan hanya pengingat terbaru yang tampil (H-1 menggantikan H-7, dan muncul lagi sebagai belum dibaca)
export function notifikasi(kegiatan, hariPengingat, today) {
  return kegiatan
    .flatMap((k) =>
      hariPengingat
        .map((hari) => ({ id: `${k.id}:${hari}`, tanggal: geserHari(k.mulai, -hari), kegiatan: k }))
        .filter((n) => n.tanggal <= today && today <= k.selesai)
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
        .slice(0, 1),
    )
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
}

export function paginate(list, page, size) {
  const pageCount = Math.max(1, Math.ceil(list.length / size))
  const current = Math.min(page, pageCount)
  return { rows: list.slice((current - 1) * size, current * size), page: current, pageCount }
}

// Nomor halaman yang ditampilkan: hanya pertama, aktif, dan terakhir; setiap celah jadi '…'
// (halaman sebelah dibuka lewat tombol panah)
export function halamanTerlihat(page, pageCount) {
  const nomor = [...new Set([1, page, pageCount])].sort((a, b) => a - b)
  const hasil = []
  for (const n of nomor) {
    if (n - hasil.at(-1) > 1) hasil.push('…')
    hasil.push(n)
  }
  return hasil
}

export const formatTanggal = (iso, month = 'long') =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month, year: 'numeric' }) : '-'

export const includesText = (values, query) => {
  const q = query.trim().toLowerCase()
  return !q || values.some((v) => String(v ?? '').toLowerCase().includes(q))
}

// Data form periode (hasil Object.fromEntries(FormData)) → { data } atau { error }.
// periodeLain = periode selain yang sedang diedit; tahunnya tidak boleh beririsan
export function validasiPeriode(form, periodeLain = []) {
  const target = Number(form.target)
  if (Number(form.tahun2) !== Number(form.tahun1) + 1) return { error: 'Tahun kedua harus satu tahun setelah tahun pertama (siklus 2 tahunan).' }
  const bentrok = periodeLain.find((p) => form.tahun1 <= p.tahun2 && p.tahun1 <= form.tahun2)
  if (bentrok) return { error: `Tahun ${form.tahun1}-${form.tahun2} beririsan dengan periode "${bentrok.nama}" (${bentrok.tahun1}-${bentrok.tahun2}).` }
  if (form.batas < `${form.tahun1}-01-01` || form.batas > `${form.tahun2}-12-31`) return { error: `Batas akhir unggah bukti harus di antara tahun ${form.tahun1} dan ${form.tahun2}.` }
  if (!(target >= 1 && target <= 5)) return { error: 'Target skor harus antara 1.00 dan 5.00.' }
  return { data: { nama: form.nama.trim(), tahun1: form.tahun1, tahun2: form.tahun2, batas: form.batas, target } }
}

export const PREDIKAT_TONE = { Kurang: 'red', Cukup: 'blue', Baik: 'green', 'Sangat Baik': 'green', Memuaskan: 'green' }

// Jumlah berkas dari semua kegiatan yang dipetakan ke indikator ini
export const jumlahBukti = (bukti, berkas, indikatorId) =>
  Object.values(bukti)
    .filter((b) => b.indikatorId === indikatorId)
    .reduce((total, b) => total + (berkas[b.kegiatanId]?.length ?? 0), 0)

// Isi Repositori: satu baris per berkas (id) dengan semua kegiatan yang memakainya, terbaru dulu.
// Tiap entri di berkas[kegiatanId] mencatat periode saat diunggah/ditautkan, jadi berkas lama yang dipakai ulang
// ikut masuk folder periode sekarang. Entri lama tanpa periodeId masuk periode yang tahunnya memuat tanggal unggah.
// Tag indikator = gabungan indikator yang dipetakan ke semua kegiatan tertaut (urut nomor), jadi bertambah saat ditautkan
export function arsipBerkas(berkas, kegiatan, bukti, periode) {
  const kegiatanById = new Map(kegiatan.map((k) => [k.id, k]))
  const arsip = new Map()
  for (const [kegiatanId, list] of Object.entries(berkas)) {
    const k = kegiatanById.get(kegiatanId)
    if (!k) continue
    const indikator = Object.values(bukti)
      .filter((b) => b.kegiatanId === kegiatanId)
      .map((b) => indikatorById[b.indikatorId])
      .filter(Boolean)
    for (const f of list) {
      const tahun = f.tanggal.slice(0, 4)
      const periodeId = f.periodeId ?? periode.find((p) => p.tahun1 <= tahun && tahun <= p.tahun2)?.id
      const item = arsip.get(f.id) ?? { id: f.id, nama: f.nama, ukuran: f.ukuran, tanggal: f.tanggal, oleh: f.oleh, kegiatan: [], indikator: [], periode: [] }
      item.kegiatan.push(k)
      item.indikator = [...new Set([...item.indikator, ...indikator])].sort((a, b) => a.nomor - b.nomor)
      if (periodeId && !item.periode.includes(periodeId)) item.periode.push(periodeId)
      arsip.set(f.id, item)
    }
  }
  return [...arsip.values()].sort((a, b) => b.tanggal.localeCompare(a.tanggal))
}

export const formatUkuran = (byte) => `${(byte / 1024 / 1024).toFixed(1)} MB`

export const metaBerkas = (f) => `Ukuran: ${formatUkuran(f.ukuran)}  •  Diunggah: ${formatTanggal(f.tanggal)} oleh ${f.oleh}`

// Rekap LKE per indikator sebagai CSV (pemisah ";" agar langsung terbaca Excel berbahasa Indonesia)
export function lkeCsv(levels, bukti, berkas, namaKegiatan) {
  const sel = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const header = ['No', 'Domain', 'Indikator', 'Bobot (%)', 'Level Terverifikasi', 'Tingkat Kematangan', 'Jumlah Bukti Dukung', 'Kegiatan Tertaut', 'Catatan Verifikator']
  const rows = INDIKATOR.map((i) => {
    const daftar = Object.values(bukti).filter((b) => b.indikatorId === i.id)
    return [
      i.nomor,
      `Domain ${i.domainNomor} - ${i.domain.nama}`,
      i.nama,
      i.bobot,
      levels[i.id] ?? '',
      levels[i.id] ? LEVELS[levels[i.id] - 1] : 'Belum terverifikasi',
      jumlahBukti(bukti, berkas, i.id),
      daftar.map((b) => namaKegiatan[b.kegiatanId]).filter(Boolean).join(', '),
      daftar.map((b) => b.catatan).filter(Boolean).join(' | '),
    ]
  })
  return [header, ...rows].map((row) => row.map(sel).join(';')).join('\r\n')
}

// PIC kegiatan disimpan sebagai teks; cocokkan dengan nama atau username akun yang login
export const isPic = (kegiatan, user) => {
  const pic = kegiatan.pic?.trim().toLowerCase()
  return Boolean(pic) && [user.name, user.username].some((v) => v?.trim().toLowerCase() === pic)
}

// Samakan record bukti suatu kegiatan dengan daftar indikator dari form Rencana Kegiatan.
// Indikator baru → record draft; indikator yang dilepas dihapus hanya jika masih draft (bukti yang sudah diajukan tidak hilang)
export function sinkronPemetaan(bukti, kegiatanId, indikatorIds) {
  const next = Object.fromEntries(
    Object.entries(bukti).filter(([, b]) => b.kegiatanId !== kegiatanId || indikatorIds.includes(b.indikatorId) || b.status !== 'draft'),
  )
  for (const indikatorId of indikatorIds) {
    next[buktiKey(kegiatanId, indikatorId)] ??= { kegiatanId, indikatorId, status: 'draft', checked: {} }
  }
  return next
}

// ponytail: rencana kegiatan contoh untuk demo, dipakai store.js selama browser belum pernah menyimpan kegiatan;
// hapus saat data diambil dari API. [nama, OPD, indikator yang didukung]; bersama-sama mencakup ke-32 indikator.
const CONTOH_KEGIATAN = [
  ['Survei Kepuasan Masyarakat', 'DPMPTSP', ['i5', 'i18']],
  ['Pendataan Keluarga Penerima Manfaat', 'DINSOS', ['i9', 'i24']],
  ['Survei Harga Kebutuhan Pokok', 'DISDAGIN', ['i9', 'i7', 'i20']],
  ['Pemutakhiran Data Kependudukan', 'DISDUKCAPIL', ['i4', 'i6']],
  ['Survei Angkatan Kerja Daerah', 'DISNAKER', ['i23', 'i9']],
  ['Pendataan UMKM', 'DINKOPUKM', ['i9', 'i25']],
  ['Survei Kesehatan Ibu dan Anak', 'DINKES', ['i6', 'i19']],
  ['Pendataan Sekolah dan Siswa', 'DISDIK', ['i4', 'i22']],
  ['Survei Lalu Lintas Harian', 'DISHUB', ['i24', 'i10']],
  ['Pendataan Rumah Tidak Layak Huni', 'DISPERUMKIM', ['i9', 'i25']],
  ['Survei Wisatawan Nusantara', 'DISPARBUD', ['i5', 'i11']],
  ['Penyusunan Kota Bogor Dalam Angka', 'BAPPEDALITBANG', ['i30', 'i11', 'i20']],
  ['Forum Satu Data Kota Bogor', 'DISKOMINFO', ['i15', 'i32', 'i29']],
  ['Penyusunan Metadata Statistik Sektoral', 'DISKOMINFO', ['i2', 'i17']],
  ['Bimbingan Teknis Statistik untuk ASN', 'BKPSDM', ['i13', 'i28']],
  ['Survei Produksi Pertanian Perkotaan', 'DKPP', ['i9', 'i10']],
  ['Penyusunan Standar Data Sektoral', 'DISKOMINFO', ['i1', 'i16']],
  ['Integrasi Data Antar-OPD', 'DISKOMINFO', ['i3', 'i4']],
  ['Survei Pengelolaan Sampah Rumah Tangga', 'DLH', ['i9', 'i6']],
  ['Pengembangan Portal Satu Data', 'DISKOMINFO', ['i21', 'i26']],
  ['Pendataan Penyandang Disabilitas', 'DINSOS', ['i8', 'i9']],
  ['Evaluasi Rekomendasi Kegiatan Statistik', 'BAPPEDALITBANG', ['i31', 'i14']],
  ['Pemetaan Data Kebencanaan', 'BPBD', ['i3', 'i10']],
  ['Sosialisasi Kode Etik Statistisi', 'DISKOMINFO', ['i12', 'i27']],
]
const PIC_CONTOH = ['ani1234', 'Rina Kartika', 'ani1234', 'Dodi Pratama'] // separuh milik operator ani1234

// Jadwal disebar tiap 23 hari mulai ±9 bulan sebelum hariIni, jadi selalu ada yang selesai, berjalan, dan akan datang
export function contohKegiatan(hariIni) {
  const kegiatan = CONTOH_KEGIATAN.map(([nama, opd], n) => {
    const mulai = geserHari(hariIni, (n - 12) * 23)
    return {
      id: `contoh-${n + 1}`,
      nama: `${nama} ${mulai.slice(0, 4)}`,
      deskripsi: `Kegiatan statistik sektoral ${opd} Kota Bogor.`,
      opd,
      pic: PIC_CONTOH[n % PIC_CONTOH.length],
      tahun: mulai.slice(0, 4),
      mulai,
      selesai: geserHari(mulai, [14, 30, 7, 45, 21, 60][n % 6]),
      warna: n % WARNA.length,
    }
  })
  const bukti = CONTOH_KEGIATAN.reduce((semua, [, , indikator], n) => sinkronPemetaan(semua, `contoh-${n + 1}`, indikator), {})
  return { kegiatan, bukti }
}
