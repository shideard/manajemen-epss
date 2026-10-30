import { Sparkles } from 'lucide-react'

const OPSI_RANCANGAN = ['Single Stage Atau Phase', 'Multi Stage Atau Phase']

const OPSI_METODE_PEMILIHAN = ['Sampel Probabilitas', 'Sampel Nonprobabilitas']

const OPSI_METODE_PROBABILITAS = [
  'Simple Random Sampling',
  'Systematic Random Sampling',
  'Stratified Random Sampling',
  'Cluster Sampling',
  'Probability Proportional to Size Sampling',
]

const OPSI_METODE_NONPROBABILITAS = [
  'Quota Sampling',
  'Accidental Sampling',
  'Purposive Sampling',
  'Snowball Sampling',
  'Saturation Sampling',
]

const OPSI_KERANGKA_SAMPEL = ['List Frame', 'Area Frame']

function StepBlok5DesainSampel({ formData, updateBlok5 }) {
  const data = formData.blok5 || {}
  const isProbabilitas = data.metodePemilihanSampel === 'Sampel Probabilitas'
  const opsiMetodeSampel = isProbabilitas ? OPSI_METODE_PROBABILITAS : OPSI_METODE_NONPROBABILITAS

  // Daftar opsi 5.3 berganti total antar cabang, jadi nilai lama dikosongkan
  // agar tidak tersimpan pilihan yang tidak berlaku.
  const handleMetodePemilihanChange = (val) => {
    const cabangBerubah =
      (val === 'Sampel Probabilitas') !== (data.metodePemilihanSampel === 'Sampel Probabilitas')

    updateBlok5('metodePemilihanSampel', val)
    if (cabangBerubah && data.metodeSampel) {
      updateBlok5('metodeSampel', '')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-grey-50 pb-3">
        <div>
          <h2 className="text-[18px] font-bold text-grey-300">V. DESAIN SAMPEL</h2>
          <p className="text-[13px] text-grey-100">
            Rancangan sampel, metode pemilihan, kerangka sampel, dan unit observasi kegiatan survei.
          </p>
        </div>
        {formData.aiPredictionsApplied && (
          <div className="flex items-center gap-1.5 rounded-full bg-lime-100 border border-lime-300 px-3 py-1 text-[11px] font-bold text-grey-300">
            <Sparkles size={14} className="text-lime-500" />
            <span>Prediksi AI Aktif</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        {/* 5.1. Jenis Rancangan Sampel */}
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            5.1. Jenis Rancangan Sampel:
          </label>
          <div className="flex flex-wrap gap-6">
            {OPSI_RANCANGAN.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="rancanganSampel"
                  value={opt}
                  checked={data.rancanganSampel === opt}
                  onChange={(e) => updateBlok5('rancanganSampel', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 5.2. Metode Pemilihan Sampel Tahap Terakhir */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            5.2. Metode Pemilihan Sampel Tahap Terakhir:
          </label>
          <div className="flex flex-wrap gap-6">
            {OPSI_METODE_PEMILIHAN.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="metodePemilihanSampel"
                  value={opt}
                  checked={data.metodePemilihanSampel === opt}
                  onChange={(e) => handleMetodePemilihanChange(e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 5.3. Metode yang Digunakan (opsi mengikuti 5.2) */}
        {data.metodePemilihanSampel && (
          <div className="border-t border-grey-50 pt-5">
            <label className="block text-[14px] font-bold text-grey-300 mb-2">
              5.3. Metode yang Digunakan{' '}
              <span className="font-medium text-grey-100">
                ({isProbabilitas ? 'Sampel Probabilitas' : 'Sampel Nonprobabilitas'})
              </span>
              :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {opsiMetodeSampel.map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                  <input
                    type="radio"
                    name="metodeSampel"
                    value={opt}
                    checked={data.metodeSampel === opt}
                    onChange={(e) => updateBlok5('metodeSampel', e.target.value)}
                    className="size-4 text-grey-300 focus:ring-lime-300"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 5.4 - 5.6 khusus Sampel Probabilitas */}
        {isProbabilitas && (
          <>
            <div className="border-t border-grey-50 pt-5">
              <label className="block text-[14px] font-bold text-grey-300 mb-2">
                5.4. Kerangka Sampel Tahap Terakhir:
              </label>
              <div className="flex flex-wrap gap-6">
                {OPSI_KERANGKA_SAMPEL.map((opt) => (
                  <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                    <input
                      type="radio"
                      name="kerangkaSampel"
                      value={opt}
                      checked={data.kerangkaSampel === opt}
                      onChange={(e) => updateBlok5('kerangkaSampel', e.target.value)}
                      className="size-4 text-grey-300 focus:ring-lime-300"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-grey-50 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-grey-300 mb-1">
                  5.5. Fraksi Sampel Keseluruhan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0,05 (5 persen dari populasi)"
                  value={data.fraksiSampel || ''}
                  onChange={(e) => updateBlok5('fraksiSampel', e.target.value)}
                  className="w-full rounded-xl border border-grey-75/60 px-4 py-2 text-[14px] text-grey-300 outline-none focus:border-grey-300"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-grey-300 mb-1">
                  5.6. Nilai Perkiraan Sampling Error Variabel Utama
                </label>
                <input
                  type="text"
                  placeholder="Contoh: RSE ≤ 5% pada tingkat kepercayaan 95%"
                  value={data.samplingError || ''}
                  onChange={(e) => updateBlok5('samplingError', e.target.value)}
                  className="w-full rounded-xl border border-grey-75/60 px-4 py-2 text-[14px] text-grey-300 outline-none focus:border-grey-300"
                />
              </div>
            </div>
          </>
        )}

        {/* 5.7 & 5.8 Unit Sampel dan Unit Observasi */}
        <div className="border-t border-grey-50 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-grey-300 mb-1">
              5.7. Unit Sampel
            </label>
            <input
              type="text"
              placeholder="Contoh: Individu penerima layanan yang terpilih"
              value={data.unitSampel || ''}
              onChange={(e) => updateBlok5('unitSampel', e.target.value)}
              className="w-full rounded-xl border border-grey-75/60 px-4 py-2 text-[14px] text-grey-300 outline-none focus:border-grey-300"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-grey-300 mb-1">
              5.8. Unit Observasi
            </label>
            <input
              type="text"
              placeholder="Contoh: Individu penerima layanan"
              value={data.unitObservasi || ''}
              onChange={(e) => updateBlok5('unitObservasi', e.target.value)}
              className="w-full rounded-xl border border-grey-75/60 px-4 py-2 text-[14px] text-grey-300 outline-none focus:border-grey-300"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok5DesainSampel
