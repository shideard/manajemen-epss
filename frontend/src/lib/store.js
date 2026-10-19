import { useCallback, useSyncExternalStore } from 'react'
import { contohKegiatan, EMPTY_LIST, KEYS, notifikasi, SEED_PENGINGAT, SEED_PERIODE } from './epss'
import { STORAGE_KEY as KEGIATAN_KEY, toISODate } from '../pages/rencana-kegiatan/kegiatan'

// State yang disimpan di localStorage dan tersinkron antar komponen yang memakai key yang sama
// (mis. notifikasi dibaca di halaman Notifikasi → titik merah di topbar ikut hilang).
// ponytail: data hanya ada di browser ini; ganti dengan API Laravel saat endpoint-nya siap
const cache = new Map()
const listeners = new Map()

// Data contoh untuk key yang belum pernah disimpan di browser ini; menang atas seed dari pemanggil
// supaya semua halaman yang membaca kegiatan/bukti melihat data yang sama. Daftar yang sengaja dikosongkan ([]) tetap kosong.
const contoh = contohKegiatan(toISODate(new Date()))
const DATA_CONTOH = { [KEGIATAN_KEY]: contoh.kegiatan, [KEYS.bukti]: contoh.bukti }

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
export function useStore(key, seed) {
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

// Daftar periode + periode yang sedang dipilih user (default: periode pertama yang belum dikunci)
// ponytail: data bukti/level belum dipisah per periode; tambahkan periodeId saat pindah ke API
export function usePeriode() {
  const [periode, setPeriode] = useStore(KEYS.periode, SEED_PERIODE)
  const [aktifId, setAktifId] = useStore(KEYS.periodeAktif, null)
  const aktif = periode.find((p) => p.id === aktifId) ?? periode.find((p) => !p.terkunci) ?? periode[0]
  return { periode, setPeriode, aktif, setAktifId }
}

// Notifikasi pengingat diturunkan dari rencana kegiatan + pengaturan H-n
export function useNotifikasi() {
  const [kegiatan] = useStore(KEGIATAN_KEY, EMPTY_LIST)
  const [hariPengingat, setHariPengingat] = useStore(KEYS.pengingat, SEED_PENGINGAT)
  const [dibaca, setDibaca] = useStore(KEYS.notifDibaca, EMPTY_LIST)
  const list = notifikasi(kegiatan, hariPengingat, toISODate(new Date()))
  const tandaiDibaca = (id) => setDibaca((ids) => (ids.includes(id) ? ids : [...ids, id]))
  const tandaiSemuaDibaca = () => setDibaca((ids) => [...new Set([...ids, ...list.map((n) => n.id)])])
  return { list, dibaca, tandaiDibaca, tandaiSemuaDibaca, belumDibaca: list.filter((n) => !dibaca.includes(n.id)).length, hariPengingat, setHariPengingat }
}

// Isi berkas yang diunggah di sesi ini (id berkas → object URL) untuk pratinjau.
// ponytail: isi berkas tidak tersimpan setelah reload; simpan ke storage backend saat API unggah siap
export const berkasUrl = new Map()
