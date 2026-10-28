// Class bersama untuk elemen yang bukan komponen sendiri. Aturan pemakaiannya ada di frontend/DESIGN.md

// Tombol: satu sumber class untuk <button>, <Link>, dan <a> (komponen Button & Button kecil di Figma).
// primary = aksi utama, secondary = aksi pendamping/Batal, outline = aksi ringan, danger = aksi merusak (hapus, kunci)
const BUTTON_VARIANT = {
  primary: 'bg-grey-300 text-lime-300 hover:bg-grey-500',
  secondary: 'bg-lime-300 text-grey-500 hover:bg-lime-200',
  outline: 'border border-grey-500 text-grey-500 hover:bg-grey-500/5',
  danger: 'bg-red-400 text-white hover:bg-red-500',
}
const BUTTON_SIZE = {
  md: 'gap-2.5 rounded-md px-5 py-2.5',
  sm: 'h-6 gap-2.5 rounded-sm px-5 font-medium',
}
export const buttonClass = (variant = 'primary', size = 'md') =>
  `inline-flex shrink-0 items-center justify-center text-body whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_VARIANT[variant]} ${BUTTON_SIZE[size]}`

// Field form (komponen Form Field di Figma). Tanpa tinggi, jadi bisa dipakai <textarea>
export const fieldClass =
  'w-full rounded-md border border-grey-75 bg-white px-5 text-body font-normal text-grey-500 placeholder:font-light placeholder:text-grey-75 focus:border-grey-500 focus:outline-1 focus:outline-grey-500 disabled:cursor-not-allowed disabled:bg-grey2-75'
