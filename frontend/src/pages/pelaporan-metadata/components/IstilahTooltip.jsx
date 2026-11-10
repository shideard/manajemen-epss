import { useEffect, useRef, useState } from 'react'
import { Info, X } from 'lucide-react'
import { ambilIstilah } from '../data/kamusIstilah'

/**
 * Ikon ⓘ + popover penjelasan istilah.
 *
 * Prinsip:
 * - Dibuka dengan KLIK (bukan hover), karena pengguna OPD kurang menemukan
 *   affordance hover. Hover hanya memperjelas bahwa ikon bisa diklik.
 * - Popover (bukan modal) supaya wizard tetap terlihat di belakangnya.
 * - Istilah "terkait" ditampilkan sebagai teks biasa, bukan tooltip bertingkat.
 *
 * Props:
 * - id        : id entri di `kamusIstilah.js`
 * - istilah   : teks pengganti judul (default: `istilah` dari kamus)
 * - className : tambahan class untuk pembungkus (mis. `ml-1`)
 * - align     : `'left'` (default) atau `'right'`; pakai `'right'` bila ikon
 *               berada dekat tepi kanan supaya popover tidak terpotong layar
 */
function IstilahTooltip({ id, istilah, className = '', align = 'left' }) {
  const [terbuka, setTerbuka] = useState(false)
  const wadahRef = useRef(null)
  const entri = ambilIstilah(id)

  // Tutup saat klik di luar popover.
  useEffect(() => {
    if (!terbuka) return
    const handlePointerDown = (event) => {
      if (wadahRef.current && !wadahRef.current.contains(event.target)) {
        setTerbuka(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [terbuka])

  // Tutup saat tombol Esc ditekan.
  useEffect(() => {
    if (!terbuka) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setTerbuka(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [terbuka])

  // Istilah tanpa entri kamus sengaja tidak menampilkan ikon.
  if (!entri) return null

  const judul = istilah || entri.istilah

  return (
    <span ref={wadahRef} className={`relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        onClick={() => setTerbuka((prev) => !prev)}
        aria-expanded={terbuka}
        aria-controls={`istilah-${id}`}
        aria-label={`Penjelasan istilah ${judul}`}
        title={`Penjelasan istilah ${judul}`}
        className="inline-flex size-4 items-center justify-center rounded-full text-grey-100 transition hover:text-lime-500 focus:text-lime-500 focus:outline-none"
      >
        <Info className="size-4" strokeWidth={2.2} />
      </button>

      {terbuka && (
        <div
          id={`istilah-${id}`}
          role="dialog"
          aria-label={`Penjelasan istilah ${judul}`}
          className={`absolute top-6 z-50 w-72 rounded-2xl border border-grey-50 bg-white p-4 text-left shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-bold text-grey-300">{judul}</p>
            <button
              type="button"
              onClick={() => setTerbuka(false)}
              aria-label="Tutup penjelasan"
              className="shrink-0 text-grey-100 transition hover:text-grey-300"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <p className="mt-1.5 text-[12.5px] leading-relaxed text-grey-200">{entri.definisi}</p>

          {entri.terkait?.length > 0 && (
            <div className="mt-3 border-t border-grey-50 pt-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-grey-100">
                Sering tertukar dengan
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-grey-200">
                {entri.terkait
                  .map((idTerkait) => ambilIstilah(idTerkait)?.istilah)
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          )}

          <p className="mt-2.5 text-[10.5px] text-grey-100">{entri.sumber}</p>
        </div>
      )}
    </span>
  )
}

export default IstilahTooltip
