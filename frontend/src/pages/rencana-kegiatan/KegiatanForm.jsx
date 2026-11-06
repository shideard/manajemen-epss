import { useEffect, useRef, useState } from 'react'
import { bobotDomain, DOMAINS, INDIKATOR } from '../../lib/epss'
import { DialogHeader, Field, FormError, Input, ModalActions, Select } from '../../components/ui'
import { buttonClass, fieldClass } from '../../components/classes'
import bookIcon from '../../assets/icons/book-mark-fill.svg'
import removeIcon from '../../assets/icons/close-circle-line.svg'

// Modal pakai <dialog> bawaan browser: Esc, fokus, dan backdrop sudah ditangani
// indikator = record bukti kegiatan ini; yang sudah diajukan/diverifikasi tidak bisa dilepas
// Panel samping "Daftar Indikator": semua indikator per domain beserta bobotnya
function DaftarIndikator({ onClose }) {
  return (
    <aside className="flex w-[min(476px,calc(100vw-2rem))] shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-lg xl:max-h-[calc(100vh-2rem)]">
      <DialogHeader title="Daftar Indikator" onClose={onClose} closeLabel="Tutup daftar indikator" />
      <div className="flex flex-col gap-6 overflow-y-auto px-5 py-6">
        {DOMAINS.map((domain, d) => (
          <section key={domain.id} className="flex flex-col gap-3">
            <p className="flex flex-wrap items-center gap-3 text-small font-semibold">
              Domain {d + 1} - {domain.nama}
              <span className="flex h-6 items-center rounded-full border border-grey-500 bg-lime-75 px-3 text-caption font-normal">Bobot domain: {bobotDomain(domain)}%</span>
            </p>
            <ul className="rounded-md bg-lime-50 py-2.5">
              {INDIKATOR.filter((i) => i.domain === domain).map((i) => (
                <li key={i.id} className="flex flex-col gap-1 border-b border-grey-75/50 px-5 py-2 last:border-0">
                  <p className="flex items-center justify-between gap-5.5 text-small font-medium">
                    <span className="min-w-0">
                      Indikator {i.nomor}: {i.nama}
                    </span>
                    <span className="flex h-6 shrink-0 items-center rounded-full border border-grey-500 bg-green-50 px-3 text-caption font-normal">Bobot: {i.bobot}%</span>
                  </p>
                  <p className="text-caption font-light">Aspek: {i.aspek}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}

function KegiatanForm({ kegiatan, indikator = [], opds = [], pics = [], indikatorPilihan = [], onSave, onClose }) {
  const dialogRef = useRef(null)
  const [error, setError] = useState('')
  const [dipetakan, setDipetakan] = useState(() => indikator.map((item) => item.id ?? item.indikatorId))
  const [daftarIndikator, setDaftarIndikator] = useState(false)

  useEffect(() => {
    dialogRef.current.showModal()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    if (data.selesai < data.mulai) {
      setError('Tanggal selesai tidak boleh sebelum tanggal mulai.')
      return
    }
    // Tahun pelaksanaan selalu mengikuti tanggal mulai, jadi tidak bisa berbeda
    try {
      await onSave({ ...data, indikator_ids: dipetakan })
    } catch (err) {
      setError(err.message || 'Gagal menyimpan rencana kegiatan.')
    }
  }

  const close = () => dialogRef.current.close()

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto bg-transparent font-sans backdrop:bg-grey-500/40 xl:overflow-visible"
    >
      {/* Layar lebar: form & daftar indikator berdampingan, masing-masing bergulir sendiri; layar kecil: bertumpuk */}
      <div className="flex flex-col items-start gap-6 xl:flex-row xl:gap-11">
      <form
        onSubmit={handleSubmit}
        className={`w-[min(833px,calc(100vw-2rem))] shrink-0 rounded-lg bg-white shadow-lg xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto ${
          daftarIndikator ? 'xl:w-[min(833px,calc(100vw-2rem-519px))]' : ''
        }`}
      >
        <DialogHeader title={`${kegiatan.id ? 'Edit' : 'Tambah'} Rencana Kegiatan`} onClose={close} className="sticky top-0 z-10" />

        <div className="flex flex-col gap-6 px-8.5 pt-7 pb-8">
          <Field label="Nama Kegiatan">
            <Input name="nama" required defaultValue={kegiatan.nama} placeholder="Contoh: Survei Kepuasan Masyarakat 2026" />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Tanggal Mulai">
              <Input type="date" name="mulai" required defaultValue={kegiatan.mulai} />
            </Field>
            <Field label="Tanggal Selesai">
              <Input type="date" name="selesai" required defaultValue={kegiatan.selesai} />
            </Field>
          </div>

          <Field label="OPD Penanggung Jawab">
            <Select name="opd_id" required defaultValue={kegiatan.opd_id ?? ''}>
              <option value="">Pilih OPD</option>
              {opds.map((opd) => <option key={opd.id} value={opd.id}>{opd.nama}</option>)}
            </Select>
          </Field>
          <Field label="Penanggung Jawab Teknis (PIC)">
            <Select name="pic_user_id" required defaultValue={kegiatan.pic_user_id ?? ''}>
              <option value="">Pilih PIC</option>
              {pics.map((pic) => <option key={pic.id} value={pic.id}>{pic.name} ({pic.username})</option>)}
            </Select>
          </Field>
          <Field label="Deskripsi Kegiatan">
            <textarea name="deskripsi" defaultValue={kegiatan.deskripsi} placeholder="Isi deskripsi..." className={`${fieldClass} h-[177px] resize-none py-4`} />
          </Field>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="pilih-indikator" className="font-semibold">
                Pemetaan Indikator EPSS (Indikator Tertaut)
              </label>
              <button
                type="button"
                onClick={() => setDaftarIndikator((buka) => !buka)}
                aria-expanded={daftarIndikator}
                className={buttonClass('secondary', 'sm')}
              >
                <img src={bookIcon} alt="" width={15} height={15} />
                Lihat Pedoman Indikator
              </button>
            </div>
            <Select id="pilih-indikator" value="" onChange={(e) => setDipetakan((ids) => [...ids, e.target.value])}>
              <option value="">Pilih indikator yang akan ditambahkan...</option>
              {indikatorPilihan.filter((i) => !dipetakan.includes(i.id)).map((i) => (
                <option key={i.id} value={i.id}>
                  Indikator {i.kode}: {i.nama}
                </option>
              ))}
            </Select>
            {dipetakan.map((id) => (
              <p key={id} className="flex items-center justify-between gap-3 rounded-sm bg-lime-300 px-2.5 py-1.5 text-small">
                Indikator {indikatorPilihan.find((i) => i.id === id)?.kode ?? indikator.find((i) => i.id === id)?.kode}: {indikatorPilihan.find((i) => i.id === id)?.nama ?? indikator.find((i) => i.id === id)?.nama}
                <button type="button" onClick={() => setDipetakan((ids) => ids.filter((x) => x !== id))} aria-label={`Lepas indikator ${indikatorPilihan.find((i) => i.id === id)?.kode ?? id}`}>
                  <img src={removeIcon} alt="" width={15} height={15} className="grayscale" />
                </button>
              </p>
            ))}
          </div>

          <FormError>{error}</FormError>
          <ModalActions onCancel={close} />
        </div>
      </form>
      {daftarIndikator && <DaftarIndikator onClose={() => setDaftarIndikator(false)} />}
      </div>
    </dialog>
  )
}

export default KegiatanForm
