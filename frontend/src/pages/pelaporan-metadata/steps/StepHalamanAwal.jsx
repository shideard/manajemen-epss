import { useMemo } from 'react'
import PanelRekomendasi from '../components/PanelRekomendasi'
import { cariRekomendasi, judulSiap } from '../lib/rekomendasiHelper'

const LABEL_REKOMENDASI = {
  caraPengumpulan: 'Cara Pengumpulan Data',
  sektorKegiatan: 'Sektor Kegiatan',
}

function StepHalamanAwal({ formData, updateHalamanAwal, terapkanRekomendasi }) {
  const data = formData.halamanAwal

  // Rekomendasi baru muncul setelah judul kegiatan diisi minimal beberapa
  // karakter, supaya saran benar-benar berdasar konteks kegiatan.
  const rekomendasi = useMemo(() => cariRekomendasi(data.judulKegiatan), [data.judulKegiatan])

  const items = useMemo(() => {
    if (!rekomendasi) return []
    return Object.entries(LABEL_REKOMENDASI)
      .filter(([key]) => rekomendasi.preset.predictions[key] !== undefined)
      .map(([key, label]) => ({
        fieldKey: key,
        label,
        nilai: rekomendasi.preset.predictions[key],
        diterapkan: (formData.rekomendasiDiterapkan || []).includes(`halamanAwal.${key}`),
      }))
  }, [rekomendasi, formData.rekomendasiDiterapkan])

  return (
    <div className="flex flex-col gap-8">
      {/* Form Fields */}
      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        {/* Rekomendasi BPS */}
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            Apakah mendapatkan Rekomendasi kegiatan statistik dari BPS?
          </label>
          <div className="flex gap-6">
            {['Ya', 'Tidak'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="rekomendasiBps"
                  value={opt}
                  checked={data.rekomendasiBps === opt}
                  onChange={(e) => updateHalamanAwal('rekomendasiBps', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Judul Kegiatan & Tahun */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label className="block text-[14px] font-bold text-grey-300 mb-1.5">
              Judul Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Isikan judul kegiatan statistik yang dilakukan"
              value={data.judulKegiatan}
              onChange={(e) => updateHalamanAwal('judulKegiatan', e.target.value)}
              className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 placeholder:text-grey-75 focus:border-grey-300 focus:ring-1 focus:ring-grey-300 outline-none transition"
            />
            <p className="mt-1.5 text-[12px] text-grey-100">
              Tulis judul tanpa tahun kegiatan; tahun diisi pada kotak terpisah. Pengecualian
              untuk kegiatan lanjutan atau persiapan (pilot), tahun ditulis melekat pada judul.
            </p>
            {judulSiap(data.judulKegiatan) && !rekomendasi && (
              <p className="mt-1.5 text-[12px] text-grey-100">
                Belum ada kegiatan historis yang mirip judul ini, silakan isi manual.
              </p>
            )}
          </div>
          <div>
            <label className="block text-[14px] font-bold text-grey-300 mb-1.5">
              Tahun <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Isikan Tahun Kegiatan"
              value={data.tahun}
              onChange={(e) => updateHalamanAwal('tahun', e.target.value)}
              className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 placeholder:text-grey-75 focus:border-grey-300 focus:ring-1 focus:ring-grey-300 outline-none transition"
            />
          </div>
        </div>

        {/* Rekomendasi untuk Cara Pengumpulan & Sektor Kegiatan */}
        <PanelRekomendasi
          judulKegiatan={data.judulKegiatan.trim()}
          rekomendasi={rekomendasi}
          items={items}
          onTerapkan={(fieldKey, nilai) => terapkanRekomendasi(fieldKey, nilai, LABEL_REKOMENDASI[fieldKey])}
        />

        {/* Cara Pengumpulan Data */}
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-1.5">
            Cara Pengumpulan Data <span className="text-red-500">*</span>
          </label>
          <select
            value={data.caraPengumpulan}
            onChange={(e) => updateHalamanAwal('caraPengumpulan', e.target.value)}
            className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 bg-white focus:border-grey-300 focus:ring-1 focus:ring-grey-300 outline-none transition"
          >
            <option value="">Pilih Cara Pengumpulan Data</option>
            <option value="Survei">Survei</option>
            <option value="Sensus">Sensus</option>
            <option value="Kompilasi Produk Administrasi">Kompilasi Produk Administrasi</option>
            <option value="Cara Lain Sesuai Perkembangan TI">Cara Lain Sesuai Perkembangan TI</option>
          </select>
        </div>

        {/* Sektor Kegiatan */}
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-1.5">
            Sektor Kegiatan <span className="text-red-500">*</span>
          </label>
          <select
            value={data.sektorKegiatan}
            onChange={(e) => updateHalamanAwal('sektorKegiatan', e.target.value)}
            className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 bg-white focus:border-grey-300 focus:ring-1 focus:ring-grey-300 outline-none transition"
          >
            <option value="">Pilih Sektor Kegiatan</option>
            <option value="Sosial Budaya">Sosial Budaya</option>
            <option value="Ekonomi">Ekonomi</option>
            <option value="Politik Hukum dan Keamanan">Politik Hukum dan Keamanan</option>
            <option value="Pertanian">Pertanian</option>
            <option value="Komunikasi dan Informatika">Komunikasi dan Informatika</option>
            <option value="Kesehatan">Kesehatan</option>
            <option value="Pendidikan">Pendidikan</option>
            <option value="Ketenagakerjaan">Ketenagakerjaan</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default StepHalamanAwal
