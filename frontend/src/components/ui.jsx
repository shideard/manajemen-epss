// Komponen kecil yang dipakai ulang di banyak halaman (sesuai komponen di Figma Design.md)
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate } from 'motion/react'
import closeIcon from '../assets/rencana/close-line.svg'
import triangle from '../assets/rencana/dropdown-triangle.svg'
import searchDark from '../assets/rencana/search-2-line.svg'
import searchLight from '../assets/icons/search-2-line-dark-icon.svg'
import arrowLeft from '../assets/rencana/arrow-drop-left-line.svg'
import activeDot from '../assets/rencana/pagination-dot.svg'
import arrowLime from '../assets/icons/arrow-long-lime.svg'
import timeIcon from '../assets/icons/time-line.svg'
import spamIcon from '../assets/icons/spam-2-line.svg'
import checkCircleIcon from '../assets/icons/checkbox-circle-line.svg'
import checkOn from '../assets/icons/check-fill.svg'
import checkOff from '../assets/icons/check-fill-off.svg'

const inputClass =
  'h-[45px] w-full rounded-[15px] border-2 border-dashed border-grey-75 bg-white px-5 text-base font-normal text-grey-500 placeholder:font-light placeholder:text-grey-75/50 focus:border-solid focus:border-grey-500 focus:outline-none disabled:bg-grey2-75'

export function Field({ label, aside, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-[7px] text-base leading-[1.2] font-semibold text-grey-500 ${className}`}>
      <span className="flex items-center justify-between gap-2">
        {label}
        {aside}
      </span>
      {children}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`${inputClass} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <span className={`relative block ${className}`}>
      <select className={`${inputClass} appearance-none border-[#b4b4b4] pr-12`} {...props}>
        {children}
      </select>
      <img src={triangle} alt="" width={17} height={11} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 -scale-y-100" />
    </span>
  )
}

// Modal pakai <dialog> bawaan browser: Esc, fokus, dan backdrop sudah ditangani.
// Ditutup dengan meng-unmount (onClose dari parent), jadi tidak perlu dialog.close()
export function Modal({ title, titleClass = 'text-[20px] text-white', width = 833, onClose, children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    dialogRef.current.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{ width: `min(${width}px, calc(100vw - 2rem))` }}
      className="m-auto max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[20px] bg-white font-sans shadow-[0_4px_20.9px_rgba(0,0,0,0.25)] backdrop:bg-black/40"
    >
      <header className="sticky top-0 z-10 flex min-h-[64px] items-center justify-between gap-4 bg-grey-500 px-[34px] py-4">
        <h2 className={`leading-[1.2] font-semibold ${titleClass}`}>{title}</h2>
        <button type="button" onClick={onClose} aria-label="Tutup">
          <img src={closeIcon} alt="" width={24} height={24} />
        </button>
      </header>
      {children}
    </dialog>
  )
}

export function ModalActions({ onCancel, submitLabel = 'Simpan' }) {
  return (
    <div className="flex justify-end gap-[18px] pt-6">
      <button type="button" onClick={onCancel} className="w-[119px] rounded-[16px] bg-lime-300 py-[10px] text-base text-grey-500">
        Batal
      </button>
      <button type="submit" className="min-w-[138px] rounded-[16px] bg-grey-300 px-5 py-[10px] text-base text-lime-300">
        {submitLabel}
      </button>
    </div>
  )
}

export function Spinner({ className = 'size-4' }) {
  return <span aria-hidden className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
}

export function ConfirmDialog({ title, message, confirmLabel = 'Ya, lanjutkan', danger = false, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function lanjut() {
    setLoading(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Selama proses berjalan tombol Tutup/Batal diabaikan (Esc tetap menyembunyikan pop-up, prosesnya tetap selesai)
  const tutup = loading ? () => {} : onClose
  return (
    <Modal title={title} titleClass="text-base text-lime-300" width={520} onClose={tutup}>
      <div className="flex flex-col gap-4 px-[34px] pt-7 pb-8">
        <p className="text-base leading-[1.4] text-grey-500">{message}</p>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-[18px] pt-4">
          <button type="button" onClick={tutup} disabled={loading} className="w-[119px] rounded-[16px] bg-lime-300 py-[10px] text-base text-grey-500 disabled:opacity-60">
            Batal
          </button>
          <button
            type="button"
            onClick={lanjut}
            disabled={loading}
            aria-busy={loading}
            className={`flex min-w-[138px] items-center justify-center gap-2 rounded-[16px] px-5 py-[10px] text-base disabled:opacity-80 ${
              danger ? 'bg-red-300 text-white' : 'bg-grey-300 text-lime-300'
            }`}
          >
            {loading && <Spinner />}
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

const TONES = {
  red: 'border-red-500 bg-red-50 text-red-500',
  yellow: 'border-yellow-500 bg-yellow-50 text-yellow-500',
  blue: 'border-blue-500 bg-blue-50 text-blue-600',
  green: 'border-green-500 bg-green-100 text-green-500',
}

export function Badge({ tone, icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center gap-[10px] rounded-[12px] border px-4 py-[6px] leading-[1.2] whitespace-nowrap ${TONES[tone]} ${className}`}>
      {icon && <img src={icon} alt="" width={15} height={15} className="shrink-0" />}
      {children}
    </span>
  )
}

// Status ajuan bukti dukung; label "draft" beda untuk operator & verifikator
const STATUS_BUKTI = {
  draft: { tone: 'yellow', icon: timeIcon, label: 'Belum Unggah' },
  menunggu: { tone: 'yellow', icon: timeIcon, label: 'Menunggu Verifikasi' },
  perbaikan: { tone: 'red', icon: spamIcon, label: 'Perlu Perbaikan' },
  terverifikasi: { tone: 'green', icon: checkCircleIcon, label: 'Terverifikasi' },
}

export function StatusBukti({ status = 'draft', label, className = 'text-base' }) {
  const { tone, icon, label: defaultLabel } = STATUS_BUKTI[status]
  return (
    <Badge tone={tone} icon={icon} className={className}>
      {label ?? defaultLabel}
    </Badge>
  )
}

// variant "white" untuk latar abu-abu halaman, "grey" untuk di dalam kotak lime
export function SearchBox({ value, onChange, placeholder, variant = 'white', className = 'w-[330px]' }) {
  const white = variant === 'white'
  return (
    <label className={`relative flex h-[45px] max-w-full items-center ${className}`}>
      <span className="sr-only">{placeholder}</span>
      <img
        src={white ? searchLight : searchDark}
        alt=""
        width={31}
        height={31}
        className={`pointer-events-none absolute left-2 rounded-[10px] ${white ? 'bg-white' : 'bg-grey-300'}`}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`size-full pr-4 pl-[53px] text-base placeholder:font-light placeholder:italic focus:outline-2 focus:outline-grey-300 ${
          white ? 'rounded-[15px] bg-white placeholder:text-grey-100' : 'rounded-[16px] bg-grey2-75 placeholder:text-grey-75'
        }`}
      />
    </label>
  )
}

export function Pagination({ page, pageCount, onChange }) {
  // Maksimal 3 nomor halaman di sekitar halaman aktif, seperti di desain
  const first = Math.max(1, Math.min(page - 1, pageCount - 2))
  const numbers = Array.from({ length: Math.min(3, pageCount) }, (_, i) => first + i)
  return (
    <nav aria-label="Halaman" className="mx-auto flex h-[51px] w-[331px] items-center justify-between overflow-hidden rounded-[20px] bg-grey-300">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Halaman sebelumnya" className="disabled:opacity-40">
        <img src={arrowLeft} alt="" width={53} height={53} />
      </button>
      <div className="flex items-center">
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`relative grid size-[37px] place-items-center text-[20px] leading-[1.2] font-semibold ${n === page ? 'text-grey-300' : 'text-lime-300'}`}
          >
            {n === page && <img src={activeDot} alt="" width={37} height={37} className="absolute inset-0" />}
            <span className="relative">{n}</span>
          </button>
        ))}
      </div>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label="Halaman berikutnya" className="disabled:opacity-40">
        <img src={arrowLeft} alt="" width={53} height={53} className="-scale-x-100" />
      </button>
    </nav>
  )
}

// Angka yang "berputar" dari nilai sebelumnya ke nilai baru (0 saat pertama tampil).
// Teks ditulis langsung ke DOM supaya tidak re-render React tiap frame.
export function CountUp({ value, format = String }) {
  const ref = useRef(null)
  const shown = useRef(0)

  // Layout effect: jalan sebelum paint, jadi nilai akhir tidak sempat berkedip
  useLayoutEffect(() => {
    const el = ref.current
    const show = (v) => {
      shown.current = v
      el.textContent = format(v)
    }
    if (value == null || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      show(value)
      return
    }
    // Mulai dari angka yang sedang tampil, jadi perubahan di tengah animasi tetap mulus
    const controls = animate(shown.current ?? 0, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1], onUpdate: show })
    return () => controls.stop()
  }, [value, format])

  return (
    <span ref={ref} className="tabular-nums">
      {format(value)}
    </span>
  )
}

// Tombol gelap "Lihat ..." dengan panah panjang
export function ArrowLink({ to, children, className = 'w-[211px]' }) {
  return (
    <Link to={to} className={`group flex shrink-0 items-center justify-between gap-4 rounded-[16px] bg-grey-300 px-5 py-[10px] text-base leading-[1.2] text-lime-300 ${className}`}>
      {children}
      <img src={arrowLime} alt="" width={29} height={15} className="transition-transform duration-300 ease-out-quint group-hover:translate-x-1" />
    </Link>
  )
}

// Baris checklist syarat bukti dukung (checkbox asli disembunyikan, tampilan sesuai desain)
export function ChecklistItem({ checked, onChange, disabled, children }) {
  return (
    <label className={`flex min-h-[45px] items-center gap-[17px] rounded-[10px] border border-dashed border-black px-[14px] py-[9px] ${disabled ? '' : 'cursor-pointer'}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="peer sr-only" />
      <span className={`grid size-6 shrink-0 place-items-center rounded-[5px] peer-focus-visible:outline-2 peer-focus-visible:outline-grey-500 ${checked ? 'bg-grey-300' : 'bg-grey-75'}`}>
        <img src={checked ? checkOn : checkOff} alt="" width={24} height={24} />
      </span>
      <span className="text-[13px] leading-[1.2] font-semibold text-heading">{children}</span>
    </label>
  )
}

// Buka/tutup dengan tinggi beranimasi (grid-rows 0fr ↔ 1fr, tanpa mengukur tinggi pakai JS), dua arah.
// Isi tetap ter-render saat tertutup; `inert` mencegah fokus/klik ke isi yang tersembunyi
export function Collapse({ open, children }) {
  return (
    <div
      inert={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out-quint motion-reduce:transition-none ${
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

// Kartu domain: header gelap + isi putih (Pedoman, Verifikasi, Repositori)
export function DomainPanel({ title, aside, children }) {
  return (
    <section className="overflow-hidden rounded-[20px] bg-grey-500">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 pb-[17px]">
        <h2 className="flex flex-wrap items-center gap-[17px] text-[20px] leading-[1.2] font-semibold text-lime-200">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  )
}
