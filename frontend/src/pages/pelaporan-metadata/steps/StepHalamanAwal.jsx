import { Sparkles, Check } from 'lucide-react'
import { AI_PREDICTION_PRESETS } from '../metadataData'

function StepHalamanAwal({ formData, updateHalamanAwal, applyPrediction }) {
  const data = formData.halamanAwal

  return (
    <div className="flex flex-col gap-8">
      {/* AI Recommendation Banner / Feature Showcase */}
      <div className="relative overflow-hidden rounded-2xl border border-lime-300 bg-lime-100/60 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-grey-300 text-lime-300 shadow">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-bold text-grey-300">
                  Fitur Rekomendasi Prediksi Otomatis (AI Metadata Assistant)
                </h3>
              </div>
              <p className="mt-1 text-[13px] text-grey-100">
                Ketikkan judul kegiatan atau pilih sampel di bawah. Model prediksi akan merekomendasikan opsi tertentu secara otomatis.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!data.judulKegiatan) {
                applyPrediction(AI_PREDICTION_PRESETS[0])
              } else {
                // Cari match terdekat atau default preset
                const match = AI_PREDICTION_PRESETS.find((p) =>
                  p.keywordMatch.some((k) => data.judulKegiatan.toLowerCase().includes(k))
                ) ?? AI_PREDICTION_PRESETS[0]
                applyPrediction(match)
              }
            }}
            className="flex shrink-0 items-center gap-2 self-start rounded-full bg-grey-300 px-5 py-2.5 text-[13px] font-bold text-lime-300 shadow-md transition hover:bg-grey-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles size={16} />
            Prediksi Isian dari Judul
          </button>
        </div>

        {/* Quick Sample Selector */}
        <div className="mt-4 pt-4 border-t border-lime-200/80">
          <p className="text-[11px] font-semibold tracking-wider text-grey-100 uppercase">
            Coba Contoh Judul Kegiatan Historis:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AI_PREDICTION_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPrediction(preset)}
                className="flex items-center gap-1.5 rounded-lg border border-lime-300 bg-white/90 px-3 py-1.5 text-left text-[12px] font-medium text-grey-200 shadow-xs hover:border-grey-300 hover:bg-white"
              >
                <span>{preset.sampleTitle}</span>
                <span className="rounded bg-lime-200 px-1.5 py-0.2 text-[10px] font-bold text-lime-500">
                  {preset.confidence}
                </span>
              </button>
            ))}
          </div>
        </div>

        {formData.aiPredictionsApplied && (
          <div className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
            <Check size={16} className="text-emerald-600" />
            <span>Rekomendasi berhasil diterapkan ({formData.aiConfidence} akurasi)! Silakan tinjau blok-blok selanjutnya.</span>
          </div>
        )}
      </div>

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
