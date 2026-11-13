import { useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { JADWAL_GRUP, buatBarisJadwal } from '../metadataData'

const OPSI_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// Nilai pembanding urutan jadwal: pakai bulan-tahun (YYYY-MM) sesuai INDAH.
// Tanggal (hari) hanya pelengkap dan tidak ikut menentukan urutan.
function kunciBulan(bulan, tahun) {
  if (!bulan || !tahun) return ''
  return `${tahun}-${bulan}`
}

// Urutan baku tahapan (A1 -> D7). Baris tambahan menempel pada tahapan
// induknya (mis. 2a, 2b) sehingga ikut di antara induk dan tahapan berikutnya.
function urutkanJadwal(jadwal) {
  const utama = jadwal.filter((j) => !j.indukId)
  const anak = jadwal.filter((j) => j.indukId)
  return [...utama, ...anak].sort((a, b) => {
    const pa = utama.findIndex((u) => u.id === (a.indukId || a.id))
    const pb = utama.findIndex((u) => u.id === (b.indukId || b.id))
    if (pa !== pb) return pa - pb
    if (!a.indukId) return -1
    if (!b.indukId) return 1
    return a.id - b.id
  })
}

function StepBlok3Perencanaan({ formData, updateBlok3 }) {
  const data = formData.blok3

  // Baris jadwal lama yang sudah disentuh, supaya penanda wajib tidak muncul
  // serentak saat form baru dibuka. Wajib tetap dicek apa adanya untuk baris
  // tambahan (yang sengaja ditambahkan pengguna) dan saat pengguna menekan
  // tombol validasi di bawah tabel.
  const [jadwalTouched, setJadwalTouched] = useState({})
  // Karenanya peringatan tidak hilang saat pindah step lalu kembali.
  // Sama seperti `variabelTouched`, state ini mengikuti komponen: hilang saat
  // wizard dibuka ulang atau berganti draft.
  const [jadwalDivalidasi, setJadwalDivalidasi] = useState(false)
  // Field variabel yang sudah disentuh, kuncinya `${id}.${field}`.
  const [variabelTouched, setVariabelTouched] = useState({})

  const jadwalUrut = useMemo(() => urutkanJadwal(data.jadwal || []), [data.jadwal])

  // Nomor tampilan: baris baku "1", baris tambahan "1a", "1b", ...
  const nomorTampil = useMemo(() => {
    const hasil = {}
    const counter = {}
    const utama = jadwalUrut.filter((j) => !j.indukId)
    utama.forEach((j, idx) => {
      counter[j.id] = 0
      hasil[j.id] = j.kode || String(idx + 1)
    })
    jadwalUrut
      .filter((j) => j.indukId)
      .forEach((j) => {
        const induk = utama.find((u) => u.id === j.indukId)
        if (!induk) return
        counter[induk.id] += 1
        hasil[j.id] = `${hasil[induk.id].replace(/[a-z]+$/, '')}${String.fromCharCode(96 + counter[induk.id])}`
      })
    return hasil
  }, [jadwalUrut])

  const tahapanSebelum = (id) => {
    const idx = jadwalUrut.findIndex((j) => j.id === id)
    return idx > 0 ? jadwalUrut[idx - 1] : null
  }

  // Peta tahapan yang urutannya bertabrakan. Pasangan yang salah bukan hanya
  // baris yang lebih awal: baris yang "dinobatkan" sebelum dirinya juga ikut
  // salah (relasinya bertentangan), dan rentang yang terlanda ikut ditandai.
  // Contoh 1=Jun, 2=Mar (salah), 3=Jan, 4=Feb (Feb > Mar, jadi lolos cek
  // tetangga) -> keempat tahapan ditandai supaya tidak ada yang terlewat.
  const bentrokUrut = useMemo(() => {
    const info = jadwalUrut.map((item) => ({
      item,
      mulai: kunciBulan(item.mulaiBulan, item.mulaiTahun),
      selesai: kunciBulan(item.selesaiBulan, item.selesaiTahun),
    }))
    const peta = {}
    const kunci = (a, i) => {
      if (info[i].mulai && !peta[a.item.id]) peta[a.item.id] = { dengan: info[i].item.tahapan }
      if (info[i].mulai && !peta[info[i].item.id]) peta[info[i].item.id] = { dengan: a.item.tahapan }
    }
    for (let i = 0; i < info.length; i += 1) {
      const a = info[i]
      if (!a.mulai) continue
      for (let j = 0; j < i; j += 1) {
        const b = info[j]
        if (!b.mulai) continue
        if (a.mulai < b.mulai) kunci(a, i)
        if (b.mulai > a.mulai) kunci(b, i)
        if (b.selesai && a.mulai < b.selesai) kunci(a, i)
      }
    }
    return peta
  }, [jadwalUrut])

  // Ringkasan 3.3: hitung tahapan yang belum lengkap atau urutannya salah.
  // Dipakai untuk pesan di atas tabel dan untuk menandai saat dicek.
  const jumlahJadwalBermasalah = useMemo(
    () =>
      jadwalUrut.filter((item, idx) => {
        const sebelum = idx > 0 ? jadwalUrut[idx - 1] : null
        const kunciMulai = kunciBulan(item.mulaiBulan, item.mulaiTahun)
        const kunciSelesai = kunciBulan(item.selesaiBulan, item.selesaiTahun)
        const kunciSebelum = sebelum ? kunciBulan(sebelum.mulaiBulan, sebelum.mulaiTahun) : ''
        return (
          !kunciMulai ||
          !kunciSelesai ||
          Boolean(kunciSebelum && kunciMulai < kunciSebelum) ||
          kunciSelesai < kunciMulai ||
          Boolean(bentrokUrut[item.id])
        )
      }).length,
    [jadwalUrut, bentrokUrut]
  )

  const handleJadwalChange = (id, field, value) => {
    setJadwalTouched((prev) => (prev[id] ? prev : { ...prev, [id]: true }))
    const newJadwal = data.jadwal.map((j) => (j.id === id ? { ...j, [field]: value } : j))
    updateBlok3('jadwal', newJadwal)
  }

  // Tanggal (hari) opsional: kalau diisi, bulan & tahun mengikuti tanggal
  // supaya isian bulan-tahun dan tanggal tidak saling bertentangan.
  const handleJadwalTanggalChange = (item, jenis, value) => {
    const fieldBulan = jenis === 'mulai' ? 'mulaiBulan' : 'selesaiBulan'
    const fieldTahun = jenis === 'mulai' ? 'mulaiTahun' : 'selesaiTahun'
    setJadwalTouched((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }))
    const newJadwal = data.jadwal.map((j) =>
      j.id === item.id
        ? {
            ...j,
            [jenis]: value,
            ...(value ? { [fieldTahun]: value.slice(0, 4), [fieldBulan]: value.slice(5, 7) } : {}),
          }
        : j
    )
    updateBlok3('jadwal', newJadwal)
  }

  const handleAddJadwal = (induk) => {
    const id = Math.max(0, ...data.jadwal.map((j) => j.id || 0)) + 1
    const newJadwal = [
      ...data.jadwal,
      buatBarisJadwal(id, induk.grup, '', '', { indukId: induk.id }),
    ]
    updateBlok3('jadwal', newJadwal)
  }

  const handleRemoveJadwal = (id) => {
    updateBlok3(
      'jadwal',
      data.jadwal.filter((j) => j.id !== id && j.indukId !== id)
    )
  }

  const handleAddVariabel = () => {
    const newVariabel = [
      ...data.variabel,
      {
        id: Date.now(),
        nama: '',
        konsep: '',
        definisi: '',
        referensiWaktu: '',
      },
    ]
    updateBlok3('variabel', newVariabel)
  }

  const handleVariabelChange = (id, field, value) => {
    setVariabelTouched((prev) => {
      const kunci = `${id}.${field}`
      return prev[kunci] ? prev : { ...prev, [kunci]: true }
    })
    const newVariabel = data.variabel.map((v) =>
      v.id === id ? { ...v, [field]: value } : v
    )
    updateBlok3('variabel', newVariabel)
  }

  const handleRemoveVariabel = (id) => {
    if (data.variabel.length <= 1) return
    const newVariabel = data.variabel.filter((v) => v.id !== id)
    updateBlok3('variabel', newVariabel)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-grey-50 pb-3">
        <h2 className="text-[18px] font-bold text-grey-300">III. PERENCANAAN DAN PERSIAPAN</h2>
        <p className="text-[13px] text-grey-100">Uraian latar belakang, tujuan, timeline pelaksanaan tahapan, dan karakteristik variabel data.</p>
      </div>

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-1.5">
            3.1. Latar Belakang Kegiatan <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan latar belakang kegiatan statistik"
            value={data.latarBelakang}
            onChange={(e) => updateBlok3('latarBelakang', e.target.value)}
            className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-1.5">
            3.2. Tujuan Kegiatan <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Tuliskan tujuan kegiatan statistik"
            value={data.tujuan}
            onChange={(e) => updateBlok3('tujuan', e.target.value)}
            className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
          />
        </div>

        {/* 3.3. Rencana Jadwal Kegiatan */}
        <div>
          <h3 className="text-[14px] font-bold text-grey-300 mb-2">3.3. Rencana Jadwal Kegiatan</h3>
          <p className="text-[12px] text-grey-100 mb-3">
            Bulan dan tahun wajib diisi; tanggal (hari) boleh dikosongkan. Tahapan wajib berurutan: bulan mulai
            tiap tahapan tidak boleh lebih awal dari tahapan sebelumnya.
          </p>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setJadwalDivalidasi(true)}
              className="rounded-lg border border-grey-75 bg-white px-3 py-1.5 text-[12px] font-semibold text-grey-300 hover:bg-grey2-75 transition"
            >
              Periksa kelengkapan jadwal
            </button>
            {jadwalDivalidasi && jumlahJadwalBermasalah > 0 && (
              <span className="text-[12px] font-semibold text-red-500">
                {jumlahJadwalBermasalah} tahapan perlu dilengkapi/diperbaiki.
              </span>
            )}
            {jadwalDivalidasi && jumlahJadwalBermasalah === 0 && (
              <span className="text-[12px] font-semibold text-emerald-600">
                Semua tahapan sudah lengkap dan berurutan.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {JADWAL_GRUP.map((grup) => {
              const barisUtama = jadwalUrut.filter((j) => !j.indukId && j.grup === grup.kode)
              if (barisUtama.length === 0) return null
              // Susun per blok: induk + anak-anaknya.
              const barisGrup = barisUtama.flatMap((induk) => [
                induk,
                ...jadwalUrut.filter((j) => j.indukId === induk.id),
              ])

              return (
                <div key={grup.kode} className="overflow-x-auto rounded-xl border border-grey-50">
                  <div className="bg-grey2-75 px-4 py-2 text-[13px] font-bold text-grey-300 border-b border-grey-50">
                    {grup.kode}. {grup.nama}
                  </div>
                  <table className="w-full text-left text-[13px]">
                    <thead className="text-grey-300 font-semibold border-b border-grey-50">
                      <tr>
                        <th className="py-2.5 px-3 w-14 text-center">No</th>
                        <th className="py-2.5 px-3">Tahapan Kegiatan</th>
                        <th className="py-2.5 px-3">Mulai (bulan & tahun)</th>
                        <th className="py-2.5 px-3">Selesai (bulan & tahun)</th>
                        <th className="py-2.5 px-3 w-20 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-50">
                      {barisGrup.map((item) => {
                        const isTambahan = Boolean(item.indukId)
                        const induk = isTambahan ? barisUtama.find((u) => u.id === item.indukId) || item : item
                        const sebelum = tahapanSebelum(item.id)
                        const kunciMulai = kunciBulan(item.mulaiBulan, item.mulaiTahun)
                        const kunciSelesai = kunciBulan(item.selesaiBulan, item.selesaiTahun)
                        const kunciSebelum = sebelum
                          ? kunciBulan(sebelum.mulaiBulan, sebelum.mulaiTahun)
                          : ''
                        const salahUrut =
                          kunciMulai && kunciSebelum && kunciMulai < kunciSebelum
                        const salahRentang =
                          kunciMulai && kunciSelesai && kunciSelesai < kunciMulai
                        const wajibMulai =
                          (Boolean(jadwalTouched[item.id]) || jadwalDivalidasi || isTambahan) &&
                          (!item.mulaiBulan || !item.mulaiTahun)
                        const wajibSelesai =
                          (Boolean(jadwalTouched[item.id]) || jadwalDivalidasi || isTambahan) &&
                          (!item.selesaiBulan || !item.selesaiTahun)
                        const urutBermasalah = Boolean(bentrokUrut[item.id])

                        return (
                          <tr key={item.id} className="hover:bg-grey2-75/40 align-top">
                            <td className="py-2 px-3 text-center font-medium text-grey-100">
                              {nomorTampil[item.id]}
                            </td>
                            <td className="py-2 px-3">
                              {isTambahan ? (
                                <input
                                  type="text"
                                  placeholder="Nama tahapan"
                                  value={item.tahapan}
                                  onChange={(e) => handleJadwalChange(item.id, 'tahapan', e.target.value)}
                                  className="w-full rounded-lg border border-grey-75/50 px-2.5 py-1.5 text-[13px] text-grey-300 outline-none focus:border-grey-300"
                                />
                              ) : (
                                <span className="font-medium text-grey-300">{item.tahapan}</span>
                              )}
                            </td>
                            <td className="py-2 px-3 min-w-[220px]">
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={item.mulaiBulan}
                                  onChange={(e) => handleJadwalChange(item.id, 'mulaiBulan', e.target.value)}
                                  className={`flex-1 min-w-0 rounded-lg border px-2 py-1.5 text-[13px] text-grey-300 outline-none ${
                                    urutBermasalah ? 'border-red-400' : 'border-grey-75/50 focus:border-grey-300'
                                  }`}
                                >
                                  <option value="">Bulan</option>
                                  {OPSI_BULAN.map((nama, idx) => (
                                    <option key={nama} value={String(idx + 1).padStart(2, '0')}>
                                      {nama}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min="1900"
                                  max="2999"
                                  placeholder="Tahun"
                                  value={item.mulaiTahun}
                                  onChange={(e) => handleJadwalChange(item.id, 'mulaiTahun', e.target.value)}
                                  className={`w-[74px] rounded-lg border px-2 py-1.5 text-[13px] text-grey-300 outline-none ${
                                    urutBermasalah ? 'border-red-400' : 'border-grey-75/50 focus:border-grey-300'
                                  }`}
                                />
                              </div>
                              <input
                                type="date"
                                title="Tanggal (opsional)"
                                value={item.mulai}
                                onChange={(e) => handleJadwalTanggalChange(item, 'mulai', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-grey-75/50 px-2 py-1 text-[12px] text-grey-100 outline-none focus:border-grey-300"
                              />
                              <p className="text-[10px] text-grey-75 mt-0.5">Tanggal opsional</p>
                            </td>
                            <td className="py-2 px-3 min-w-[220px]">
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={item.selesaiBulan}
                                  onChange={(e) => handleJadwalChange(item.id, 'selesaiBulan', e.target.value)}
                                  className={`flex-1 min-w-0 rounded-lg border px-2 py-1.5 text-[13px] text-grey-300 outline-none ${
                                    wajibSelesai || salahRentang ? 'border-red-400' : 'border-grey-75/50 focus:border-grey-300'
                                  }`}
                                >
                                  <option value="">Bulan</option>
                                  {OPSI_BULAN.map((nama, idx) => (
                                    <option key={nama} value={String(idx + 1).padStart(2, '0')}>
                                      {nama}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min="1900"
                                  max="2999"
                                  placeholder="Tahun"
                                  value={item.selesaiTahun}
                                  onChange={(e) => handleJadwalChange(item.id, 'selesaiTahun', e.target.value)}
                                  className={`w-[74px] rounded-lg border px-2 py-1.5 text-[13px] text-grey-300 outline-none ${
                                    wajibSelesai || salahRentang ? 'border-red-400' : 'border-grey-75/50 focus:border-grey-300'
                                  }`}
                                />
                              </div>
                              <input
                                type="date"
                                title="Tanggal (opsional)"
                                value={item.selesai}
                                onChange={(e) => handleJadwalTanggalChange(item, 'selesai', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-grey-75/50 px-2 py-1 text-[12px] text-grey-100 outline-none focus:border-grey-300"
                              />
                              <p className="text-[10px] text-grey-75 mt-0.5">Tanggal opsional</p>
                              {(wajibMulai || wajibSelesai) && (
                                <p className="text-[11px] text-red-500 mt-1">Bulan & tahun wajib diisi.</p>
                              )}
                              {salahRentang && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  Tidak boleh lebih awal dari bulan mulai.
                                </p>
                              )}
                              {salahUrut && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  Tidak boleh lebih awal dari tahapan sebelumnya ({sebelum.tahapan}).
                                </p>
                              )}
                              {urutBermasalah && !salahUrut && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  Urutan bulan bertabrakan dengan {urutBermasalah.dengan}.
                                </p>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleAddJadwal(induk)}
                                  title="Tambah tahapan"
                                  className="text-grey-100 hover:text-black bg-lime-100 hover:bg-lime-200 p-1 rounded-md transition"
                                >
                                  <Plus size={14} />
                                </button>
                                {isTambahan && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveJadwal(item.id)}
                                    title="Hapus tahapan"
                                    className="text-grey-75 hover:text-red-500 p-1 transition"
                                  >
                                    <X size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3.4. Variabel yang Dikumpulkan */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-bold text-grey-300">
              3.4. Variabel (Karakteristik) yang Dikumpulkan
            </h3>
            <button
              type="button"
              onClick={handleAddVariabel}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-grey-300 hover:text-black bg-lime-100 hover:bg-lime-200 px-3 py-1.5 rounded-lg transition"
            >
              <Plus size={15} />
              Tambah Variabel
            </button>
          </div>

          <p className="text-[12px] text-grey-100 mb-3">
            Nama variabel, konsep, definisi, dan referensi waktu (periode enumerasi) wajib diisi untuk setiap baris
            yang digunakan. Contoh referensi waktu: "setahun yang lalu", "seminggu terakhir", "2025".
          </p>

          <div className="overflow-x-auto rounded-xl border border-grey-50">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-grey2-75 text-grey-300 font-semibold border-b border-grey-50">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Nama Variabel</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Konsep</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Definisi</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Referensi Waktu</th>
                  <th className="py-2.5 px-3 w-12 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-50">
                {data.variabel.map((v, idx) => {
                  // Baris dianggap dipakai bila salah satu isiannya terisi.
                  const barisTerisi = ['nama', 'konsep', 'definisi', 'referensiWaktu'].some(
                    (f) => String(v[f] || '').trim() !== ''
                  )
                  const wajib = (field) =>
                    (barisTerisi || variabelTouched[`${v.id}.${field}`]) && !String(v[field] || '').trim()
                  const kelasInput = (field) =>
                    `w-full rounded-lg border px-2.5 py-1.5 text-[13px] outline-none ${
                      wajib(field) ? 'border-red-400' : 'border-grey-75/50 focus:border-grey-300'
                    }`

                  return (
                    <tr key={v.id || idx} className="align-top">
                      <td className="py-2 px-3 text-center font-medium text-grey-100">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Nama variabel"
                          value={v.nama}
                          onChange={(e) => handleVariabelChange(v.id, 'nama', e.target.value)}
                          className={kelasInput('nama')}
                        />
                        {wajib('nama') && <p className="text-[11px] text-red-500 mt-1">Wajib diisi.</p>}
                      </td>
                      <td className="py-2 px-3">
                        <textarea
                          rows={2}
                          placeholder="Konsep"
                          value={v.konsep}
                          onChange={(e) => handleVariabelChange(v.id, 'konsep', e.target.value)}
                          className={kelasInput('konsep')}
                        />
                        {wajib('konsep') && <p className="text-[11px] text-red-500 mt-1">Wajib diisi.</p>}
                      </td>
                      <td className="py-2 px-3">
                        <textarea
                          rows={2}
                          placeholder="Definisi operasional"
                          value={v.definisi}
                          onChange={(e) => handleVariabelChange(v.id, 'definisi', e.target.value)}
                          className={kelasInput('definisi')}
                        />
                        {wajib('definisi') && <p className="text-[11px] text-red-500 mt-1">Wajib diisi.</p>}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Minggu lalu"
                          value={v.referensiWaktu}
                          onChange={(e) => handleVariabelChange(v.id, 'referensiWaktu', e.target.value)}
                          className={kelasInput('referensiWaktu')}
                        />
                        {wajib('referensiWaktu') && (
                          <p className="text-[11px] text-red-500 mt-1">Wajib diisi.</p>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariabel(v.id)}
                          disabled={data.variabel.length <= 1}
                          className="text-grey-75 hover:text-red-500 disabled:opacity-30 disabled:hover:text-grey-75 p-1 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok3Perencanaan
