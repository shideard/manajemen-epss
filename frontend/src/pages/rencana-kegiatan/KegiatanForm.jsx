import { useEffect, useRef, useState } from 'react'
import closeIcon from '../../assets/rencana/close-line.svg'
import triangle from '../../assets/rencana/dropdown-triangle.svg'

const inputClass =
  'h-[45px] w-full rounded-[15px] border-2 border-dashed border-grey-75 px-5 text-base font-normal text-grey-500 placeholder:font-light placeholder:text-grey-75/50 focus:border-solid focus:border-grey-500 focus:outline-none'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-[7px] text-base leading-[1.2] font-semibold text-grey-500">
      {label}
      {children}
    </label>
  )
}

// Modal pakai <dialog> bawaan browser: Esc, fokus, dan backdrop sudah ditangani
function KegiatanForm({ kegiatan, onSave, onClose }) {
  const dialogRef = useRef(null)
  const [error, setError] = useState('')
  const tahunIni = new Date().getFullYear()
  const opsiTahun = [tahunIni - 1, tahunIni, tahunIni + 1, tahunIni + 2].map(String)

  useEffect(() => {
    dialogRef.current.showModal()
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    if (data.selesai < data.mulai) {
      setError('Tanggal selesai tidak boleh sebelum tanggal mulai.')
      return
    }
    onSave(data)
  }

  const close = () => dialogRef.current.close()

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto max-h-[calc(100vh-2rem)] w-[min(833px,calc(100vw-2rem))] overflow-y-auto rounded-[20px] bg-white font-sans shadow-[0_4px_20.9px_rgba(0,0,0,0.25)] backdrop:bg-black/40"
    >
      <form onSubmit={handleSubmit}>
        <header className="sticky top-0 z-10 flex h-[73px] items-center justify-between bg-grey-500 px-[34px]">
          <h2 className="text-[20px] leading-[1.2] font-semibold text-white">
            {kegiatan.id ? 'Edit' : 'Tambah'} Rencana Kegiatan
          </h2>
          <button type="button" onClick={close} aria-label="Tutup">
            <img src={closeIcon} alt="" width={24} height={24} />
          </button>
        </header>

        <div className="flex flex-col gap-[22px] px-[34px] pt-10 pb-8">
          <Field label="Nama Kegiatan">
            <input name="nama" required defaultValue={kegiatan.nama} placeholder="Contoh: Survei Kepuasan Masyarakat 2026" className={inputClass} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3 sm:gap-[13px]">
            <Field label="Tahun Pelaksanaan">
              <span className="relative">
                <select name="tahun" defaultValue={kegiatan.tahun ?? String(tahunIni)} className={`${inputClass} appearance-none border-[#b4b4b4]`}>
                  {opsiTahun.map((tahun) => (
                    <option key={tahun}>{tahun}</option>
                  ))}
                </select>
                <img src={triangle} alt="" width={17} height={11} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 -scale-y-100" />
              </span>
            </Field>
            <Field label="Tanggal Mulai">
              <input type="date" name="mulai" required defaultValue={kegiatan.mulai} className={`${inputClass} border-[#b4b4b4]`} />
            </Field>
            <Field label="Tanggal Selesai">
              <input type="date" name="selesai" required defaultValue={kegiatan.selesai} className={`${inputClass} border-[#b4b4b4]`} />
            </Field>
          </div>

          {/* ponytail: OPD masih teks bebas; jadi dropdown pencarian saat API master OPD tersedia */}
          <Field label="OPD Penanggung Jawab">
            <input name="opd" required defaultValue={kegiatan.opd} placeholder="Contoh: DINSOS" className={inputClass} />
          </Field>
          <Field label="Penanggung Jawab Teknis (PIC)">
            <input name="pic" required defaultValue={kegiatan.pic} placeholder="Nama PIC" className={inputClass} />
          </Field>
          <Field label="Deskripsi Kegiatan">
            <textarea name="deskripsi" defaultValue={kegiatan.deskripsi} placeholder="Isi deskripsi..." className={`${inputClass} h-[177px] resize-none py-[17px]`} />
          </Field>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-[18px] pt-6">
            <button type="button" onClick={close} className="w-[119px] rounded-[16px] bg-lime-300 py-[10px] text-base text-grey-500">
              Batal
            </button>
            <button type="submit" className="w-[138px] rounded-[16px] bg-grey-300 py-[10px] text-base text-lime-300">
              Simpan
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}

export default KegiatanForm
