// Logika murni rencana kegiatan (tanpa React), dicek oleh kegiatan.check.js
import { statusKegiatan } from '../../lib/epss.js'

// Kolom kanban, urut sesuai alur; key = hasil statusKegiatan
export const KOLOM_KANBAN = ['Belum dilaksanakan', 'Sedang dilaksanakan', 'Bukti dukung diunggah', 'Terverifikasi']

// Kanban otomatis: kolom tiap kegiatan diturunkan dari jadwal + bukti, tidak dipindah manual.
// Progres per indikator: dari indikator yang dipetakan ke kegiatan (k.indikatorIds), berapa yang buktinya sudah diajukan.
// k.jumlahBerkas = berkas di server; bukti = status per 'kegiatanId:indikatorId' (belum ada = draft)
export function kartuKanban(kegiatan, bukti, today) {
  const kolom = Object.fromEntries(KOLOM_KANBAN.map((status) => [status, []]))
  for (const k of kegiatan) {
    const milik = k.indikatorIds.map((id) => bukti[`${k.id}:${id}`] ?? { kegiatanId: k.id, indikatorId: id, status: 'draft' })
    const lampiran = k.jumlahBerkas
    kolom[statusKegiatan(k, milik, lampiran, today)].push({
      kegiatan: k,
      indikatorIds: k.indikatorIds,
      diajukan: milik.filter((b) => b.status !== 'draft').length,
      lampiran,
      catatan: milik.filter((b) => b.catatan).length,
    })
  }
  for (const list of Object.values(kolom)) list.sort((a, b) => a.kegiatan.mulai.localeCompare(b.kegiatan.mulai))
  return kolom
}

// Satu level indikator hanya boleh dipenuhi satu kegiatan per periode (server yang menegakkan).
// Hasil: { indikatorId: { level: nama kegiatan pemakainya } } dari kegiatan lain selain kecualiId
export function levelTerpakai(kegiatan, kecualiId) {
  const hasil = {}
  for (const k of kegiatan) {
    if (k.id === kecualiId) continue
    for (const i of k.indikator ?? []) (hasil[i.id] ??= {})[i.level ?? 1] = k.nama
  }
  return hasil
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
