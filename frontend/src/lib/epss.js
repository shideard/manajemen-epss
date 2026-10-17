// Data referensi & logika murni EPSS (tanpa React), dicek oleh epss.check.js
import { toISODate } from '../pages/rencana-kegiatan/kegiatan.js'

// Key localStorage untuk useStore
export const KEYS = {
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

// ponytail: subset indikator contoh dengan bobot sementara; ganti dengan 38 indikator & bobot resmi
// Peraturan BPS No 3/2022 dari seed/API backend
export const DOMAINS = [
  {
    id: 'd1',
    nama: 'Prinsip Satu Data Indonesia (SDI)',
    indikator: [
      {
        id: 'i1',
        nama: 'Penerapan Standar Data Statistik',
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
      { id: 'i2', nama: 'Penerapan Metadata Statistik', bobot: 3.5 },
      { id: 'i3', nama: 'Penerapan Interoperabilitas Data', bobot: 4 },
      { id: 'i4', nama: 'Penerapan Kode Referensi dan/atau Data Induk', bobot: 4 },
    ],
  },
  {
    id: 'd2',
    nama: 'Kualitas Data',
    indikator: [
      { id: 'i5', nama: 'Relevansi Data terhadap Pengguna', bobot: 4 },
      { id: 'i6', nama: 'Akurasi Data', bobot: 4 },
      { id: 'i7', nama: 'Aktualitas dan Ketepatan Waktu', bobot: 3 },
    ],
  },
  {
    id: 'd3',
    nama: 'Proses Bisnis Statistik',
    indikator: [
      { id: 'i8', nama: 'Perencanaan Kebutuhan Data', bobot: 5 },
      { id: 'i9', nama: 'Pengumpulan Data Statistik Sektoral', bobot: 6 },
      { id: 'i10', nama: 'Pengolahan dan Analisis Data', bobot: 5 },
      { id: 'i11', nama: 'Diseminasi Data', bobot: 4 },
    ],
  },
  {
    id: 'd4',
    nama: 'Kelembagaan',
    indikator: [
      { id: 'i12', nama: 'Profesionalitas', bobot: 4 },
      { id: 'i13', nama: 'Kompetensi Sumber Daya Manusia', bobot: 4 },
    ],
  },
  {
    id: 'd5',
    nama: 'Statistik Nasional',
    indikator: [
      { id: 'i14', nama: 'Tata Kelola Statistik Sektoral', bobot: 4 },
      { id: 'i15', nama: 'Kolaborasi Penyelenggaraan Statistik', bobot: 3 },
    ],
  },
]

// Daftar datar indikator dengan nomor urut & domain-nya
export const INDIKATOR = DOMAINS.flatMap((domain, d) =>
  domain.indikator.map((indikator) => ({ ...indikator, levels: indikator.levels ?? DEFAULT_LEVELS, domain, domainNomor: d + 1 })),
).map((indikator, i) => ({ ...indikator, nomor: i + 1 }))

export const indikatorById = Object.fromEntries(INDIKATOR.map((i) => [i.id, i]))
export const bobotDomain = (domain) => domain.indikator.reduce((sum, i) => sum + i.bobot, 0)

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
export function predikat(ips) {
  if (ips >= 4.2) return 'Memuaskan'
  if (ips >= 3.5) return 'Sangat Baik'
  if (ips >= 2.6) return 'Baik'
  if (ips >= 1.8) return 'Cukup'
  return 'Kurang'
}

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

export const formatTanggal = (iso, month = 'long') =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month, year: 'numeric' }) : '-'

export const includesText = (values, query) => {
  const q = query.trim().toLowerCase()
  return !q || values.some((v) => String(v ?? '').toLowerCase().includes(q))
}

// Data form periode (hasil Object.fromEntries(FormData)) → { data } atau { error }
export function validasiPeriode(form) {
  const target = Number(form.target)
  if (Number(form.tahun2) !== Number(form.tahun1) + 1) return { error: 'Tahun kedua harus satu tahun setelah tahun pertama (siklus 2 tahunan).' }
  if (!(target >= 1 && target <= 5)) return { error: 'Target skor harus antara 1.00 dan 5.00.' }
  return { data: { nama: form.nama.trim(), tahun1: form.tahun1, tahun2: form.tahun2, batas: form.batas, target } }
}

export const PREDIKAT_TONE = { Kurang: 'red', Cukup: 'blue', Baik: 'green', 'Sangat Baik': 'green', Memuaskan: 'green' }

// Jumlah berkas dari semua kegiatan yang dipetakan ke indikator ini
export const jumlahBukti = (bukti, berkas, indikatorId) =>
  Object.values(bukti)
    .filter((b) => b.indikatorId === indikatorId)
    .reduce((total, b) => total + (berkas[b.kegiatanId]?.length ?? 0), 0)

export const metaBerkas = (f) => `Ukuran: ${(f.ukuran / 1024 / 1024).toFixed(1)} MB  •  Diunggah: ${formatTanggal(f.tanggal)} oleh ${f.oleh}`

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
