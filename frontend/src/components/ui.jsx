// Komponen kecil yang dipakai ulang di banyak halaman. Aturan pemakaiannya ada di frontend/DESIGN.md
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
import { buttonClass, fieldClass } from './classes'

export function BackButton({ fallback }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <button
      type="button"
      onClick={() => (location.key === 'default' ? navigate(fallback, { replace: true }) : navigate(-1))}
      className={buttonClass()}
    >
      Kembali
    </button>
  )
}

// Kepala halaman (h1, satu per halaman) atau kepala bagian (as="h2"); aksi di kanan lewat children
const HEADING = { h1: ['text-h1', 'text-lead'], h2: ['text-h2', 'text-body'] }

export function PageHeader({ as: Judul = 'h1', title, subtitle, back, children }) {
  const [judul, sub] = HEADING[Judul]
  return (
    <div className="flex flex-col items-start gap-4">
      {back && <BackButton fallback={back} />}
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <div className="flex max-w-4xl flex-col gap-2">
          <Judul className={judul}>{title}</Judul>
          {subtitle && <p className={`${sub} text-grey-200`}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

// Pesan berkotak (error, peringatan, info) dengan warna status yang sama dengan Badge
export function Notice({ tone, role = 'status', children, className = '' }) {
  return (
    <p role={role} className={`rounded-md border px-5 py-3 ${TONES[tone]} ${className}`}>
      {children}
    </p>
  )
}

// Pesan error di bawah form; tidak merender apa pun jika kosong
export function FormError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="text-small text-red-400">
      {children}
    </p>
  )
}

export function Field({ label, aside, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-2 text-body font-semibold text-grey-500 ${className}`}>
      <span className="flex items-center justify-between gap-2">
        {label}
        {aside}
      </span>
      {children}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`h-[45px] ${fieldClass} ${className}`} {...props} />
}

// Opsi kosong yang terpilih tampil seperti placeholder
export function Select({ className = '', children, ...props }) {
  return (
    <span className={`relative block ${className}`}>
      <select
        className={`h-[45px] ${fieldClass} appearance-none pr-12 has-[option[value=""]:checked]:font-light has-[option[value=""]:checked]:text-grey-75`}
        {...props}
      >
        {children}
      </select>
      <img src={triangle} alt="" width={17} height={11} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 -scale-y-100" />
    </span>
  )
}

// Kepala gelap semua pop-up (Modal, form Rencana Kegiatan, panel Daftar Indikator)
export function DialogHeader({ title, onClose, closeLabel = 'Tutup', className = '' }) {
  return (
    <header className={`flex min-h-16 shrink-0 items-center justify-between gap-4 bg-grey-500 px-8.5 py-4 ${className}`}>
      <h2 className="text-h3 text-white">{title}</h2>
      <button type="button" onClick={onClose} aria-label={closeLabel}>
        <img src={closeIcon} alt="" width={24} height={24} />
      </button>
    </header>
  )
}

// Modal pakai <dialog> bawaan browser: Esc, fokus, dan backdrop sudah ditangani.
// Ditutup dengan meng-unmount (onClose dari parent), jadi tidak perlu dialog.close()
export function Modal({ title, width = 833, onClose, children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    dialogRef.current.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{ width: `min(${width}px, calc(100vw - 2rem))` }}
      className="m-auto max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg bg-white font-sans shadow-lg backdrop:bg-grey-500/40"
    >
      <DialogHeader title={title} onClose={onClose} className="sticky top-0 z-10" />
      {children}
    </dialog>
  )
}

export function ModalActions({ onCancel, submitLabel = 'Simpan' }) {
  return (
    <div className="flex justify-end gap-4 pt-6">
      <button type="button" onClick={onCancel} className={`min-w-30 ${buttonClass('secondary')}`}>
        Batal
      </button>
      <button type="submit" className={`min-w-30 ${buttonClass()}`}>
        {submitLabel}
      </button>
    </div>
  )
}

export function Spinner({ className = 'size-4' }) {
  return <span aria-hidden className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
}

// Status muat dari hook data (useKegiatan, useBukti, ...); tidak merender apa pun saat semuanya siap
export function Memuat({ dari }) {
  const error = dari.find((d) => d.error)?.error
  if (error)
    return (
      <Notice tone="red" role="alert">
        {error.message ?? 'Gagal memuat data.'}
      </Notice>
    )
  if (!dari.some((d) => d.loading)) return null
  return (
    <p role="status" className="flex items-center gap-2">
      <Spinner /> Memuat data…
    </p>
  )
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
    <Modal title={title} width={520} onClose={tutup}>
      <div className="flex flex-col gap-4 px-8.5 pt-7 pb-8">
        <p className="leading-snug">{message}</p>
        <FormError>{error}</FormError>
        <div className="flex flex-wrap justify-end gap-4 pt-4">
          <button type="button" onClick={tutup} disabled={loading} className={`min-w-30 ${buttonClass('secondary')}`}>
            Batal
          </button>
          <button
            type="button"
            onClick={lanjut}
            disabled={loading}
            aria-busy={loading}
            className={`min-w-30 ${buttonClass(danger ? 'danger' : 'primary')}`}
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
  blue: 'border-blue-500 bg-blue-50 text-blue-500',
  green: 'border-green-500 bg-green-50 text-green-500',
}

export function Badge({ tone, icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center gap-2.5 rounded-sm border px-4 py-1.5 whitespace-nowrap ${TONES[tone]} ${className}`}>
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

export function StatusBukti({ status = 'draft', label, className = '' }) {
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
        className={`pointer-events-none absolute left-2 rounded-sm ${white ? 'bg-white' : 'bg-grey-300'}`}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`size-full rounded-md pr-4 pl-13 placeholder:font-light placeholder:text-grey-75 placeholder:italic focus:outline-2 focus:outline-grey-300 ${
          white ? 'bg-white' : 'bg-grey2-75'
        }`}
      />
    </label>
  )
}

export function Pagination({ page, pageCount, onChange }) {
  // Maksimal 3 nomor halaman di sekitar halaman aktif, seperti di desain
  const visiblePages = 6
  const first = Math.floor((page - 1) / visiblePages) * visiblePages + 1

  const numbers = Array.from(
    { length: Math.min(visiblePages, pageCount - first + 1) },
    (_, i) => first + i
  )
  return (
    <nav aria-label="Halaman" className="mx-auto flex h-[40px] w-[331px] items-center justify-between overflow-hidden rounded-lg bg-grey-300">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Halaman sebelumnya" className="cursor-pointer disabled:opacity-40">
        <img src={arrowLeft} alt="" width={40} height={40} />
      </button>
      <div className="flex items-center gap-1">
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`relative grid size-[25px] cursor-pointer place-items-center font-medium ${n === page ? 'text-grey-500' : 'text-lime-300'}`}
          >
            {n === page && <img src={activeDot} alt="" width={37} height={37} className="absolute inset-0" />}
            <span className="relative">{n}</span>
          </button>
        ))}
      </div>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label="Halaman berikutnya" className="cursor-pointer disabled:opacity-40">
        <img src={arrowLeft} alt="" width={40} height={40} className="-scale-x-100" />
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
    <Link to={to} className={`group justify-between! gap-4! ${buttonClass()} ${className}`}>
      {children}
      <img src={arrowLime} alt="" width={25} height={15} className="transition-transform duration-300 ease-out-quint group-hover:translate-x-1" />
    </Link>
  )
}

// Baris checklist syarat bukti dukung (checkbox asli disembunyikan, tampilan sesuai desain)
export function ChecklistItem({ checked, onChange, disabled, children }) {
  return (
    <label className={`flex min-h-[45px] items-center gap-4 rounded-sm border border-dashed border-grey-500 px-3.5 py-2 ${disabled ? '' : 'cursor-pointer'}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="peer sr-only" />
      <span className={`grid size-6 shrink-0 place-items-center rounded-xs peer-focus-visible:outline-2 peer-focus-visible:outline-grey-500 ${checked ? 'bg-grey-300' : 'bg-grey-75'}`}>
        <img src={checked ? checkOn : checkOff} alt="" width={24} height={24} />
      </span>
      <span className="text-small font-semibold text-grey-500">{children}</span>
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
    <section className="overflow-hidden rounded-lg bg-grey-500">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 pb-4">
        <h2 className="flex flex-wrap items-center gap-4 text-h3 text-lime-300">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  )
}
