import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { api, unduh } from './api'
import {
  contohKegiatan,
  EMPTY_LIST,
  EMPTY_OBJECT,
  hitungIps,
  INDIKATOR,
  KEYS,
  notifikasi,
  SEED_PENGINGAT,
  SEED_PERIODE,
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

// Data rencana kegiatan pada periode terpilih dari API Laravel.
const mapRencanaKegiatan = (item) => ({
  ...item,
  nama: item.nama_kegiatan,
  opd: item.nama_opd,
  pic: item.nama_pic,
  mulai: item.tanggal_mulai_rencana,
  selesai: item.tanggal_selesai_rencana,
  tahun: String(item.tahun_kegiatan),
  indikator: item.indikator ?? [],
  // Indikator API → id instrumen lokal (kode = nomor indikator); checklist & status bukti masih memakai id lokal
  indikatorIds: (item.indikator ?? []).map((i) => INDIKATOR.find((l) => String(l.nomor) === String(i.kode))?.id).filter(Boolean),
})

async function apiAll(path) {
  const first = await api(path)
  const items = [...(first.data ?? [])]
  const lastPage = first.meta?.last_page ?? 1
  const base = path.split('?')[0]
  for (let page = 2; page <= lastPage; page += 1) {
    const result = await api(`${base}?page=${page}`)
    items.push(...(result.data ?? []))
  }
  return items
}

export function useRencanaKegiatan(periodeId, filters = {}) {
  const [kegiatan, setKegiatan] = useState([])
  const [opds, setOpds] = useState([])
  const [pics, setPics] = useState([])
  const [indikator, setIndikator] = useState([])
  const [meta, setMeta] = useState(null)
  const [state, setState] = useState(SIAP)

  const query = new URLSearchParams({ periode_id: periodeId ?? '', page: String(filters.page ?? 1) })
  for (const key of ['q', 'tahun', 'opd_id', 'pic_user_id', 'status']) {
    if (filters[key]) query.set(key, filters[key])
  }
  const queryString = query.toString()

  const muatPilihan = useCallback(async () => {
    const [pilihanOpd, pilihanPic] = await Promise.allSettled([
      apiAll('/api/pilihan/opd'),
      apiAll('/api/pilihan/pic'),
    ])
    if (pilihanOpd.status === 'fulfilled') setOpds(pilihanOpd.value)
    if (pilihanPic.status === 'fulfilled') setPics(pilihanPic.value)
    const error = [pilihanOpd, pilihanPic].find((result) => result.status === 'rejected')?.reason
    if (error) setState({ loading: false, error })

    if (!periodeId) return
    try {
      const pilihanIndikator = await api(`/api/periode-evaluasi/${periodeId}/indikator`)
      setIndikator(pilihanIndikator.data ?? [])
    } catch (errorIndikator) {
      if (!error) setState({ loading: false, error: errorIndikator })
    }
  }, [periodeId])

  const muat = useCallback(async () => {
    if (!periodeId) { setKegiatan([]); setMeta(null); setState(SIAP); return [] }
    setState({ loading: true, error: null })
    try {
      const daftar = await api(`/api/rencana-kegiatan?${queryString}`)
      setKegiatan((daftar.data ?? []).map(mapRencanaKegiatan))
      setMeta(daftar.meta ?? null)
      setState(SIAP)
      return daftar.data ?? []
    } catch (error) {
      setState({ loading: false, error })
      return []
    }
  }, [periodeId, queryString])

  const detail = useCallback(async (id) => {
    const response = await api(`/api/rencana-kegiatan/${id}`)
    return mapRencanaKegiatan(response.data)
  }, [])

  useEffect(() => { muatPilihan() }, [muatPilihan])
  useEffect(() => { muat() }, [muat])

  return {
    kegiatan, opds, pics, indikator, meta, ...state, muat,
    detail,
    async hapus(id) {
      await api(`/api/rencana-kegiatan/${id}`, { method: 'DELETE' })
      await muat()
    },
    async simpan(id, data) {
      const payload = {
        nama_kegiatan: data.nama,
        deskripsi: data.deskripsi || null,
        opd_id: data.opd_id,
        pic_user_id: data.pic_user_id,
        tanggal_mulai_rencana: data.mulai,
        tanggal_selesai_rencana: data.selesai,
      }
      const response = id
        ? await api(`/api/rencana-kegiatan/${id}`, { method: 'PATCH', body: payload })
        : await api('/api/rencana-kegiatan', { method: 'POST', body: { ...payload, periode_id: periodeId } })
      const saved = response.data
      await api(`/api/rencana-kegiatan/${saved.id}/indikator`, {
        method: 'PUT',
        body: { indikator_ids: data.indikator_ids ?? [] },
      })
      await muat()
      return await detail(saved.id)
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

// Hasil GET yang ditandai dengan key permintaannya: loading = hasil yang ada belum milik key ini.
// Tanpa setState sinkron di effect, jadi pindah halaman langsung kembali ke loading.
function useMuat(key, ambil) {
  const [hasil, setHasil] = useState({ key: null })
  useEffect(() => {
    if (!key) return
    let hidup = true
    ambil().then(
      (data) => hidup && setHasil({ key, data }),
      (error) => hidup && setHasil({ key, error }),
    )
    return () => {
      hidup = false
    }
  }, [key, ambil])
  const milikKey = hasil.key === key
  return { data: milikKey ? hasil.data : undefined, loading: Boolean(key) && !milikKey, error: milikKey ? (hasil.error ?? null) : null }
}

// Satu rencana kegiatan lengkap dengan indikatornya
export function useDetailKegiatan(id) {
  const ambil = useCallback(() => api(`/api/rencana-kegiatan/${id}`).then((res) => mapRencanaKegiatan(res.data)), [id])
  const { data, ...state } = useMuat(id, ambil)
  return { kegiatan: data ?? null, ...state }
}

// Semua rencana kegiatan satu periode, lengkap dengan indikatorIds & jumlahBerkas.
// Daftar API dipaginasi 5 dan tanpa indikator/jumlah dokumen, jadi tiap kegiatan diambil detail + dokumennya.
// ponytail: 1 + N/5 + 2N request; minta backend menambah indikator & dokumen_count di GET /rencana-kegiatan kalau mulai lambat
export function useSemuaKegiatan(periodeId) {
  const ambil = useCallback(async () => {
    const ids = []
    for (let page = 1, last = 1; page <= last; page += 1) {
      const res = await api(`/api/rencana-kegiatan?periode_id=${periodeId}&page=${page}`)
      ids.push(...(res.data ?? []).map((k) => k.id))
      last = res.meta?.last_page ?? 1
    }
    return Promise.all(
      ids.map(async (id) => {
        const [detail, dokumen] = await Promise.all([api(`/api/rencana-kegiatan/${id}`), api(`/api/rencana-kegiatan/${id}/dokumen-bukti`)])
        return { ...mapRencanaKegiatan(detail.data), jumlahBerkas: dokumen.data?.length ?? 0 }
      }),
    )
  }, [periodeId])
  const { data, ...state } = useMuat(periodeId, ambil)
  return { kegiatan: data ?? EMPTY_LIST, ...state }
}

// Dokumen bukti satu rencana kegiatan dari API Laravel (berkas tersimpan di server, bukan di browser)
const mapDokumen = (d) => ({ id: d.id, nama: d.nama_file, ukuran: d.size_bytes, tanggal: d.evidence_date, mime: d.mime_type })

export function useDokumenBukti(kegiatanId) {
  // kegiatanId ikut disimpan: loading = data yang ada belum milik kegiatan ini
  const [state, setState] = useState({ kegiatanId: null, dokumen: [], error: null })
  const base = `/api/rencana-kegiatan/${kegiatanId}/dokumen-bukti`

  const muat = useCallback(
    () =>
      api(base).then(
        (res) => setState({ kegiatanId, dokumen: (res.data ?? []).map(mapDokumen), error: null }),
        (error) => setState({ kegiatanId, dokumen: [], error }),
      ),
    [base, kegiatanId],
  )
  useEffect(() => {
    if (kegiatanId) muat()
  }, [kegiatanId, muat])

  return {
    dokumen: state.kegiatanId === kegiatanId ? state.dokumen : EMPTY_LIST,
    loading: Boolean(kegiatanId) && state.kegiatanId !== kegiatanId,
    error: state.kegiatanId === kegiatanId ? state.error : null,
    // Satu request per berkas (endpoint menerima satu file); tanggal bukti = hari ini
    async unggah(files) {
      try {
        for (const file of files) {
          const body = new FormData()
          body.append('file', file)
          body.append('evidence_date', toISODate(new Date()))
          await api(base, { method: 'POST', body })
        }
      } finally {
        await muat()
      }
    },
    // Object URL isi berkas untuk pratinjau (iframe); pemanggil wajib URL.revokeObjectURL setelah selesai
    url: async (dokumen) => URL.createObjectURL(await unduh(`${base}/${dokumen.id}/download`)),
    // Buka di tab baru; URL dicabut setelah tab sempat memuatnya
    async buka(dokumen) {
      const url = URL.createObjectURL(await unduh(`${base}/${dokumen.id}/download`))
      window.open(url, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
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
  const aktif = periode.find((p) => p.id === aktifId && p.status === 'AKTIF')
    ?? periode.find((p) => p.status === 'AKTIF')
    ?? null

  // Mengambil daftar periode dari Laravel
  const muat = useCallback(async () => {
    const response = await api('/api/pengelolaan/periode-evaluasi')

    const daftarPeriode = (response.data ?? []).map((p) => ({
      id: p.id,
      nama: p.nama_periode,
      tahun1: p.tahun_mulai,
      tahun2: p.tahun_selesai,
      target: p.target_ips == null ? null : Number(p.target_ips),
      versi_instrumen_id: p.versi_instrumen_id,
      status: p.status,
      terkunci: p.status === 'TERKUNCI',
    }))

    setPeriode(daftarPeriode)
    return daftarPeriode
  }, [setPeriode])

    const muatPilihan = useCallback(async () => {
      const response = await api('/api/periode-evaluasi')

      const daftarPeriode = (response.data ?? []).map((p) => ({
        id: p.id,
        nama: p.nama_periode,
        tahun1: p.tahun_mulai,
        tahun2: p.tahun_selesai,
        target: p.target_ips == null ? null : Number(p.target_ips),
        versi_instrumen_id: p.versi_instrumen_id,
        status: p.status,
        terkunci: p.status === 'TERKUNCI',
      }))

      setPeriode(daftarPeriode)
      return daftarPeriode
    }, [setPeriode])

  return {
    periode,
    aktif,
    loading: false,
    error: null,
    muat,
    muatPilihan,
    setAktifId,
    
    tambah: async (data) => {
      const response = await api('/api/periode-evaluasi', {
        method: 'POST',
        body: data,
      })

      const p = response.data

      const periodeBaru = {
        id: p.id,
        nama: p.nama_periode,
        tahun1: p.tahun_mulai,
        tahun2: p.tahun_selesai,
        target: p.target_ips == null ? null : Number(p.target_ips),
        versi_instrumen_id: p.versi_instrumen_id,
        status: p.status,
        terkunci: p.status === 'TERKUNCI',
      }

      setPeriode((list) => [periodeBaru, ...list])

      return periodeBaru
    },
    
    ubah: async (id, perubahan) => {
      const payload = {
        nama_periode: perubahan.nama_periode,
        tahun_mulai: perubahan.tahun_mulai,
        tahun_selesai: perubahan.tahun_selesai,
        target_ips: perubahan.target_ips,
      }

      const response = await api(`/api/periode-evaluasi/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      const p = response.data

      const periodeTerbaru = {
        id: p.id,
        nama: p.nama_periode,
        tahun1: p.tahun_mulai,
        tahun2: p.tahun_selesai,
        target: p.target_ips == null ? null : Number(p.target_ips),
        versi_instrumen_id: p.versi_instrumen_id,
        status: p.status,
        terkunci: p.status === 'TERKUNCI',
      }

      setPeriode((list) =>
        list.map((item) =>
          item.id === id ? { ...item, ...periodeTerbaru } : item
        )
      )

      return periodeTerbaru
    },
    
    hapus: async (id) => {
      await api(`/api/periode-evaluasi/${id}`, {
        method: 'DELETE',
      })

      setPeriode((list) => list.filter((p) => p.id !== id))
      setSnapshot((list) => list.filter((s) => s.periodeId !== id))
    },

    aktifkan: async (id) => {
      await api(`/api/periode-evaluasi/${id}/aktivasi`, {
        method: 'PATCH',
      })

      await muat()
    },

    kunci: async (id) => {
      await api(`/api/periode-evaluasi/${id}/kunci`, {
        method: 'PATCH',
      })

      await muat()
    },

  }
}

// Versi instrumen yang bisa dipilih saat membuat periode.
export function useVersiInstrumen() {
  const [daftar, setDaftar] = useStore('epss.versi-instrumen', EMPTY_LIST)
  const [state, setState] = useState(SIAP)

  const muat = useCallback(async () => {
    setState({ loading: true, error: null })
    try {
      const response = await api('/api/pilihan/versi-instrumen')
      const versi = (response.data ?? []).map((item) => ({
        id: item.id,
        nama: item.nama,
        versi: item.versi,
      }))
      setDaftar(versi)
      setState(SIAP)
      return versi
    } catch (error) {
      setState({ loading: false, error })
      return []
    }
  }, [setDaftar])

  useEffect(() => { muat() }, [muat])
  return { daftar, ...state, muat }
}

// Akun dibuat & diaktifkan/dinonaktifkan lewat API; error validasi (error.errors) dilempar ke pemanggil.
// ponytail: backend belum punya GET /api/users, jadi daftar = akun yang dibuat dari browser ini (disimpan lokal); ambil dari API saat endpoint-nya ada
export function useUsers() {
  const [users, setUsers] = useStore(KEYS.users, EMPTY_LIST)
  return {
    users,
    ...SIAP,
    // data = { name, username, email, password, password_confirmation, role }
    async tambah(data) {
      const { data: akun } = await api('/api/users', { method: 'POST', body: data })
      setUsers((list) => [...list, akun])
    },
    // Akun nonaktif tidak bisa login
    async setStatus(id, status_aktif) {
      await api(`/api/users/${id}/status`, { method: 'PATCH', body: { status_aktif } })
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, status_aktif } : u)))
    },
  }
}

// Sesi login Laravel (cookie Sanctum). Satu salinan di memori untuk semua komponen, dimuat sekali dari GET /api/user
let sesi = { user: null, loading: true, error: null }
const sesiListeners = new Set()
const subscribeSesi = (listener) => {
  sesiListeners.add(listener)
  return () => sesiListeners.delete(listener)
}
function setSesi(perubahan) {
  sesi = { ...sesi, ...perubahan }
  sesiListeners.forEach((listener) => listener())
}
// 401 = belum login; 403 = akun dinonaktifkan (backend sudah mengeluarkannya). Keduanya berarti tanpa sesi, bukan error
const muatSesi = () =>
  api('/api/user').then(
    (user) => setSesi({ user, loading: false, error: null }),
    (error) => setSesi([401, 403].includes(error.status) ? { user: null, loading: false, error: null } : { loading: false, error }),
  )
let sesiDimuat = false

// Akun yang sedang login (null = belum login)
export function useAuth() {
  const state = useSyncExternalStore(subscribeSesi, () => sesi)
  useEffect(() => {
    if (sesiDimuat) return
    sesiDimuat = true
    muatSesi()
  }, [])
  return {
    ...state,
    // Mengembalikan pesan error, atau undefined jika berhasil
    async login(username, password) {
      try {
        await api('/login', { method: 'POST', body: { username: username.trim(), password } })
      } catch (error) {
        return error.message
      }
      await muatSesi()
    },
    async logout() {
      await api('/logout', { method: 'POST' })
      setSesi({ user: null })
    },
    // data = { current_password, password, password_confirmation }; error validasi (error.errors) dilempar ke pemanggil
    async gantiPassword(data) {
      await api('/api/user/password', { method: 'PATCH', body: data })
      await muatSesi()
    },
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
