// Jalankan: node src/pages/rencana-kegiatan/kegiatan.check.js
import assert from 'node:assert/strict'
import { agendaTerdekat, isOnDate, matches, monthCells, statusOf } from './kegiatan.js'

const k = { nama: 'Survei SKM', deskripsi: 'Kepuasan warga', opd: 'DINSOS', pic: 'Deshi', mulai: '2026-09-10', selesai: '2026-09-20' }

assert.equal(statusOf(k, '2026-09-09'), 'Belum Mulai')
assert.equal(statusOf(k, '2026-09-10'), 'Berjalan')
assert.equal(statusOf(k, '2026-09-20'), 'Berjalan')
assert.equal(statusOf(k, '2026-09-21'), 'Selesai')

assert.ok(isOnDate(k, '2026-09-15'))
assert.ok(!isOnDate(k, '2026-10-01'))

assert.ok(matches(k, '  dinsos '))
assert.ok(matches(k, ''))
assert.ok(!matches(k, 'bappeda'))

const lama = { ...k, mulai: '2026-01-01', selesai: '2026-01-31' }
const nanti = { ...k, mulai: '2026-12-01', selesai: '2026-12-05' }
assert.deepEqual(agendaTerdekat([nanti, lama, k], '2026-09-15'), [k, nanti])

// September 2026 dimulai hari Selasa: 2 kotak kosong + 30 hari + 3 kotak kosong = 5 minggu
const sept = monthCells(2026, 8)
assert.equal(sept.length, 35)
assert.deepEqual(sept.slice(0, 3), [null, null, 1])
assert.equal(sept[31], 30)

console.log('kegiatan.check: OK')
