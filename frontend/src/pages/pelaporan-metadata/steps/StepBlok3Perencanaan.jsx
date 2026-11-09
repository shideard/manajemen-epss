import { useMemo } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { JADWAL_GRUP } from '../metadataData'

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

  const handleJadwalChange = (id, field, value) => {
    const newJadwal = data.jadwal.map((j) => (j.id === id ? { ...j, [field]: value } : j))
    updateBlok3('jadwal', newJadwal)
  }

  const handleAddJadwal = (induk) => {
    const id = Math.max(0, ...data.jadwal.map((j) => j.id || 0)) + 1
    const newJadwal = [
      ...data.jadwal,
      { id, grup: induk.grup, kode: '', tahapan: '', mulai: '', selesai: '', indukId: induk.id },
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
            Tahapan wajib berurutan: tanggal mulai tiap tahapan tidak boleh lebih awal dari tanggal mulai tahapan
            sebelumnya.
          </p>

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
                        <th className="py-2.5 px-3">Tanggal Mulai</th>
                        <th className="py-2.5 px-3">Tanggal Selesai</th>
                        <th className="py-2.5 px-3 w-20 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-50">
                      {barisGrup.map((item) => {
                        const isTambahan = Boolean(item.indukId)
                        const induk = isTambahan ? barisUtama.find((u) => u.id === item.indukId) || item : item
                        const sebelum = tahapanSebelum(item.id)
                        const salahUrut =
                          item.mulai && sebelum?.mulai && item.mulai < sebelum.mulai
                        const salahRentang =
                          item.mulai && item.selesai && item.selesai < item.mulai

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
                            <td className="py-2 px-3">
                              <input
                                type="date"
                                value={item.mulai}
                                onChange={(e) => handleJadwalChange(item.id, 'mulai', e.target.value)}
                                className={`w-full rounded-lg border px-3 py-1.5 text-[13px] text-grey-300 outline-none ${
                                  salahUrut ? 'border-red-400' : 'border-grey-75/50 focus:border-grey-300'
                                }`}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="date"
                                value={item.selesai}
                                min={item.mulai || undefined}
                                onChange={(e) => handleJadwalChange(item.id, 'selesai', e.target.value)}
                                className={`w-full rounded-lg border px-3 py-1.5 text-[13px] text-grey-300 outline-none ${
                                  salahRentang ? 'border-red-400' : 'border-grey-75/50 focus:border-grey-300'
                                }`}
                              />
                              {salahRentang && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  Tidak boleh lebih awal dari tanggal mulai.
                                </p>
                              )}
                              {salahUrut && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  Tidak boleh lebih awal dari tahapan sebelumnya ({sebelum.tahapan}).
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

          <div className="overflow-x-auto rounded-xl border border-grey-50">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-grey2-75 text-grey-300 font-semibold border-b border-grey-50">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Nama Variabel</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Konsep</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Definisi</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Referensi Waktu</th>
                  <th className="py-2.5 px-3 w-12 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-50">
                {data.variabel.map((v, idx) => (
                  <tr key={v.id || idx}>
                    <td className="py-2 px-3 text-center font-medium text-grey-100">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        placeholder="Nama variabel"
                        value={v.nama}
                        onChange={(e) => handleVariabelChange(v.id, 'nama', e.target.value)}
                        className="w-full rounded-lg border border-grey-75/50 px-2.5 py-1.5 text-[13px] outline-none focus:border-grey-300"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <textarea
                        rows={2}
                        placeholder="Konsep"
                        value={v.konsep}
                        onChange={(e) => handleVariabelChange(v.id, 'konsep', e.target.value)}
                        className="w-full rounded-lg border border-grey-75/50 px-2.5 py-1.5 text-[13px] outline-none focus:border-grey-300"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <textarea
                        rows={2}
                        placeholder="Definisi operasional"
                        value={v.definisi}
                        onChange={(e) => handleVariabelChange(v.id, 'definisi', e.target.value)}
                        className="w-full rounded-lg border border-grey-75/50 px-2.5 py-1.5 text-[13px] outline-none focus:border-grey-300"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        placeholder="Thn/Bln"
                        value={v.referensiWaktu}
                        onChange={(e) => handleVariabelChange(v.id, 'referensiWaktu', e.target.value)}
                        className="w-full rounded-lg border border-grey-75/50 px-2.5 py-1.5 text-[13px] outline-none focus:border-grey-300"
                      />
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok3Perencanaan
