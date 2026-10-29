// Jalankan: node src/pages/rencana-kegiatan/kegiatan.check.js
import assert from 'node:assert/strict'
import { isOnDate, matches, monthCells } from './kegiatan.js'

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

console.log('kegiatan.check: OK')
