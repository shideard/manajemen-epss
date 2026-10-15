import { Sparkles } from 'lucide-react'

function StepBlok4Desain({ formData, updateBlok4 }) {
  const data = formData.blok4

  const handleCheckboxToggle = (field, item) => {
    const list = data[field] || []
    if (list.includes(item)) {
      updateBlok4(field, list.filter((i) => i !== item))
    } else {
      updateBlok4(field, [...list, item])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-grey-50 pb-3">
        <div>
          <h2 className="text-[18px] font-bold text-grey-300">IV. DESAIN KEGIATAN</h2>
          <p className="text-[13px] text-grey-100">Karakteristik pelaksanaan, tipe pendekatan, metode survei, dan unit observasi.</p>
        </div>
        {formData.aiPredictionsApplied && (
          <div className="flex items-center gap-1.5 rounded-full bg-lime-100 border border-lime-300 px-3 py-1 text-[11px] font-bold text-grey-300">
            <Sparkles size={14} className="text-lime-500" />
            <span>Prediksi AI Aktif</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        {/* 4.1. Kegiatan Ini Dilakukan */}
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.1. Kegiatan Ini Dilakukan:
          </label>
          <div className="flex gap-6">
            {['Hanya Sekali', 'Berulang'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="frekuensiKegiatan"
                  value={opt}
                  checked={data.frekuensiKegiatan === opt}
                  onChange={(e) => updateBlok4('frekuensiKegiatan', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4.3. Tipe Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.3. Tipe Pengumpulan Data:
          </label>
          <div className="flex flex-wrap gap-6">
            {['Longitudinal Panel', 'Longitudinal Cross Sectional', 'Cross Sectional'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="tipePengumpulan"
                  value={opt}
                  checked={data.tipePengumpulan === opt}
                  onChange={(e) => updateBlok4('tipePengumpulan', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4.4. Cakupan Wilayah Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.4. Cakupan Wilayah Pengumpulan Data:
          </label>
          <div className="flex flex-wrap gap-6">
            {['Seluruh Wilayah Indonesia', 'Sebagian Wilayah Indonesia'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="cakupanWilayah"
                  value={opt}
                  checked={data.cakupanWilayah === opt}
                  onChange={(e) => updateBlok4('cakupanWilayah', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4.6. Metode Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.6. Metode Pengumpulan Data:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Wawancara',
              'Mengisi Kuesioner Sendiri',
              'Pengamatan',
              'Pengumpulan Data Sekunder',
              'Lainnya',
            ].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="checkbox"
                  checked={data.metodePengumpulan?.includes(opt)}
                  onChange={() => handleCheckboxToggle('metodePengumpulan', opt)}
                  className="size-4 rounded text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4.7. Sarana Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.7. Sarana Pengumpulan Data:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Paper-assisted Personal Interviewing (PAPI)',
              'Computer-assisted Personal Interviewing (CAPI)',
              'Computer-assisted Telephones Interviewing (CATI)',
              'Computer Aided Web Interviewing (CAWI)',
              'Mail',
              'Lainnya',
            ].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="checkbox"
                  checked={data.saranaPengumpulan?.includes(opt)}
                  onChange={() => handleCheckboxToggle('saranaPengumpulan', opt)}
                  className="size-4 rounded text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4.8. Unit Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.8. Unit Pengumpulan Data:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {['Individu', 'Rumah Tangga', 'Usaha/Perusahaan', 'Lainnya'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="checkbox"
                  checked={data.unitPengumpulan?.includes(opt)}
                  onChange={() => handleCheckboxToggle('unitPengumpulan', opt)}
                  className="size-4 rounded text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok4Desain
