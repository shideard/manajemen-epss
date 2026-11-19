import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'

/**
 * Isian teks dengan daftar saran (semi-dropdown).
 *
 * Prinsip:
 * - Teks tetap bebas diketik: saran hanya mempercepat, tidak mengunci isian,
 *   karena daftar instansi tidak selalu lengkap.
 * - Daftar muncul saat isian difokuskan/diketik, dan tersaring mengikuti kata
 *   kunci. Cocok bila `daftar` = array string.
 * - Tertutup saat klik di luar, tekan Esc, atau setelah salah satu saran dipilih.
 * - Dipakai untuk "Instansi Penyelenggara" (Blok I) dengan sumber `/api/pilihan/opd`.
 *
 * Props:
 * - value, onChange(nilai) : isian terkendali
 * - daftar                  : array string saran
 * - placeholder, id         : diteruskan ke <input>
 * - maxTampil               : batas jumlah saran yang dirender (default 8)
 */
function IsianSaran({ value, onChange, daftar = [], placeholder = '', id, maxTampil = 8 }) {
  const [terbuka, setTerbuka] = useState(false)
  const wadahRef = useRef(null)
  const inputRef = useRef(null)

  // Tutup saat klik di luar isian dan daftarnya.
  useEffect(() => {
    if (!terbuka) return
    const tutupLuar = (e) => {
      if (!wadahRef.current?.contains(e.target)) setTerbuka(false)
    }
    const tutupEsc = (e) => {
      if (e.key !== 'Escape') return
      setTerbuka(false)
      inputRef.current?.focus()
    }
    document.addEventListener('pointerdown', tutupLuar)
    document.addEventListener('keydown', tutupEsc)
    return () => {
      document.removeEventListener('pointerdown', tutupLuar)
      document.removeEventListener('keydown', tutupEsc)
    }
  }, [terbuka])

  const kataKunci = String(value ?? '').trim().toLowerCase()
  const saran = (kataKunci
    ? daftar.filter((nama) => nama.toLowerCase().includes(kataKunci))
    : daftar
  ).slice(0, maxTampil)

  // Saran persis sama dengan isian tidak perlu ditawarkan lagi.
  const tampilkan = terbuka && saran.some((nama) => nama.toLowerCase() !== kataKunci)

  function pilih(nama) {
    onChange(nama)
    setTerbuka(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wadahRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={tampilkan}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setTerbuka(true)
        }}
        onFocus={() => setTerbuka(true)}
        className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 pr-10 text-[14px] text-grey-300 focus:border-grey-300 focus:ring-1 focus:ring-grey-300 outline-none transition"
      />
      {daftar.length > 0 && (
        <ChevronDown
          size={16}
          aria-hidden
          className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-grey-100 transition-transform ${tampilkan ? 'rotate-180' : ''}`}
        />
      )}

      <AnimatePresence>
        {tampilkan && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 z-20 mt-2 flex max-h-64 w-full origin-top flex-col gap-1 overflow-y-auto rounded-xl border border-grey-50 bg-white p-1.5 shadow-lg"
          >
            {saran.map((nama) => (
              <li key={nama}>
                <button
                  type="button"
                  role="option"
                  aria-selected={nama === value}
                  onClick={() => pilih(nama)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-[13px] text-grey-300 ${nama === value ? 'bg-lime-100 font-semibold' : 'hover:bg-grey2-75'}`}
                >
                  {nama}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default IsianSaran
