// Jalankan: node src/pages/rencana-kegiatan/kegiatan.check.js
import assert from 'node:assert/strict'
import { isOnDate, kartuKanban, matches, monthCells } from './kegiatan.js'

const k = { nama: 'Survei SKM', deskripsi: 'Kepuasan warga', opd: 'DINSOS', pic: 'Deshi', mulai: '2026-09-10', selesai: '2026-09-20' }

assert.ok(isOnDate(k, '2026-09-15'))
assert.ok(!isOnDate(k, '2026-10-01'))

assert.ok(matches(k, '  dinsos '))
assert.ok(matches(k, ''))
assert.ok(!matches(k, 'bappeda'))

// September 2026 dimulai hari Selasa: 2 kotak kosong + 30 hari + 3 kotak kosong = 5 minggu
const sept = monthCells(2026, 8)
assert.equal(sept.length, 35)
assert.deepEqual(sept.slice(0, 3), [null, null, 1])
assert.equal(sept[31], 30)

// Kanban: kolom otomatis dari jadwal + bukti, progres per indikator yang dipetakan
const daftar = [
  { id: 'a', mulai: '2026-10-01', selesai: '2026-10-10' }, // belum mulai
  { id: 'b', mulai: '2026-09-01', selesai: '2026-09-30' }, // berjalan, tanpa berkas
  { id: 'c', mulai: '2026-09-05', selesai: '2026-09-30' }, // ada berkas
  { id: 'd', mulai: '2026-08-01', selesai: '2026-08-30' }, // semua terverifikasi
]
const bukti = {
  'c:i1': { kegiatanId: 'c', indikatorId: 'i1', status: 'menunggu', catatan: 'Lengkapi SK' },
  'c:i2': { kegiatanId: 'c', indikatorId: 'i2', status: 'draft' },
  'd:i3': { kegiatanId: 'd', indikatorId: 'i3', status: 'terverifikasi' },
}
const kolom = kartuKanban(daftar, bukti, { c: [{}, {}], d: [{}] }, '2026-09-15')
assert.deepEqual(
  Object.fromEntries(Object.entries(kolom).map(([s, list]) => [s, list.map((x) => x.kegiatan.id)])),
  { 'Belum dilaksanakan': ['a'], 'Sedang dilaksanakan': ['b'], 'Bukti dukung diunggah': ['c'], Terverifikasi: ['d'] },
)
assert.deepEqual(kolom['Bukti dukung diunggah'][0], { kegiatan: daftar[2], indikatorIds: ['i1', 'i2'], diajukan: 1, lampiran: 2, catatan: 1 })

console.log('kegiatan.check: OK')
