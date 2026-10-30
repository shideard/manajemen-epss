import { Sparkles } from 'lucide-react'
import SaranPill from '../components/SaranPill'
import { getSaranUntukOpsi } from '../lib/saranHelper'

function StepBlok7Pengolahan({ formData, updateBlok7, caraPengumpulan }) {
  const data = formData.blok7
  const saranUntuk = (field, opsi) => getSaranUntukOpsi(`blok7.${field}`, caraPengumpulan, opsi)

  const handleTahapanToggle = (key, value) => {
    updateBlok7('tahapanPengolahan', {
      ...data.tahapanPengolahan,
      [key]: value,
    })
  }

  const handleCheckboxToggle = (field, item) => {
    const list = data[field] || []
    if (list.includes(item)) {
      updateBlok7(field, list.filter((i) => i !== item))
    } else {
      updateBlok7(field, [...list, item])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-grey-50 pb-3">
        <div>
          <h2 className="text-[18px] font-bold text-grey-300">VII. PENGOLAHAN DAN ANALISIS</h2>
          <p className="text-[13px] text-grey-100">Tahapan pembersihan data, metode analisis statistik, dan level penyajian hasil.</p>
        </div>
        {formData.aiPredictionsApplied && (
          <div className="flex items-center gap-1.5 rounded-full bg-lime-100 border border-lime-300 px-3 py-1 text-[11px] font-bold text-grey-300">
            <Sparkles size={14} className="text-lime-500" />
            <span>Prediksi AI Aktif</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        {/* 7.1. Tahapan Pengolahan Data */}
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-3">
            7.1. Tahapan Pengolahan Data:
          </label>
          <div className="flex flex-col gap-3.5 max-w-md">
            {[
              { key: 'editing', label: 'Penyuntingan (Editing)' },
              { key: 'coding', label: 'Penyandian (Coding)' },
              { key: 'dataEntry', label: 'Data Entry' },
              { key: 'validasi', label: 'Penyahihan (Validasi)' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4 py-1 border-b border-grey-50/70 last:border-0">
                <span className="text-[14px] text-grey-300">{label}</span>
                <div className="flex gap-4">
                  {['Ya', 'Tidak'].map((val) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-[13px] font-medium text-grey-200">
                      <input
                        type="radio"
                        name={`tahapan_${key}`}
                        value={val}
                        checked={data.tahapanPengolahan?.[key] === val}
                        onChange={() => handleTahapanToggle(key, val)}
                        className="size-4 text-grey-300 focus:ring-lime-300"
                      />
                      <span>{val}</span>
                      <SaranPill saran={saranUntuk(`tahapanPengolahan.${key}`, val)} />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7.2. Metode Analisis */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            7.2. Metode Analisis:
          </label>
          <div className="flex flex-wrap gap-6">
            {['Deskriptif', 'Inferensia', 'Deskriptif Dan Inferensia'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="metodeAnalisis"
                  value={opt}
                  checked={data.metodeAnalisis === opt}
                  onChange={(e) => updateBlok7('metodeAnalisis', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <SaranPill saran={saranUntuk('metodeAnalisis', opt)} />
              </label>
            ))}
          </div>
        </div>

        {/* 7.3. Unit Analisis */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            7.3. Unit Analisis:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {['Individu', 'Rumah Tangga', 'Usaha/Perusahaan', 'Lainnya'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="checkbox"
                  checked={data.unitAnalisis?.includes(opt)}
                  onChange={() => handleCheckboxToggle('unitAnalisis', opt)}
                  className="size-4 rounded text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 7.4. Tingkat Penyajian Hasil Analisis */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            7.4. Tingkat Penyajian Hasil Analisis:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {['Nasional', 'Provinsi', 'Kabupaten/Kota', 'Lainnya'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="checkbox"
                  checked={data.tingkatPenyajian?.includes(opt)}
                  onChange={() => handleCheckboxToggle('tingkatPenyajian', opt)}
                  className="size-4 rounded text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <SaranPill saran={saranUntuk('tingkatPenyajian', opt)} />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok7Pengolahan
