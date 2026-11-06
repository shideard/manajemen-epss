// Logika murni rencana kegiatan (tanpa React), dicek oleh kegiatan.check.js
import { statusKegiatan } from '../../lib/epss.js'

// Kolom kanban, urut sesuai alur; key = hasil statusKegiatan
export const KOLOM_KANBAN = ['Belum dilaksanakan', 'Sedang dilaksanakan', 'Bukti dukung diunggah', 'Terverifikasi']

// Kanban otomatis: kolom tiap kegiatan diturunkan dari jadwal + bukti, tidak dipindah manual.
// Progres per indikator: dari indikator yang dipetakan ke kegiatan, berapa yang buktinya sudah diajukan.
export function kartuKanban(kegiatan, bukti, berkas, today) {
  const kolom = Object.fromEntries(KOLOM_KANBAN.map((status) => [status, []]))
  for (const k of kegiatan) {
    const milik = Object.values(bukti).filter((b) => b.kegiatanId === k.id)
    const lampiran = berkas[k.id]?.length ?? 0
    kolom[statusKegiatan(k, milik, lampiran, today)].push({
      kegiatan: k,
      indikatorIds: milik.map((b) => b.indikatorId),
      diajukan: milik.filter((b) => b.status !== 'draft').length,
      lampiran,
      catatan: milik.filter((b) => b.catatan).length,
    })
  }
  for (const list of Object.values(kolom)) list.sort((a, b) => a.kegiatan.mulai.localeCompare(b.kegiatan.mulai))
  return kolom
}

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
