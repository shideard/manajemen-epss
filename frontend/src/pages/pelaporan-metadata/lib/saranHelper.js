import { TABEL_SARAN } from '../data/tabelSaran'

// Nilai "Cara Pengumpulan Data" pada Step Halaman Awal -> kunci pada TABEL_SARAN.
// Sensus dan Cara Lain Sesuai Perkembangan TI tidak punya data historis,
// sehingga saran sengaja tidak ditampilkan (helper mengembalikan null).
const PETA_CARA = {
  'Kompilasi Produk Administrasi': 'Kompilasi',
  Survei: 'Survei',
}

/**
 * Ambil saran untuk satu field pada cara pengumpulan tertentu.
 * @returns {Array<{opsi: string, k: number, n: number, opd: number}>|null}
 *   null bila cara pengumpulan tidak dikenal, field tidak punya saran,
 *   atau data historisnya di bawah threshold.
 */
export function getSaran(fieldKey, caraPengumpulan) {
  const cara = PETA_CARA[caraPengumpulan]
  if (!cara) return null

  const kolom = TABEL_SARAN[fieldKey]
  if (!kolom) return null

  const isi = kolom[cara]
  if (!isi) return null

  const daftar = Array.isArray(isi) ? isi : [isi]

  return daftar
    .map((s) =>
      kolom.jenis === 'centang'
        ? { opsi: s.opsi, k: s.k, n: s.n, opd: s.opd }
        : { opsi: s.modus, k: s.k, n: s.n, opd: s.opd },
    )
    .filter((s) => Boolean(s.opsi))
}

/**
 * Ambil detail saran hanya bila `opsi` (label opsi pada UI) merupakan modus.
 * @returns {{k: number, n: number, opd: number}|null}
 */
export function getSaranUntukOpsi(fieldKey, caraPengumpulan, opsi) {
  const daftar = getSaran(fieldKey, caraPengumpulan)
  if (!daftar) return null

  const cocok = daftar.find((s) => s.opsi === opsi)
  if (!cocok) return null

  return { k: cocok.k, n: cocok.n, opd: cocok.opd }
}

/** Label cara pengumpulan untuk teks saran, mis. "kegiatan kompilasi". */
export function labelCara(caraPengumpulan) {
  return PETA_CARA[caraPengumpulan] === 'Kompilasi' ? 'kegiatan kompilasi' : 'kegiatan survei'
}

/** Contoh: "31 dari 31 kegiatan kompilasi". */
export function formatSaran(saran, caraPengumpulan) {
  if (!saran) return ''
  return `${saran.k} dari ${saran.n} ${labelCara(caraPengumpulan)}`
}

/** Contoh: "31/31 kegiatan · 26 OPD · 100%". Dipakai sebagai tooltip pill. */
export function formatDetailSaran(saran) {
  if (!saran) return ''
  const pangsa = saran.n > 0 ? Math.round((saran.k / saran.n) * 100) : 0
  return `${saran.k}/${saran.n} kegiatan · ${saran.opd} OPD · ${pangsa}%`
}
