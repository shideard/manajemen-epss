import { Lightbulb, CircleOff } from 'lucide-react'
import { labelArahSaran, formatDetailSaran } from '../lib/saranHelper'

/**
 * Pill kecil penanda opsi berdasarkan kebiasaan kegiatan historis.
 * Murni informatif: tidak mengubah nilai form.
 *
 * - `arahCentang: true` (default) -> "Biasanya dicentang" (hijau lime).
 * - `arahCentang: false`          -> "Biasanya tidak dicentang" (abu netral),
 *   mis. mayoritas kegiatan kompilasi tidak menyediakan data mikro.
 */
function SaranPill({ saran }) {
  if (!saran) return null

  const tidakDicentang = saran.arahCentang === false
  const label = labelArahSaran(saran)

  return (
    <span
      title={formatDetailSaran(saran)}
      aria-label={`${label}: ${formatDetailSaran(saran)}`}
      className={
        tidakDicentang
          ? 'inline-flex items-center gap-1 rounded-full border border-grey-75/40 bg-grey2-100 px-2 py-0.5 text-[10.5px] font-bold leading-tight text-grey-300'
          : 'inline-flex items-center gap-1 rounded-full border border-lime-300 bg-lime-100 px-2 py-0.5 text-[10.5px] font-bold leading-tight text-grey-300'
      }
    >
      {tidakDicentang ? (
        <CircleOff size={11} className="text-grey-100" />
      ) : (
        <Lightbulb size={11} className="text-lime-500" />
      )}
      <span>{label}</span>
    </span>
  )
}

export default SaranPill
