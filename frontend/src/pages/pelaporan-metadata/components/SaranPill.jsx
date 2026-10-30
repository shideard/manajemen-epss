import { Lightbulb } from 'lucide-react'
import { formatDetailSaran } from '../lib/saranHelper'

/**
 * Pill kecil penanda opsi yang biasanya dipilih pada kegiatan historis.
 * Murni informatif: tidak mengubah nilai form.
 */
function SaranPill({ saran }) {
  if (!saran) return null

  return (
    <span
      title={formatDetailSaran(saran)}
      className="inline-flex items-center gap-1 rounded-full border border-lime-300 bg-lime-100 px-2 py-0.5 text-[10.5px] font-bold leading-tight text-grey-300"
    >
      <Lightbulb size={11} className="text-lime-500" />
      <span>Biasanya dipilih</span>
    </span>
  )
}

export default SaranPill
