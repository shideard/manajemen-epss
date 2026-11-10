import { useEffect, useRef, useState } from 'react'
import { bangunInstrumen, bobotDomain, formatUkuran, LEVELS } from '../../lib/epss'
import { DialogHeader, Field, FormError, Input, ModalActions, Select } from '../../components/ui'
import { buttonClass, fieldClass } from '../../components/classes'
import bookIcon from '../../assets/icons/book-mark-fill.svg'
import removeIcon from '../../assets/icons/close-circle-line.svg'
import uploadIcon from '../../assets/icons/upload-cloud-2-fill.svg'

// Jenis file output bukti dukung → atribut accept untuk berkas contoh (daftar sama dengan StoreOutputBuktiRequest::JENIS)
const JENIS_FILE = { PDF: '.pdf', 'Gambar (JPG/PNG)': '.jpg,.jpeg,.png', Word: '.doc,.docx', Excel: '.xls,.xlsx', Lainnya: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png' }

// Modal pakai <dialog> bawaan browser: Esc, fokus, dan backdrop sudah ditangani
// indikator = record bukti kegiatan ini; yang sudah diajukan/diverifikasi tidak bisa dilepas
// Panel samping "Daftar Indikator": semua indikator per domain beserta bobotnya
function DaftarIndikator({ daftar, onClose }) {
  const { domains } = bangunInstrumen(daftar)
  return (
    <aside className="flex w-[min(476px,calc(100vw-2rem))] shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-lg xl:max-h-[calc(100vh-2rem)]">
      <DialogHeader title="Daftar Indikator" onClose={onClose} closeLabel="Tutup daftar indikator" />
      <div className="flex flex-col gap-6 overflow-y-auto px-5 py-6">
        {domains.map((domain) => (
          <section key={domain.id} className="flex flex-col gap-3">
            <p className="flex flex-wrap items-center gap-3 text-small font-semibold">
              Domain {domain.nomor} - {domain.nama}
              <span className="flex h-6 items-center rounded-full border border-grey-500 bg-lime-75 px-3 text-caption font-normal">Bobot domain: {bobotDomain(domain)}%</span>
            </p>
            <ul className="rounded-md bg-lime-50 py-2.5">
              {domain.indikator.map((i) => (
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
  // [{ id, level }]: indikator tertaut beserta level yang ditargetkan dipenuhi kegiatan ini
  const [dipetakan, setDipetakan] = useState(() => indikator.map((item) => ({ id: item.id, level: item.level ?? 1 })))
  const namaIndikator = (id) => {
    const i = indikatorPilihan.find((x) => x.id === id) ?? indikator.find((x) => x.id === id)
    return i ? `Indikator ${i.kode}: ${i.nama}` : id
  }
  const [daftarIndikator, setDaftarIndikator] = useState(false)
  // Output bukti dukung yang ditargetkan: yang tersimpan (id dari API) + yang baru ({ baru: true, file? })
  const [output, setOutput] = useState(kegiatan.output ?? [])
  const [outputDihapus, setOutputDihapus] = useState([])
  const [judulOutput, setJudulOutput] = useState('')
  const [jenisOutput, setJenisOutput] = useState('')
  const fileContoh = useRef(null)

  // Judul kosong + berkas → judul = nama berkas; tanpa berkas judul wajib
  function tambahOutput(file) {
    const judul = judulOutput.trim() || file?.name
    if (!judul) return
    setOutput((list) => [...list, { id: crypto.randomUUID(), baru: true, judul, jenis: jenisOutput, file, contoh: file && { nama: file.name, ukuran: file.size } }])
    setJudulOutput('')
  }

  function hapusOutput(o) {
    setOutput((list) => list.filter((x) => x.id !== o.id))
    if (!o.baru) setOutputDihapus((ids) => [...ids, o.id])
  }

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
      await onSave({
        ...data,
        indikator_ids: dipetakan.map((d) => d.id),
        levels: Object.fromEntries(dipetakan.map((d) => [d.id, d.level])),
        outputBaru: output.filter((o) => o.baru),
        outputDihapus,
      })
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
            <Select id="pilih-indikator" value="" onChange={(e) => setDipetakan((list) => [...list, { id: e.target.value, level: 1 }])}>
              <option value="">Pilih indikator yang akan ditambahkan...</option>
              {indikatorPilihan.filter((i) => !dipetakan.some((d) => d.id === i.id)).map((i) => (
                <option key={i.id} value={i.id}>
                  Indikator {i.kode}: {i.nama}
                </option>
              ))}
            </Select>
            {dipetakan.length > 0 && <p className="text-small text-grey-200">Tentukan level indikator yang dipenuhi oleh kegiatan ini. Operator hanya dapat mengisi checklist level tersebut.</p>}
            {dipetakan.map(({ id, level }) => (
              <div key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-lime-300 px-5 py-2">
                <span className="min-w-0 flex-1">{namaIndikator(id)}</span>
                <Select
                  value={level}
                  onChange={(e) => setDipetakan((list) => list.map((d) => (d.id === id ? { ...d, level: Number(e.target.value) } : d)))}
                  aria-label={`Level yang dipenuhi untuk ${namaIndikator(id)}`}
                  className="w-[230px]"
                >
                  {LEVELS.map((nama, i) => (
                    <option key={nama} value={i + 1}>
                      Level {i + 1} ({nama})
                    </option>
                  ))}
                </Select>
                <button type="button" onClick={() => setDipetakan((list) => list.filter((d) => d.id !== id))} aria-label={`Lepas ${namaIndikator(id)}`}>
                  <img src={removeIcon} alt="" width={19} height={19} className="grayscale" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-semibold">Output Bukti Dukung yang Ditargetkan</p>
            <p className="text-small text-grey-200">Bukti dukung yang diharapkan dari kegiatan ini. Lampirkan contoh berkas bila ada; operator dapat membukanya sebagai acuan.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={judulOutput}
                onChange={(e) => setJudulOutput(e.target.value)}
                // Enter menambah target, bukan mengirim form
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    tambahOutput()
                  }
                }}
                aria-label="Judul output bukti dukung"
                placeholder="Contoh: Notulen rapat forum koordinasi"
                className="sm:flex-3"
              />
              <Select value={jenisOutput} onChange={(e) => setJenisOutput(e.target.value)} aria-label="Jenis file" className="sm:flex-1">
                <option value="">Pilih Jenis File</option>
                {Object.keys(JENIS_FILE).map((jenis) => (
                  <option key={jenis}>{jenis}</option>
                ))}
              </Select>
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (e.dataTransfer.files[0]) tambahOutput(e.dataTransfer.files[0])
              }}
              className="flex flex-col items-center justify-center gap-2.5 rounded-md border-2 border-dashed border-grey-75 px-5 py-6 text-center text-grey-200"
            >
              <img src={uploadIcon} alt="" width={24} height={24} />
              <p>
                <span className="block font-semibold">Unggah Contoh Berkas (opsional)</span>
                <span className="block text-small">Seret dan lepas ke kotak ini. PDF, Word, Excel, JPG, atau PNG, maksimal 10 MB.</span>
              </p>
              <input
                ref={fileContoh}
                type="file"
                accept={JENIS_FILE[jenisOutput] ?? JENIS_FILE.Lainnya}
                onChange={(e) => {
                  if (e.target.files[0]) tambahOutput(e.target.files[0])
                  e.target.value = ''
                }}
                className="hidden"
              />
              <div className="flex flex-wrap justify-center gap-4">
                <button type="button" onClick={() => fileContoh.current.click()} className={buttonClass('secondary', 'sm')}>
                  Pilih Berkas Contoh
                </button>
                <button type="button" onClick={() => tambahOutput()} disabled={!judulOutput.trim()} className={buttonClass('outline', 'sm')}>
                  Tambah Tanpa Berkas
                </button>
              </div>
            </div>
            {output.map((o) => (
              <div key={o.id} className="flex min-h-[45px] items-center justify-between gap-3 rounded-md bg-lime-300 px-5 py-2">
                <span className="min-w-0">
                  {o.judul}
                  {o.jenis && <span className="text-small"> ({o.jenis})</span>}
                  {o.contoh && (
                    <span className="block truncate text-small text-grey-200">
                      Contoh: {o.contoh.nama}
                      {o.contoh.ukuran != null && ` · ${formatUkuran(o.contoh.ukuran)}`}
                    </span>
                  )}
                </span>
                <button type="button" onClick={() => hapusOutput(o)} aria-label={`Hapus output ${o.judul}`} className="shrink-0">
                  <img src={removeIcon} alt="" width={19} height={19} className="grayscale" />
                </button>
              </div>
            ))}
          </div>

          <FormError>{error}</FormError>
          <ModalActions onCancel={close} />
        </div>
      </form>
      {daftarIndikator && <DaftarIndikator daftar={indikatorPilihan} onClose={() => setDaftarIndikator(false)} />}
      </div>
    </dialog>
  )
}

export default KegiatanForm
