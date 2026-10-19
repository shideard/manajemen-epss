// Logika murni rencana kegiatan (tanpa React), dicek oleh kegiatan.check.js

// ponytail: data disimpan di localStorage browser; pindahkan ke API Laravel saat backend rencana kegiatan siap
export const STORAGE_KEY = 'epss.rencana-kegiatan'

// Warna bar kalender & ikon agenda, urutannya sama dengan ikon calendar-2-fill-{1..4}.svg
export const WARNA = ['#b57fd4', '#d47f81', '#7fa7d4', '#eef281']

// Tanggal lokal 'YYYY-MM-DD' (format sv-SE = ISO); string ISO aman dibandingkan dengan < dan >
export const toISODate = (date) => date.toLocaleDateString('sv-SE')

export function statusOf(kegiatan, today = toISODate(new Date())) {
  if (today < kegiatan.mulai) return 'Belum Mulai'
  if (today > kegiatan.selesai) return 'Selesai'
  return 'Berjalan'
}

export const isOnDate = (kegiatan, date) => kegiatan.mulai <= date && date <= kegiatan.selesai

export function matches(kegiatan, query) {
  const q = query.trim().toLowerCase()
  return !q || [kegiatan.nama, kegiatan.deskripsi, kegiatan.opd, kegiatan.pic].some((v) => v?.toLowerCase().includes(q))
}

// Kegiatan yang belum selesai, diurutkan dari yang paling dekat mulainya
export function agendaTerdekat(list, today, limit = 4) {
  return list
    .filter((k) => k.selesai >= today)
    .sort((a, b) => a.mulai.localeCompare(b.mulai))
    .slice(0, limit)
}

// Isi grid kalender (minggu dimulai hari Minggu); null = kotak di luar bulan
export function monthCells(year, month) {
  const leading = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(leading).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  return [...cells, ...Array((7 - (cells.length % 7)) % 7).fill(null)]
}
