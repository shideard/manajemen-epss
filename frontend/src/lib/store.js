import { useCallback, useSyncExternalStore } from 'react'
import {
  cariAkun,
  contohKegiatan,
  DEMO_PASSWORD,
  EMPTY_LIST,
  EMPTY_OBJECT,
  hitungIps,
  INDIKATOR,
  KEYS,
  notifikasi,
  SEED_PENGINGAT,
  SEED_PERIODE,
  SEED_USERS,
  sinkronPemetaan,
  toISODate,
  WARNA,
} from './epss'

// State yang disimpan di localStorage dan tersinkron antar komponen yang memakai key yang sama
// (mis. notifikasi dibaca di halaman Notifikasi → titik merah di topbar ikut hilang).
// ponytail: data hanya ada di browser ini; ganti dengan API Laravel saat endpoint-nya siap
const cache = new Map()
const listeners = new Map()

// Data contoh untuk key yang belum pernah disimpan di browser ini; menang atas seed dari pemanggil
// supaya semua halaman yang membaca kegiatan/bukti melihat data yang sama. Daftar yang sengaja dikosongkan ([]) tetap kosong.
const contoh = contohKegiatan(toISODate(new Date()))
const DATA_CONTOH = { [KEYS.kegiatan]: contoh.kegiatan, [KEYS.bukti]: contoh.bukti }

function read(key, seed) {
  if (!cache.has(key)) {
    let value
    try {
      value = JSON.parse(localStorage.getItem(key))
    } catch {
      value = null
    }
    cache.set(key, value ?? DATA_CONTOH[key] ?? seed)
  }
  return cache.get(key)
}

// seed harus konstanta (bukan objek baru tiap render)
function useStore(key, seed) {
  const subscribe = useCallback(
    (listener) => {
      if (!listeners.has(key)) listeners.set(key, new Set())
      listeners.get(key).add(listener)
      return () => listeners.get(key).delete(listener)
    },
    [key],
  )
  const value = useSyncExternalStore(subscribe, () => read(key, seed))

  const set = useCallback(
    (next) => {
      const value = typeof next === 'function' ? next(read(key, seed)) : next
      cache.set(key, value)
      localStorage.setItem(key, JSON.stringify(value))
      listeners.get(key)?.forEach((listener) => listener())
    },
    [key, seed],
  )

  return [value, set]
}

// Lapisan data per resource: halaman hanya memakai hook di bawah, tidak tahu soal KEYS/localStorage,
// jadi saat endpoint Laravel siap yang diganti hanya isi hook-nya. Tiap hook mengembalikan { loading, error }
// (tampilkan dengan <Memuat dari={[...]} />) dan datanya selalu terisi, paling tidak kosong, selama loading.
// Aturan yang menyentuh beberapa resource sekaligus (mis. hapus kegiatan → bukti & berkasnya) ada di sini, bukan di halaman.
// ponytail: localStorage sinkron, jadi loading selalu false dan error selalu null; aksi akan mengembalikan Promise saat pindah ke API
const SIAP = { loading: false, error: null }

export function useKegiatan() {
  const [kegiatan, setKegiatan] = useStore(KEYS.kegiatan, EMPTY_LIST)
  const [, setBukti] = useStore(KEYS.bukti, EMPTY_OBJECT)
  const [, setBerkas] = useStore(KEYS.berkas, EMPTY_OBJECT)
  return {
    kegiatan,
    ...SIAP,
    // id kosong = kegiatan baru; indikator = id indikator yang didukung, pemetaannya disinkronkan ke bukti
    simpan(id, { indikator, ...data }) {
      const kegiatanId = id ?? crypto.randomUUID()
      setKegiatan((list) =>
        id ? list.map((k) => (k.id === id ? { ...k, ...data } : k)) : [...list, { ...data, id: kegiatanId, warna: list.length % WARNA.length }],
      )
      setBukti((all) => sinkronPemetaan(all, kegiatanId, indikator))
      return kegiatanId
    },
    hapus(id) {
      setKegiatan((list) => list.filter((k) => k.id !== id))
      setBukti((all) => Object.fromEntries(Object.entries(all).filter(([, b]) => b.kegiatanId !== id)))
      setBerkas((all) => Object.fromEntries(Object.entries(all).filter(([kegiatanId]) => kegiatanId !== id)))
    },
  }
}

// bukti = { 'kegiatanId:indikatorId': { kegiatanId, indikatorId, checked, status, level, catatan, ... } }
export function useBukti() {
  const [bukti, setBukti] = useStore(KEYS.bukti, EMPTY_OBJECT)
  return {
    bukti,
    ...SIAP,
    ubah: (key, perubahan) => setBukti((all) => ({ ...all, [key]: { ...all[key], ...perubahan } })),
  }
}

// Isi berkas yang diunggah di sesi ini (id berkas → object URL) untuk pratinjau.
// ponytail: isi berkas tidak tersimpan setelah reload; simpan ke storage backend saat API unggah siap
export const berkasUrl = new Map()

// berkas = { kegiatanId: [{ id, nama, ukuran, tanggal, oleh, periodeId }] }
// Berkas yang sama (id sama) boleh ada di beberapa kegiatan: ditautkan dari Repositori, bukan diunggah ulang.
// periodeId = periode saat berkas diunggah/ditautkan ke kegiatan itu (folder di Repositori)
export function useBerkas() {
  const [berkas, setBerkas] = useStore(KEYS.berkas, EMPTY_OBJECT)
  return {
    berkas,
    ...SIAP,
    unggah(kegiatanId, files, oleh, periodeId) {
      const baru = [...files].map((file) => {
        const id = crypto.randomUUID()
        berkasUrl.set(id, URL.createObjectURL(file))
        return { id, nama: file.name, ukuran: file.size, tanggal: toISODate(new Date()), oleh, periodeId }
      })
      setBerkas((all) => ({ ...all, [kegiatanId]: [...(all[kegiatanId] ?? []), ...baru] }))
    },
    kaitkan(kegiatanId, { id, nama, ukuran, tanggal, oleh }, periodeId) {
      setBerkas((all) =>
        (all[kegiatanId] ?? []).some((f) => f.id === id)
          ? all
          : { ...all, [kegiatanId]: [...(all[kegiatanId] ?? []), { id, nama, ukuran, tanggal, oleh, periodeId }] },
      )
    },
    hapus(kegiatanId, berkasId) {
      // Masih ditautkan ke kegiatan lain → pratinjaunya tetap dipakai di sana
      const dipakaiLagi = Object.entries(berkas).some(([id, list]) => id !== kegiatanId && list.some((f) => f.id === berkasId))
      if (!dipakaiLagi) {
        URL.revokeObjectURL(berkasUrl.get(berkasId))
        berkasUrl.delete(berkasId)
      }
      setBerkas((all) => ({ ...all, [kegiatanId]: (all[kegiatanId] ?? []).filter((f) => f.id !== berkasId) }))
    },
  }
}

// Level terverifikasi per indikator + riwayat snapshot skor IPS tiap kali level ditetapkan
// ponytail: level belum dipisah per periode; tambahkan periodeId saat pindah ke API
export function useSkor() {
  const [levels, setLevels] = useStore(KEYS.levelIndikator, EMPTY_OBJECT)
  const [snapshot, setSnapshot] = useStore(KEYS.snapshot, EMPTY_LIST)
  return {
    levels,
    snapshot,
    ...SIAP,
    tetapkanLevel(periodeId, indikator, level) {
      const baru = { ...levels, [indikator.id]: level }
      setLevels(baru)
      setSnapshot((list) => [
        {
          id: crypto.randomUUID(),
          periodeId,
          waktu: new Date().toISOString(),
          nilai: hitungIps(INDIKATOR, baru),
          perubahan: `Verifikasi Indikator ${indikator.nomor} (Level ${level})`,
        },
        ...list,
      ])
    },
  }
}

// Daftar periode + periode yang sedang dipilih user (default: periode pertama yang belum dikunci)
export function usePeriode() {
  const [periode, setPeriode] = useStore(KEYS.periode, SEED_PERIODE)
  const [aktifId, setAktifId] = useStore(KEYS.periodeAktif, null)
  const [, setSnapshot] = useStore(KEYS.snapshot, EMPTY_LIST)
  const aktif = periode.find((p) => p.id === aktifId) ?? periode.find((p) => !p.terkunci) ?? periode[0]
  return {
    periode,
    aktif,
    ...SIAP,
    setAktifId,
    tambah: (data) => setPeriode((list) => [{ ...data, id: crypto.randomUUID(), actual: null, terkunci: false }, ...list]),
    ubah: (id, perubahan) => setPeriode((list) => list.map((p) => (p.id === id ? { ...p, ...perubahan } : p))),
    hapus(id) {
      setPeriode((list) => list.filter((p) => p.id !== id))
      setSnapshot((list) => list.filter((s) => s.periodeId !== id))
    },
  }
}

export function useUsers() {
  const [users, setUsers] = useStore(KEYS.users, SEED_USERS)
  return {
    users,
    ...SIAP,
    // id kosong = akun baru
    simpan: (id, data) => setUsers((list) => (id ? list.map((u) => (u.id === id ? { ...u, ...data } : u)) : [...list, { ...data, id: crypto.randomUUID() }])),
    hapus: (id) => setUsers((list) => list.filter((u) => u.id !== id)),
    // Sama dengan status_aktif di backend (PATCH /api/users/{user}/status): akun nonaktif tidak bisa login
    setStatus: (id, status_aktif) => setUsers((list) => list.map((u) => (u.id === id ? { ...u, status_aktif } : u))),
  }
}

// Akun yang sedang login (null = belum login, atau akunnya dihapus di Kelola Pengguna)
// ponytail: login hanya di frontend dan semua akun memakai DEMO_PASSWORD; ganti dengan POST /login + GET /api/user Laravel
export function useAuth() {
  const [sesi, setSesi] = useStore(KEYS.sesi, null)
  const [users] = useStore(KEYS.users, SEED_USERS)
  return {
    user: cariAkun(users, sesi),
    ...SIAP,
    // Mengembalikan pesan error, atau undefined jika berhasil
    login(username, password) {
      const akun = cariAkun(users, username.trim())
      if (!akun || password !== DEMO_PASSWORD) return 'Username atau password salah.'
      if (akun.status_aktif === false) return 'Akun Anda dinonaktifkan. Hubungi Super Admin Bidang.'
      setSesi(akun.username)
    },
    logout: () => setSesi(null),
  }
}

// Notifikasi pengingat diturunkan dari rencana kegiatan + pengaturan H-n
export function useNotifikasi() {
  const [kegiatan] = useStore(KEYS.kegiatan, EMPTY_LIST)
  const [hariPengingat, setHariPengingat] = useStore(KEYS.pengingat, SEED_PENGINGAT)
  const [dibaca, setDibaca] = useStore(KEYS.notifDibaca, EMPTY_LIST)
  const list = notifikasi(kegiatan, hariPengingat, toISODate(new Date()))
  const tandaiDibaca = (id) => setDibaca((ids) => (ids.includes(id) ? ids : [...ids, id]))
  const tandaiSemuaDibaca = () => setDibaca((ids) => [...new Set([...ids, ...list.map((n) => n.id)])])
  return { list, dibaca, tandaiDibaca, tandaiSemuaDibaca, belumDibaca: list.filter((n) => !dibaca.includes(n.id)).length, hariPengingat, setHariPengingat, ...SIAP }
}
