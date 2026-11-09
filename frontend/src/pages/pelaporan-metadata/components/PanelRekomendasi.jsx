import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Check, Info } from 'lucide-react'
import { formatNilaiRekomendasi } from '../lib/rekomendasiHelper'

/**
 * Panel rekomendasi berbasis judul kegiatan untuk satu blok.
 *
 * Prinsip: rekomendasi HANYA ditampilkan sebagai saran. Nilai baru masuk ke
 * form kalau pengguna menekan tombol "Terapkan" pada baris yang bersangkutan.
 *
 * Props:
 * - judulKegiatan : judul kegiatan aktif (dipakai sebagai gating)
 * - rekomendasi   : hasil `cariRekomendasi(...)` atau null
 * - items         : [{ fieldKey, label, nilai, diterapkan? }]
 * - onTerapkan    : (fieldKey, nilai) => void
 */
function PanelRekomendasi({ judulKegiatan, rekomendasi, items, onTerapkan, labelNilai }) {
  const [terbuka, setTerbuka] = useState(false)

  // Tidak ada saran untuk judul ini -> panel tidak ditampilkan sama sekali.
  if (!rekomendasi || !items || items.length === 0) return null

  return (
    <div className="rounded-2xl border border-lime-300 bg-lime-100/40 shadow-xs">
      <button
        type="button"
        onClick={() => setTerbuka((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-grey-300 text-lime-300">
            <Sparkles size={15} />
          </span>
          <span>
            <span className="block text-[13.5px] font-bold text-grey-300">
              Lihat Rekomendasi ({items.length})
            </span>
            <span className="block text-[12px] text-grey-100">
              Berdasarkan judul &ldquo;{judulKegiatan}&rdquo; &middot; kata kunci:{' '}
              {rekomendasi.keywordCocok.join(', ')}
            </span>
          </span>
        </span>
        {terbuka ? (
          <ChevronUp size={18} className="shrink-0 text-grey-200" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-grey-200" />
        )}
      </button>

      {terbuka && (
        <div className="border-t border-lime-300/70 px-5 py-4">
          <p className="mb-3 flex items-start gap-1.5 text-[12px] text-grey-100">
            <Info size={13} className="mt-0.5 shrink-0 text-lime-500" />
            Ini hanya saran dari kegiatan historis. Form tidak diisi otomatis &mdash; tekan
            &ldquo;Terapkan&rdquo; pada isian yang memang sesuai dengan kegiatan Anda.
          </p>

          <div className="flex flex-col divide-y divide-lime-300/50">
            {items.map(({ fieldKey, label, nilai, diterapkan }) => (
              <div key={fieldKey} className="flex items-start justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-grey-300">{label}</span>
                    {diterapkan && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        <Check size={10} />
                        dari rekomendasi
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-grey-200">
                    {formatNilaiRekomendasi(nilai, labelNilai)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTerapkan(fieldKey, nilai)}
                  className="shrink-0 rounded-full border border-grey-300 bg-white px-3 py-1 text-[11.5px] font-bold text-grey-300 hover:bg-grey-300 hover:text-lime-300 transition"
                >
                  Terapkan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelRekomendasi
