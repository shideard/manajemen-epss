// Logika murni rencana kegiatan (tanpa React), dicek oleh kegiatan.check.js

export const isOnDate = (kegiatan, date) => kegiatan.mulai <= date && date <= kegiatan.selesai

export function matches(kegiatan, query) {
  const q = query.trim().toLowerCase()
  return !q || [kegiatan.nama, kegiatan.deskripsi, kegiatan.opd, kegiatan.pic].some((v) => v?.toLowerCase().includes(q))
}

// Isi grid kalender (minggu dimulai hari Minggu); null = kotak di luar bulan
export function monthCells(year, month) {
  const leading = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(leading).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  return [...cells, ...Array((7 - (cells.length % 7)) % 7).fill(null)]
}
