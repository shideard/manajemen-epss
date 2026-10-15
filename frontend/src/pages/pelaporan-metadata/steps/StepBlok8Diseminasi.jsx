import { Sparkles } from 'lucide-react'

function StepBlok8Diseminasi({ formData, updateBlok8 }) {
  const data = formData.blok8

  const handleProdukToggle = (key, value) => {
    updateBlok8('produkUmum', {
      ...data.produkUmum,
      [key]: value,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-grey-50 pb-3">
        <div>
          <h2 className="text-[18px] font-bold text-grey-300">VIII. DISEMINASI HASIL</h2>
          <p className="text-[13px] text-grey-100">Bentuk produk penyebarluasan publikasi atau output statistik untuk umum.</p>
        </div>
        {formData.aiPredictionsApplied && (
          <div className="flex items-center gap-1.5 rounded-full bg-lime-100 border border-lime-300 px-3 py-1 text-[11px] font-bold text-grey-300">
            <Sparkles size={14} className="text-lime-500" />
            <span>Prediksi AI Aktif</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-3">
            8.1. Produk Kegiatan yang Tersedia untuk Umum:
          </label>
          <div className="flex flex-col gap-3.5 max-w-md">
            {[
              { key: 'tercetak', label: 'Tercetak (Hardcopy)' },
              { key: 'digital', label: 'Digital (Softcopy)' },
              { key: 'dataMikro', label: 'Data Mikro' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4 py-1 border-b border-grey-50/70 last:border-0">
                <span className="text-[14px] text-grey-300">{label}</span>
                <div className="flex gap-4">
                  {['Ya', 'Tidak'].map((val) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-[13px] font-medium text-grey-200">
                      <input
                        type="radio"
                        name={`produk_${key}`}
                        value={val}
                        checked={data.produkUmum?.[key] === val}
                        onChange={() => handleProdukToggle(key, val)}
                        className="size-4 text-grey-300 focus:ring-lime-300"
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok8Diseminasi
