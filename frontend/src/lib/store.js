import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { api, unduh } from './api'
import {
  buktiKey,
  EMPTY_LIST,
  EMPTY_OBJECT,
  KEYS,
  levelIndikator,
  notifikasi,
  SEED_PENGINGAT,
  toISODate,
  WARNA,
} from './epss'

// Preferensi lokal disimpan di localStorage dan tersinkron antar komponen yang memakai key yang sama.
const cache = new Map()
const listeners = new Map()

// persist = false: hanya di memori (dibagi antar komponen), sumber datanya API
function read(key, seed, persist = true) {
  if (!cache.has(key)) {
    let value
    try {
      value = persist ? JSON.parse(localStorage.getItem(key)) : null
    } catch {
      value = null
    }
    cache.set(key, value ?? seed)
  }
  return cache.get(key)
}

// seed harus konstanta (bukan objek baru tiap render)
function useStore(key, seed, persist = true) {
  const subscribe = useCallback(
    (listener) => {
      if (!listeners.has(key)) listeners.set(key, new Set())
      listeners.get(key).add(listener)
      return () => listeners.get(key).delete(listener)
    },
    [key],
  )
  const value = useSyncExternalStore(subscribe, () => read(key, seed, persist))

  const set = useCallback(
    (next) => {
      const value = typeof next === 'function' ? next(read(key, seed, persist)) : next
      cache.set(key, value)
      if (persist) localStorage.setItem(key, JSON.stringify(value))
      listeners.get(key)?.forEach((listener) => listener())
    },
    [key, seed, persist],
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
  // Kode indikator menjadi id UI, sehingga relasi tidak bergantung pada daftar indikator frontend.
  indikatorIds: (item.indikator ?? []).map((i) => String(i.kode)),
  // Level yang ditargetkan verifikator per indikator (kode indikator → level)
  levelTarget: Object.fromEntries((item.indikator ?? []).map((i) => [String(i.kode), i.level ?? 1])),
})

// Simpan daftar output yang ditargetkan (id dikirim supaya baris & berkas contohnya dipertahankan),
// lalu unggah berkas contoh yang baru dipilih ke output pada urutan yang sama
async function simpanOutputKegiatan(kegiatanId, output) {
  const base = `/api/rencana-kegiatan/${kegiatanId}`
  await api(`${base}/output-diharapkan`, {
    method: 'PUT',
    body: {
      output: output.map(({ id, judul, jenis, contoh }) => ({
        id: id ?? null,
        judul,
        jenis: jenis || null,
        contoh: contoh ? { nama: contoh } : null,
      })),
    },
  })
  if (!output.some((o) => o.file)) return
  const tersimpan = (await api(base)).data.output ?? []
  for (const [i, o] of output.entries()) {
    if (!o.file) continue
    const body = new FormData()
    body.append('file', o.file)
    await api(`${base}/output-diharapkan/${tersimpan[i].id}/contoh`, { method: 'POST', body })
  }
}

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
  const semua = filters.semua ?? false
  const ambilDaftar = useCallback(async () => {
    const path = `/api/rencana-kegiatan?${queryString}`
    // shortcut: local sorting loads every page; move sorting to the API when the dataset grows.
    return semua ? { data: await apiAll(path) } : api(path)
  }, [queryString, semua])

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
      if (periodeId && ind.status === 'fulfilled') {
        setIndikator((ind.value.data ?? []).map((item, index) => ({ ...item, nomor: index + 1 })))
      }
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
    ambilDaftar().then(
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
  }, [periodeId, queryString, terima, ambilDaftar])

  const muat = useCallback(async () => {
    if (!periodeId) return []
    setState({ loading: true, error: null })
    try {
      const daftar = await ambilDaftar()
      terima(daftar)
      setState(SIAP)
      return daftar.data ?? []
    } catch (error) {
      setState({ loading: false, error })
      return []
    }
  }, [periodeId, ambilDaftar, terima, setState])

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
        body: { indikator_ids: data.indikator_ids ?? [], levels: data.levels ?? {} },
      })
      // Output memakai endpoint dan izin terpisah dari perubahan detail kegiatan.
      // Kirim hanya jika form memang menyediakan daftar output.
      if (data.output !== undefined) await simpanOutputKegiatan(saved.id, data.output)
      await muat()
      return await detail(saved.id)
    },
    async simpanOutput(id, output) {
      await simpanOutputKegiatan(id, output)
      return await detail(id)
    },
  }
}

// Ajuan bukti dari API → bentuk yang dipakai halaman. Kode indikator menjadi id UI yang stabil.
const STATUS_AJUAN = { DRAFT: 'draft', MENUNGGU: 'menunggu', PERBAIKAN: 'perbaikan', TERVERIFIKASI: 'terverifikasi' }
const mapAjuan = (a) => ({
  id: a.id,
  kegiatanId: a.kegiatan_id,
  indikatorId: String(a.indikator.kode),
  status: STATUS_AJUAN[a.status],
  checked: a.checklist ?? {},
  level: a.level,
  catatan: a.catatan ?? '',
  pengaju: a.pengaju,
  diajukan: a.diajukan_pada,
  verifikator: a.verifikator,
  diverifikasi: a.diverifikasi_pada,
})

// bukti = { 'kegiatanId:indikatorId': { kegiatanId, indikatorId, checked, status, level, catatan, ... } } untuk periode aktif
// (atau periode lain bila idPeriode diisi). Belum ada ajuan = draft kosong (pemanggil memakai `?? { status: 'draft' }`).
export function useBukti(idPeriode) {
  const { aktif } = usePeriode()
  const periodeId = idPeriode ?? aktif?.id
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
    // Ubahan lokal ikut dibuang: status dari server bisa berubah di luar halaman ini (mis. ajuan ditarik saat berkas dihapus)
    muatUlang() {
      setUbahan(EMPTY_OBJECT)
      state.muatUlang()
    },
    // Operator (PIC): simpan checklist sebagai draft, atau ajukan = true untuk mengirim ke verifikator.
    // kegiatan = hasil API (punya daftar indikator beserta id API-nya)
    async simpan(kegiatan, indikatorId, { checked, ajukan = false }) {
      const key = buktiKey(kegiatan.id, indikatorId)
      const indikatorApi = kegiatan.indikator.find((i) => String(i.kode) === String(indikatorId))
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
    // Verifikator: keputusan 'terverifikasi' (level = level target pemetaan, ditetapkan server) atau 'perbaikan' (dengan catatan)
    async verifikasi(ajuan, { keputusan, checked, catatan }) {
      const { data: a } = await api(`/api/ajuan-bukti/${ajuan.id}/verifikasi`, {
        method: 'PATCH',
        body: {
          keputusan: keputusan === 'terverifikasi' ? 'TERVERIFIKASI' : 'PERBAIKAN',
          checklist: checked,
          ...(keputusan === 'perbaikan' && { catatan }),
        },
      })
      return terima(a)
    },
    // Verifikator: cabut status terverifikasi → kembali ke 'perbaikan' dengan alasan untuk operator
    async cabut(ajuan, catatan) {
      const { data: a } = await api(`/api/ajuan-bukti/${ajuan.id}/cabut`, { method: 'PATCH', body: { catatan } })
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

function mapInstrumen(data) {
  const domainById = new Map()
  const indikator = (data ?? []).map((item, index) => {
    const domainData = item.domain
    if (!domainById.has(domainData.id)) {
      domainById.set(domainData.id, {
        id: domainData.id,
        kode: domainData.kode,
        nama: domainData.nama,
        indikator: [],
      })
    }
    const domain = domainById.get(domainData.id)
    const mapped = {
      id: String(item.kode),
      apiId: item.id,
      kode: String(item.kode),
      nomor: index + 1,
      nama: item.nama,
      bobot: Number(item.bobot),
      aspek: item.aspek.nama,
      domain,
      domainNomor: Number(domain.kode),
      levels: (item.levels ?? []).map((level) => ({
        level: level.level,
        nama: level.nama,
        kriteria: level.kriteria,
        pemenuhan: level.pemenuhan ?? [],
        syarat: (level.persyaratan_bukti ?? []).map((requirement) => requirement.deskripsi),
      })),
    }
    domain.indikator.push(mapped)
    return mapped
  })

  return {
    domains: [...domainById.values()],
    indikator,
    byId: Object.fromEntries(indikator.map((item) => [item.id, item])),
  }
}

export function useInstrumen(periodeId) {
  const ambil = useCallback(
    () => api(`/api/periode-evaluasi/${periodeId}/indikator`).then((response) => mapInstrumen(response.data)),
    [periodeId],
  )
  const { data, ...state } = useMuat(periodeId, ambil)

  return {
    domains: data?.domains ?? EMPTY_LIST,
    indikator: data?.indikator ?? EMPTY_LIST,
    byId: data?.byId ?? EMPTY_OBJECT,
    ...state,
  }
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
// sumber: berkas asli bila baris ini tautan (pintasan) dari kegiatan lain, null bila berkas asli
const mapDokumen = (d) => ({
  id: d.id,
  nama: d.nama_file,
  ukuran: d.size_bytes,
  tanggal: d.evidence_date,
  mime: d.mime_type,
  uploadedBy: d.uploaded_by,
  isCurrent: d.is_current,
  sumber: d.sumber ? { id: d.sumber.dokumen_id, kegiatanId: d.sumber.kegiatan_id, kegiatanNama: d.sumber.nama_kegiatan } : null,
})

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
        const indikator = kegiatan.indikator.map((item) => ({
          ...item,
          id: String(item.kode),
          nomor: Number(item.kode),
        }))
        return (response.data ?? [])
          .filter((document) => document.is_current)
          .map((document) => ({
            ...mapDokumen(document),
            oleh: kegiatan.pic,
            periodeId,
            // Halaman arsip mengelompokkan per folder periode lewat daftar ini
            periode: [periodeId],
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
    // Lepas dari satu kegiatan saja; kegiatan lain yang memakai berkas yang sama tetap utuh
    async lepas(kegiatanId, dokumenId) {
      await api(`/api/rencana-kegiatan/${kegiatanId}/dokumen-bukti/${dokumenId}/tautan`, { method: 'DELETE' })
      state.muatUlang()
    },
    // Hapus berkas beserta semua tautannya di kegiatan lain
    async hapus(kegiatanId, dokumenId) {
      await api(`/api/rencana-kegiatan/${kegiatanId}/dokumen-bukti/${dokumenId}`, { method: 'DELETE' })
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
    // Lepas berkas dari kegiatan ini (berkas fisik ikut terhapus bila tidak dipakai kegiatan lain)
    async hapus(dokumen) {
      try {
        await api(`${base}/${dokumen.id}/tautan`, { method: 'DELETE' })
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

// Level terverifikasi per indikator, berjenjang dari ajuan terverifikasi di server (lihat levelIndikator)
export function useSkor(_indikatorData, kegiatan = EMPTY_LIST, bukti = EMPTY_OBJECT) {
  return {
    levels: levelIndikator(kegiatan.flatMap((item) => item.indikatorIds.map((id) => bukti[buktiKey(item.id, id)]).filter(Boolean))),
    ...SIAP,
  }
}

// Daftar periode + periode yang sedang dipilih user (default: periode pertama yang belum dikunci)
export function usePeriode() {
  const [periode, setPeriode] = useStore(KEYS.periode, EMPTY_LIST)
  const [aktifId, setAktifId] = useStore(KEYS.periodeAktif, null)
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
const muatSesi = () => { setSesi({ loading: true, error: null })

return api('/api/user').then(
    (user) => setSesi({ user, loading: false, error: null }),
    (error) =>
      setSesi(
        [401, 403].includes(error.status)
          ? { user: null, loading: false, error: null }
          : { loading: false, error },
      ),
  )
}
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
    async login(username, password, captcha) {
      try {
        await api('/login', { method: 'POST', body: { username: username.trim(), password, captcha } })
      } catch (error) {
        return error.message
      }
      await muatSesi()
    },
    async logout() {
      await api('/logout', { method: 'POST' })
      setSesi({ user: null })
    },
    async refresh() {
      await muatSesi()
    },
    // data = { current_password, password, password_confirmation }; error validasi (error.errors) dilempar ke pemanggil
    async gantiPassword(data) {
      await api('/api/user/password', { method: 'PATCH', body: data })
      await muatSesi()
    },
  }
}

// Pengaturan H-n dan notifikasi yang sudah dibaca disimpan per akun di server, jadi sama di semua perangkat
const PREFERENSI_AWAL = { hariPengingat: SEED_PENGINGAT, dibaca: EMPTY_LIST }
const mapPreferensi = (res) => ({ hariPengingat: res.data.hari_pengingat, dibaca: res.data.dibaca })

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
  // Dibagi antara Topbar dan halaman Notifikasi; tiap pemakai memuat ulang dari server saat tampil
  const [{ hariPengingat, dibaca }, setPreferensi] = useStore('epss.preferensi-notifikasi', PREFERENSI_AWAL, false)
  useEffect(() => {
    api('/api/user/notifikasi').then((res) => setPreferensi(mapPreferensi(res)), () => {})
  }, [setPreferensi])
  // Perubahan langsung tampil; dikembalikan jika server menolak
  const simpan = (lokal, body) => {
    const sebelum = { hariPengingat, dibaca }
    setPreferensi({ ...sebelum, ...lokal })
    return api('/api/user/notifikasi', { method: 'PUT', body }).then(
      (res) => setPreferensi(mapPreferensi(res)),
      () => setPreferensi(sebelum),
    )
  }
  const list = notifikasi(kegiatan, hariPengingat, toISODate(new Date()))
  const tandai = (ids) => {
    const baru = ids.filter((id) => !dibaca.includes(id))
    if (baru.length) simpan({ dibaca: [...dibaca, ...baru] }, { dibaca: baru })
  }
  const tandaiDibaca = (id) => tandai([id])
  const tandaiSemuaDibaca = () => tandai(list.map((n) => n.id))
  const setHariPengingat = (hari) => simpan({ hariPengingat: hari }, { hari_pengingat: hari })
  return { list, dibaca, tandaiDibaca, tandaiSemuaDibaca, belumDibaca: list.filter((n) => !dibaca.includes(n.id)).length, hariPengingat, setHariPengingat, ...state }
}
