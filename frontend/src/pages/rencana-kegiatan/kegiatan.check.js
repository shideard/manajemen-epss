// Jalankan: node src/pages/rencana-kegiatan/kegiatan.check.js
import assert from 'node:assert/strict'
import { isOnDate, kartuKanban, levelTerpakai, matches, monthCells, urutkanKegiatan } from './kegiatan.js'

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
  { id: 'a', mulai: '2026-10-01', selesai: '2026-10-10', indikatorIds: [], jumlahBerkas: 0 }, // belum mulai
  { id: 'b', mulai: '2026-09-01', selesai: '2026-09-30', indikatorIds: ['i4'], jumlahBerkas: 0 }, // berjalan, tanpa berkas, belum ada record bukti
  { id: 'c', mulai: '2026-09-05', selesai: '2026-09-30', indikatorIds: ['i1', 'i2'], jumlahBerkas: 2 }, // ada berkas
  { id: 'd', mulai: '2026-08-01', selesai: '2026-08-30', indikatorIds: ['i3'], jumlahBerkas: 1 }, // semua terverifikasi
]
const bukti = {
  'c:i1': { kegiatanId: 'c', indikatorId: 'i1', status: 'menunggu', catatan: 'Lengkapi SK' },
  'c:i2': { kegiatanId: 'c', indikatorId: 'i2', status: 'draft' },
  'd:i3': { kegiatanId: 'd', indikatorId: 'i3', status: 'terverifikasi' },
}
const kolom = kartuKanban(daftar, bukti, '2026-09-15')
assert.deepEqual(
  Object.fromEntries(Object.entries(kolom).map(([s, list]) => [s, list.map((x) => x.kegiatan.id)])),
  { 'Belum dilaksanakan': ['a'], 'Sedang dilaksanakan': ['b'], 'Bukti dukung diunggah': ['c'], Terverifikasi: ['d'] },
)
assert.deepEqual(kolom['Bukti dukung diunggah'][0], { kegiatan: daftar[2], indikatorIds: ['i1', 'i2'], diajukan: 1, lampiran: 2, catatan: 1 })
assert.deepEqual(kolom['Sedang dilaksanakan'][0].indikatorIds, ['i4'])

// Level yang dipakai kegiatan lain; kegiatan yang sedang diedit tidak dihitung
const pemetaan = [
  { id: 'a', nama: 'A', indikator: [{ id: 'i1', level: 1 }, { id: 'i2' }] },
  { id: 'b', nama: 'B', indikator: [{ id: 'i1', level: 2 }] },
  { id: 'c', nama: 'C' },
]
assert.deepEqual(levelTerpakai(pemetaan, 'b'), { i1: { 1: 'A' }, i2: { 1: 'A' } })
assert.deepEqual(levelTerpakai(pemetaan), { i1: { 1: 'A', 2: 'B' }, i2: { 1: 'A' } })

// Sort the whole result before pagination, keeping the source order untouched.
const untukUrutan = [
  { id: 'a', nama: 'Zebra', opd: 'Dinas B', mulai: '2026-08-01', selesai: '2026-08-31' },
  { id: 'b', nama: 'Survei 10', opd: 'Dinas A', mulai: '2026-09-01', selesai: '2026-09-20' },
  { id: 'c', nama: 'Survei 2', opd: 'Dinas C', mulai: '2026-10-01', selesai: '2026-10-31' },
  { id: 'd', nama: 'Beta', opd: 'Dinas B', mulai: '2026-09-02', selesai: '2026-09-30' },
  { id: 'e', nama: 'Gamma', opd: 'Dinas C', mulai: '2026-11-01', selesai: '2026-11-30' },
  { id: 'f', nama: 'Alpha', opd: 'Dinas A', mulai: '2026-07-01', selesai: '2026-07-31' },
]
const ids = (urutan) => urutkanKegiatan(untukUrutan, urutan, '2026-09-15').map((item) => item.id)
assert.deepEqual(ids('status'), ['b', 'd', 'c', 'e', 'f', 'a'])
assert.deepEqual(ids('nama'), ['f', 'd', 'e', 'c', 'b', 'a'])
assert.deepEqual(ids('opd'), ['f', 'b', 'a', 'd', 'c', 'e'])
assert.deepEqual(ids('mulai'), ['f', 'a', 'b', 'd', 'c', 'e'])
assert.deepEqual(ids('mulai-desc'), ['e', 'c', 'd', 'b', 'a', 'f'])
assert.deepEqual(ids('selesai'), ['f', 'a', 'b', 'd', 'c', 'e'])
assert.deepEqual(ids('selesai-desc'), ['e', 'c', 'd', 'b', 'a', 'f'])
assert.deepEqual(urutkanKegiatan(untukUrutan, 'nama').slice(0, 5).map((item) => item.id), ['f', 'd', 'e', 'c', 'b'])
assert.deepEqual(untukUrutan.map((item) => item.id), ['a', 'b', 'c', 'd', 'e', 'f'])
assert.deepEqual(urutkanKegiatan([], 'nama'), [])
assert.deepEqual(urutkanKegiatan([
  { ...untukUrutan[0], id: 'z' }, untukUrutan[0],
], 'nama').map((item) => item.id), ['a', 'z'])

console.log('kegiatan.check: OK')
