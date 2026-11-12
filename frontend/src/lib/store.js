import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { api, unduh } from './api'
import {
  buktiKey,
  EMPTY_LIST,
  EMPTY_OBJECT,
  hitungIps,
  INDIKATOR,
  indikatorById,
  KEYS,
  notifikasi,
  SEED_PENGINGAT,
  SEED_PERIODE,
  toISODate,
  WARNA,
} from './epss'

// Preferensi lokal disimpan di localStorage dan tersinkron antar komponen yang memakai key yang sama.
const cache = new Map()
const listeners = new Map()

function read(key, seed) {
  if (!cache.has(key)) {
    let value
    try {
      value = JSON.parse(localStorage.getItem(key))
    } catch {
      value = null
    }
    cache.set(key, value ?? seed)
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

// Data rencana kegiatan pada periode terpilih dari API Laravel.
const mapRencanaKegiatan = (item) => ({
  ...item,
  nama: item.nama_kegiatan,
  opd: item.nama_opd,
  pic: item.nama_pic,
  mulai: item.tanggal_mulai_rencana,
  selesai: item.tanggal_selesai_rencana,
  tahun: String(item.tahun_kegiatan),
  // API tidak menyimpan warna: diturunkan dari id supaya tetap sama di kalender, agenda, dan peta
  warna: [...String(item.id)].reduce((n, c) => n + c.charCodeAt(0), 0) % WARNA.length,
  indikator: item.indikator ?? [],
  // Indikator API → id instrumen lokal (kode = nomor indikator); checklist & status bukti masih memakai id lokal
  indikatorIds: (item.indikator ?? []).map((i) => INDIKATOR.find((l) => String(l.nomor) === String(i.kode))?.id).filter(Boolean),
})

async function apiAll(path) {
  const first = await api(path)
  const items = [...(first.data ?? [])]
  const lastPage = first.meta?.last_page ?? 1
  for (let page = 2; page <= lastPage; page += 1) {
    const url = new URL(path, window.location.origin)
    url.searchParams.set('page', page)
    const result = await api(`${url.pathname}${url.search}`)
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
  const [state, setState] = useState(SIAP) // muat ulang manual (setelah simpan/hapus)
  const [errorPilihan, setErrorPilihan] = useState(null)
  const [selesai, setSelesai] = useState(null) // queryString milik data yang sedang tampil

  const query = new URLSearchParams({ periode_id: periodeId ?? '', page: String(filters.page ?? 1) })
  for (const key of ['q', 'tahun', 'opd_id', 'pic_user_id', 'status']) {
    if (filters[key]) query.set(key, filters[key])
  }
  const queryString = query.toString()

  // Pilihan OPD, PIC, dan indikator untuk form; state hanya diisi setelah respons datang
  useEffect(() => {
    let hidup = true
    Promise.allSettled([
      apiAll('/api/pilihan/opd'),
      apiAll('/api/pilihan/pic'),
      periodeId ? api(`/api/periode-evaluasi/${periodeId}/indikator`) : null,
    ]).then(([opd, pic, ind]) => {
      if (!hidup) return
      if (opd.status === 'fulfilled') setOpds(opd.value)
      if (pic.status === 'fulfilled') setPics(pic.value)
      if (periodeId && ind.status === 'fulfilled') setIndikator(ind.value.data ?? [])
      setErrorPilihan([opd, pic, ind].find((r) => r.status === 'rejected')?.reason ?? null)
    })
    return () => {
      hidup = false
    }
  }, [periodeId])

  const terima = useCallback((daftar) => {
    setKegiatan((daftar.data ?? []).map(mapRencanaKegiatan))
    setMeta(daftar.meta ?? null)
  }, [setKegiatan, setMeta])

  // Daftar mengikuti periode & filter; loading = data yang tampil belum milik queryString ini
  useEffect(() => {
    if (!periodeId) return
    let hidup = true
    api(`/api/rencana-kegiatan?${queryString}`).then(
      (daftar) => {
        if (!hidup) return
        terima(daftar)
        setState(SIAP)
        setSelesai(queryString)
      },
      (error) => {
        if (!hidup) return
        setState({ loading: false, error })
        setSelesai(queryString)
      },
    )
    return () => {
      hidup = false
    }
  }, [periodeId, queryString, terima])

  const muat = useCallback(async () => {
    if (!periodeId) return []
    setState({ loading: true, error: null })
    try {
      const daftar = await api(`/api/rencana-kegiatan?${queryString}`)
      terima(daftar)
      setState(SIAP)
      return daftar.data ?? []
    } catch (error) {
      setState({ loading: false, error })
      return []
    }
  }, [periodeId, queryString, terima, setState])

  const detail = useCallback(async (id) => {
    const response = await api(`/api/rencana-kegiatan/${id}`)
    return mapRencanaKegiatan(response.data)
  }, [])

  const milik = !periodeId || selesai === queryString
  const loading = state.loading || !milik
  const error = (milik ? state.error : null) ?? errorPilihan

  return {
    kegiatan: periodeId ? kegiatan : EMPTY_LIST,
    opds,
    pics,
    indikator,
    meta: periodeId ? meta : null,
    loading,
    error,
    muat,
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
      // Output memakai endpoint dan izin terpisah dari perubahan detail kegiatan.
      // Kirim hanya jika form memang menyediakan daftar output.
      if (data.output !== undefined) {
        await api(`/api/rencana-kegiatan/${saved.id}/output-diharapkan`, {
          method: 'PUT',
          body: {
            output: data.output.map(({ judul, jenis, contoh }) => ({
              judul,
              jenis: jenis || null,
              contoh: contoh ? { nama: contoh } : null,
            })),
          },
        })
      }
      await muat()
      return await detail(saved.id)
    },
    async simpanOutput(id, output) {
      await api(`/api/rencana-kegiatan/${id}/output-diharapkan`, {
        method: 'PUT',
        body: {
          output: output.map(({ judul, jenis, contoh }) => ({
            judul,
            jenis: jenis || null,
            contoh: contoh ? { nama: contoh } : null,
          })),
        },
      })
      return await detail(id)
    },
  }
}

// Ajuan bukti dari API → bentuk yang dipakai halaman. Indikator API dicocokkan ke id lokal lewat kode = nomor
const STATUS_AJUAN = { DRAFT: 'draft', MENUNGGU: 'menunggu', PERBAIKAN: 'perbaikan', TERVERIFIKASI: 'terverifikasi' }
const indikatorLokalByKode = Object.fromEntries(INDIKATOR.map((i) => [String(i.nomor), i.id]))
const mapAjuan = (a) => ({
  id: a.id,
  kegiatanId: a.kegiatan_id,
  indikatorId: indikatorLokalByKode[String(a.indikator.kode)],
  status: STATUS_AJUAN[a.status],
  checked: a.checklist ?? {},
  level: a.level,
  catatan: a.catatan ?? '',
  pengaju: a.pengaju,
  diajukan: a.diajukan_pada,
  verifikator: a.verifikator,
  diverifikasi: a.diverifikasi_pada,
})

// bukti = { 'kegiatanId:indikatorId': { kegiatanId, indikatorId, checked, status, level, catatan, ... } } untuk periode aktif.
// Belum ada ajuan = draft kosong (pemanggil memakai `?? { status: 'draft' }`).
export function useBukti() {
  const { aktif } = usePeriode()
  const periodeId = aktif?.id
  const ambil = useCallback(
    () => api(`/api/periode-evaluasi/${periodeId}/ajuan-bukti`).then((res) => Object.fromEntries((res.data ?? []).map(mapAjuan).map((b) => [buktiKey(b.kegiatanId, b.indikatorId), b]))),
    [periodeId],
  )
  const { data, ...state } = useMuat(periodeId, ambil)
  // Hasil simpan dari halaman ini ditimpakan di atas hasil GET, tanpa memuat ulang semuanya
  const [ubahan, setUbahan] = useState(EMPTY_OBJECT)
  const bukti = { ...(data ?? EMPTY_OBJECT), ...ubahan }
  const terima = (a) => {
    const b = mapAjuan(a)
    setUbahan((u) => ({ ...u, [buktiKey(b.kegiatanId, b.indikatorId)]: b }))
    return b
  }

  return {
    bukti,
    ...state,
    // Operator (PIC): simpan checklist sebagai draft, atau ajukan = true untuk mengirim ke verifikator.
    // kegiatan = hasil API (punya daftar indikator beserta id API-nya)
    async simpan(kegiatan, indikatorId, { checked, ajukan = false }) {
      const key = buktiKey(kegiatan.id, indikatorId)
      const nomor = String(indikatorById[indikatorId].nomor)
      const indikatorApi = kegiatan.indikator.find((i) => String(i.kode) === nomor)
      if (!indikatorApi) throw new Error('Indikator ini belum dipetakan ke kegiatan.')
      const sebelum = bukti[key]
      // Centang langsung tampil; dikembalikan jika server menolak
      setUbahan((u) => ({ ...u, [key]: { kegiatanId: kegiatan.id, indikatorId, status: 'draft', ...sebelum, checked } }))
      try {
        const { data: a } = await api(`/api/rencana-kegiatan/${kegiatan.id}/ajuan-bukti/${indikatorApi.id}`, {
          method: 'PUT',
          body: { checklist: checked, ajukan },
        })
        return terima(a)
      } catch (error) {
        setUbahan((u) => ({ ...u, [key]: sebelum }))
        throw error
      }
    },
    // Verifikator: keputusan 'terverifikasi' (dengan level) atau 'perbaikan' (dengan catatan)
    async verifikasi(ajuan, { keputusan, checked, level, catatan }) {
      const { data: a } = await api(`/api/ajuan-bukti/${ajuan.id}/verifikasi`, {
        method: 'PATCH',
        body: {
          keputusan: keputusan === 'terverifikasi' ? 'TERVERIFIKASI' : 'PERBAIKAN',
          checklist: checked,
          ...(keputusan === 'terverifikasi' ? { level } : { catatan }),
        },
      })
      return terima(a)
    },
  }
}

// Hasil GET yang ditandai dengan key permintaannya: loading = hasil yang ada belum milik key ini.
// Tanpa setState sinkron di effect, jadi pindah halaman langsung kembali ke loading.
function useMuat(key, ambil) {
  const [hasil, setHasil] = useState({ key: null })
  const [versiMuat, setVersiMuat] = useState(0)
  const muatUlang = useCallback(() => {
    setHasil({ key: null })
    setVersiMuat((versi) => versi + 1)
  }, [])
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
  }, [key, ambil, versiMuat])
  const milikKey = hasil.key === key
  return { data: milikKey ? hasil.data : undefined, loading: Boolean(key) && !milikKey, error: milikKey ? (hasil.error ?? null) : null, muatUlang }
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
        const dokumenBukti = (dokumen.data ?? []).map(mapDokumen)
        return { ...mapRencanaKegiatan(detail.data), dokumenBukti, jumlahBerkas: dokumenBukti.length }
      }),
    )
  }, [periodeId])
  const { data, ...state } = useMuat(periodeId, ambil)
  return { kegiatan: data ?? EMPTY_LIST, ...state }
}

// Dokumen bukti satu rencana kegiatan dari API Laravel (berkas tersimpan di server, bukan di browser)
const mapDokumen = (d) => ({ id: d.id, nama: d.nama_file, ukuran: d.size_bytes, tanggal: d.evidence_date, mime: d.mime_type, uploadedBy: d.uploaded_by, isCurrent: d.is_current })

export function useSemuaDokumen(periodeIds) {
  const key = Array.isArray(periodeIds) ? [...periodeIds].sort().join(',') : ''
  const ambil = useCallback(async () => {
    const ids = key.split(',').filter(Boolean)
    const perPeriode = await Promise.all(ids.map(async (periodeId) => {
      const daftar = await apiAll(`/api/rencana-kegiatan?periode_id=${encodeURIComponent(periodeId)}`)
      return Promise.all(daftar.map(async ({ id }) => {
        const [detail, response] = await Promise.all([
          api(`/api/rencana-kegiatan/${id}`),
          api(`/api/rencana-kegiatan/${id}/dokumen-bukti`),
        ])
        const kegiatan = mapRencanaKegiatan(detail.data)
        const indikator = kegiatan.indikatorIds.map((indikatorId) => indikatorById[indikatorId]).filter(Boolean)
        return (response.data ?? [])
          .filter((document) => document.is_current)
          .map((document) => ({
            ...mapDokumen(document),
            oleh: kegiatan.pic,
            periodeId,
            kegiatan: [kegiatan],
            indikator,
          }))
      }))
    }))
    return perPeriode.flat(2).sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  }, [key])
  const { data, ...state } = useMuat(key, ambil)

  return {
    dokumen: data ?? EMPTY_LIST,
    ...state,
    async kaitkan(kegiatanId, dokumenId) {
      await api(`/api/rencana-kegiatan/${kegiatanId}/dokumen-bukti/${dokumenId}/tautan`, { method: 'POST' })
      state.muatUlang()
    },
  }
}

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
  const [state, setState] = useState({ loading: true, error: null })

  useEffect(() => {
    let hidup = true
    api('/api/pilihan/versi-instrumen').then(
      (response) => {
        if (!hidup) return
        setDaftar((response.data ?? []).map((item) => ({ id: item.id, nama: item.nama, versi: item.versi })))
        setState(SIAP)
      },
      (error) => hidup && setState({ loading: false, error }),
    )
    return () => {
      hidup = false
    }
  }, [setDaftar])

  return { daftar, ...state }
}

// Daftar, pembuatan, dan status akun semuanya bersumber dari API Laravel.
export function useUsers() {
  const [users, setUsers] = useState(EMPTY_LIST)
  const [state, setState] = useState({ loading: true, error: null })
  const ambil = useCallback(async () => {
    const response = await api('/api/users')
    return response.data ?? []
  }, [])

  const muat = useCallback(async () => {
    setState({ loading: true, error: null })
    try {
      const daftar = await ambil()
      setUsers(daftar)
      setState(SIAP)
      return daftar
    } catch (error) {
      setState({ loading: false, error })
      throw error
    }
  }, [ambil])

  useEffect(() => {
    let hidup = true
    ambil().then(
      (daftar) => {
        if (!hidup) return
        setUsers(daftar)
        setState(SIAP)
      },
      (error) => hidup && setState({ loading: false, error }),
    )
    return () => { hidup = false }
  }, [ambil])

  return {
    users,
    ...state,
    // data = { name, username, email, password, password_confirmation, role }
    async tambah(data) {
      await api('/api/users', { method: 'POST', body: data })
      await muat()
    },
    // Akun nonaktif tidak bisa login
    async setStatus(id, status_aktif) {
      await api(`/api/users/${id}/status`, { method: 'PATCH', body: { status_aktif } })
      await muat()
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
  const { aktif } = usePeriode()
  const periodeId = aktif?.id
  const ambil = useCallback(async () => {
    if (!periodeId) return EMPTY_LIST
    const items = await apiAll(`/api/rencana-kegiatan?periode_id=${encodeURIComponent(periodeId)}`)
    return items.map((item) => ({
      id: item.id,
      nama: item.nama_kegiatan,
      mulai: item.tanggal_mulai_rencana,
      selesai: item.tanggal_selesai_rencana,
    }))
  }, [periodeId])
  const { data: kegiatan = EMPTY_LIST, ...state } = useMuat(periodeId, ambil)
  const [hariPengingat, setHariPengingat] = useStore(KEYS.pengingat, SEED_PENGINGAT)
  const [dibaca, setDibaca] = useStore(KEYS.notifDibaca, EMPTY_LIST)
  const list = notifikasi(kegiatan, hariPengingat, toISODate(new Date()))
  const tandaiDibaca = (id) => setDibaca((ids) => (ids.includes(id) ? ids : [...ids, id]))
  const tandaiSemuaDibaca = () => setDibaca((ids) => [...new Set([...ids, ...list.map((n) => n.id)])])
  return { list, dibaca, tandaiDibaca, tandaiSemuaDibaca, belumDibaca: list.filter((n) => !dibaca.includes(n.id)).length, hariPengingat, setHariPengingat, ...state }
}
