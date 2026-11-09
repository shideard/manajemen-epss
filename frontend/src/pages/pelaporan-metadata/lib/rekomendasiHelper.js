import { AI_PREDICTION_PRESETS, MIN_JUDUL_REKOMENDASI } from '../metadataData'

/**
 * Cek apakah judul kegiatan sudah cukup panjang untuk memunculkan rekomendasi.
 * Rekomendasi sengaja tidak muncul saat form masih kosong agar pengguna
 * mengisi judul lebih dahulu dan sistem punya konteks.
 */
export function judulSiap(judulKegiatan) {
  return (judulKegiatan || '').trim().length >= MIN_JUDUL_REKOMENDASI
}

/**
 * Cari preset historis yang kata kuncinya cocok dengan judul kegiatan.
 * Mengembalikan `null` bila tidak ada yang cocok (tidak ada fallback ke
 * preset pertama, supaya rekomendasi tidak menyesatkan).
 */
export function cariRekomendasi(judulKegiatan, presets = AI_PREDICTION_PRESETS) {
  const judul = (judulKegiatan || '').toLowerCase()
  if (!judulSiap(judulKegiatan)) return null

  for (const preset of presets) {
    const cocok = preset.keywordMatch.filter((k) => judul.includes(k))
    if (cocok.length > 0) {
      return { preset, keywordCocok: cocok }
    }
  }
  return null
}

/**
 * Ambil nilai rekomendasi untuk sekumpulan field dalam satu blok.
 * Hanya mengembalikan field yang memang punya rekomendasi dan nilainya
 * belum sama dengan isian saat ini. Nilai TIDAK pernah ditulis ke form
 * dari sini; pemanggil hanya menampilkannya.
 */
export function rekomendasiUntukBlok(rekomendasi, ambilNilai, nilaiSaatIni) {
  if (!rekomendasi) return []

  return Object.entries(ambilNilai(rekomendasi.preset.predictions))
    .filter(([key, nilai]) => {
      if (nilai === undefined || nilai === null) return false
      return !samaDengan(nilai, nilaiSaatIni(key))
    })
    .map(([key, nilai]) => ({ fieldKey: key, nilai }))
}

function samaDengan(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Ubah nilai rekomendasi menjadi teks yang ramah dibaca untuk ditampilkan
 * di panel (array digabung koma, objek Ya/Tidak dijadikan daftar).
 */
export function formatNilaiRekomendasi(nilai, labelMap = {}) {
  if (nilai === undefined || nilai === null || nilai === '') return '-'
  if (Array.isArray(nilai)) return nilai.length > 0 ? nilai.join(', ') : '-'
  if (typeof nilai === 'object') {
    return Object.entries(nilai)
      .map(([key, val]) => `${labelMap[key] || key}: ${val}`)
      .join(', ')
  }
  return String(nilai)
}
