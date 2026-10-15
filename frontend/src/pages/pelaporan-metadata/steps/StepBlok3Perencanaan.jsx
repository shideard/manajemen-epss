import { Plus, Trash2 } from 'lucide-react'

function StepBlok3Perencanaan({ formData, updateBlok3 }) {
  const data = formData.blok3

  const handleJadwalChange = (index, field, value) => {
    const newJadwal = [...data.jadwal]
    newJadwal[index] = { ...newJadwal[index], [field]: value }
    updateBlok3('jadwal', newJadwal)
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
          <div className="overflow-x-auto rounded-xl border border-grey-50">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-grey2-75 text-grey-300 font-semibold border-b border-grey-50">
                <tr>
                  <th className="py-2.5 px-4 w-1/2">Tahapan Kegiatan</th>
                  <th className="py-2.5 px-4">Tanggal Mulai</th>
                  <th className="py-2.5 px-4">Tanggal Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-50">
                {data.jadwal.map((item, idx) => (
                  <tr key={idx} className="hover:bg-grey2-75/40">
                    <td className="py-2.5 px-4 font-medium text-grey-300">{item.tahapan}</td>
                    <td className="py-2 px-4">
                      <input
                        type="date"
                        value={item.mulai}
                        onChange={(e) => handleJadwalChange(idx, 'mulai', e.target.value)}
                        className="w-full rounded-lg border border-grey-75/50 px-3 py-1.5 text-[13px] text-grey-300 focus:border-grey-300 outline-none"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="date"
                        value={item.selesai}
                        onChange={(e) => handleJadwalChange(idx, 'selesai', e.target.value)}
                        className="w-full rounded-lg border border-grey-75/50 px-3 py-1.5 text-[13px] text-grey-300 focus:border-grey-300 outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
