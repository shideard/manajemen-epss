// Jalankan: node src/lib/epss.check.js
import assert from 'node:assert/strict'
import { geserHari, hitungIps, INDIKATOR, levelTerpenuhi, notifikasi, paginate, predikat, selisihHari, statusKegiatan, validasiPeriode, lkeCsv, isPic, sinkronPemetaan } from './epss.js'

const dua = [
  { id: 'a', bobot: 1 },
  { id: 'b', bobot: 3 },
]
assert.equal(hitungIps(dua, {}), 1) // belum diverifikasi = level 1
assert.equal(hitungIps(dua, { a: 5, b: 3 }), 3.5)
assert.equal(hitungIps([], {}), 0)

assert.equal(predikat(1.79), 'Kurang')
assert.equal(predikat(2.42), 'Cukup')
assert.equal(predikat(2.74), 'Baik')
assert.equal(predikat(3.5), 'Sangat Baik')
assert.equal(predikat(4.2), 'Memuaskan')

// Berjenjang: level 3 lengkap tapi level 2 belum → tetap level 1
const { levels } = INDIKATOR[0]
const centang = (level) => levels[level - 1].syarat.map(() => true)
assert.equal(levelTerpenuhi(levels, {}), 0)
assert.equal(levelTerpenuhi(levels, { 1: centang(1), 3: centang(3) }), 1)
assert.equal(levelTerpenuhi(levels, { 1: centang(1), 2: centang(2) }), 2)
assert.equal(levelTerpenuhi(levels, { 1: centang(1), 2: [true, false] }), 1)

const k = { id: 'k1', mulai: '2026-09-10', selesai: '2026-09-20' }
assert.equal(statusKegiatan(k, [], 0, '2026-09-01'), 'Belum dilaksanakan')
assert.equal(statusKegiatan(k, [], 0, '2026-09-15'), 'Sedang dilaksanakan')
assert.equal(statusKegiatan(k, [{ status: 'menunggu' }], 2, '2026-09-15'), 'Bukti dukung diunggah')
assert.equal(statusKegiatan(k, [{ status: 'terverifikasi' }], 2, '2026-09-15'), 'Terverifikasi')

assert.equal(geserHari('2026-03-01', -1), '2026-02-28')
assert.equal(selisihHari('2026-09-10', '2026-09-20'), 10)

// Pengingat H-7 & H-1: tanggal 5 baru H-7; tanggal 12 H-1 menggantikan H-7; setelah selesai tidak muncul lagi
assert.deepEqual(notifikasi([k], [1, 7], '2026-09-05').map((n) => n.id), ['k1:7'])
assert.deepEqual(notifikasi([k], [1, 7], '2026-09-12').map((n) => n.id), ['k1:1'])
assert.deepEqual(notifikasi([k, { id: 'k2', mulai: '2026-09-30', selesai: '2026-10-01' }], [1, 30], '2026-09-12').map((n) => n.id), ['k1:1', 'k2:30'])
assert.deepEqual(notifikasi([k], [1, 7], '2026-09-21'), [])

assert.deepEqual(paginate([1, 2, 3, 4, 5, 6], 2, 5), { rows: [6], page: 2, pageCount: 2 })
assert.deepEqual(paginate([], 3, 5), { rows: [], page: 1, pageCount: 1 })

const form = { nama: ' Siklus 2027 ', tahun1: '2027', tahun2: '2028', batas: '2028-05-30', target: '3.5' }
assert.deepEqual(validasiPeriode(form).data, { nama: 'Siklus 2027', tahun1: '2027', tahun2: '2028', batas: '2028-05-30', target: 3.5 })
assert.ok(validasiPeriode({ ...form, tahun2: '2029' }).error)
assert.ok(validasiPeriode({ ...form, target: '5.5' }).error)
assert.ok(validasiPeriode({ ...form, target: '' }).error)

const csv = lkeCsv({ i1: 2 }, { 'k1:i1': { kegiatanId: 'k1', indikatorId: 'i1', catatan: 'Lengkapi "SK"' } }, { k1: [{}, {}] }, { k1: 'Survei; SKM' }).split('\r\n')
assert.equal(csv.length, INDIKATOR.length + 1)
assert.equal(csv[1], '"1";"Domain 1 - Prinsip Satu Data Indonesia (SDI)";"Penerapan Standar Data Statistik";"3.5";"2";"Terkelola";"2";"Survei; SKM";"Lengkapi ""SK"""')

console.log('epss.check: OK')

// Hak akses PIC: cocok dengan nama atau username, tidak peka huruf besar/spasi
assert.ok(isPic({ pic: ' Ani ' }, { name: 'ani', username: 'ani1234' }))
assert.ok(isPic({ pic: 'ani1234' }, { name: 'Ani', username: 'ani1234' }))
assert.ok(!isPic({ pic: 'Budi' }, { name: 'Ani', username: 'ani1234' }))
assert.ok(!isPic({ pic: '' }, { name: '', username: undefined }))

// Pemetaan: tambah i2, lepas i1 (draft → hapus) dan i3 (menunggu → tetap), kegiatan lain tidak tersentuh
const awal = {
  'k1:i1': { kegiatanId: 'k1', indikatorId: 'i1', status: 'draft' },
  'k1:i3': { kegiatanId: 'k1', indikatorId: 'i3', status: 'menunggu' },
  'k2:i1': { kegiatanId: 'k2', indikatorId: 'i1', status: 'draft' },
}
const hasil = sinkronPemetaan(awal, 'k1', ['i2'])
assert.deepEqual(Object.keys(hasil).sort(), ['k1:i2', 'k1:i3', 'k2:i1'])
assert.equal(hasil['k1:i2'].status, 'draft')
assert.equal(sinkronPemetaan(awal, 'k1', ['i1', 'i3'])['k1:i1'], awal['k1:i1']) // yang sudah ada tidak di-reset

console.log('epss.check (akses): OK')
