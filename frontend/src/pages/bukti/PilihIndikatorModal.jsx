import { useRef, useState } from 'react'
import { FormError, Modal, ModalActions } from '../../components/ui'
import { buttonClass } from '../../components/classes'
import { formatUkuran } from '../../lib/epss'
import uploadIcon from '../../assets/icons/upload-cloud-2-fill.svg'
import removeIcon from '../../assets/icons/close-circle-line.svg'

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'

// Pilih indikator untuk berkas umum: saat unggah (denganBerkas) sekaligus memilih file, atau mengatur ulang indikator berkas.
// indikator = indikator tertaut kegiatan dari API ({ id, kode, nama }); awal = id indikator yang sudah tercentang
function PilihIndikatorModal({ title, indikator, awal = [], denganBerkas = false, submitLabel = 'Simpan', onSimpan, onClose }) {
  const [dipilih, setDipilih] = useState(() => new Set(awal))
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [mengirim, setMengirim] = useState(false)
  const fileInput = useRef(null)
  const semua = indikator.length > 0 && indikator.every((i) => dipilih.has(i.id))

  function ubah(id, value) {
    setDipilih((set) => {
      const baru = new Set(set)
      if (value) baru.add(id)
      else baru.delete(id)
      return baru
    })
  }

  // File yang sama tidak ditambahkan dua kali
  const tambahFile = (list) => setFiles((lama) => [...lama, ...[...list].filter((f) => !lama.some((x) => x.name === f.name && x.size === f.size))])

  async function handleSubmit(event) {
    event.preventDefault()
    if (denganBerkas && dipilih.size === 0) return setError('Pilih minimal satu indikator untuk berkas ini.')
    if (denganBerkas && files.length === 0) return setError('Pilih berkas yang akan diunggah.')
    setMengirim(true)
    setError('')
    try {
      await onSimpan([...dipilih], files)
      onClose()
    } catch (err) {
      setError(Object.values(err.errors ?? {}).flat()[0] ?? err.message)
      setMengirim(false)
    }
  }

  return (
    <Modal title={title} width={640} onClose={onClose}>
      <form onSubmit={handleSubmit} className="px-8.5 pt-7 pb-8">
        <fieldset disabled={mengirim} aria-busy={mengirim} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Indikator yang didukung</p>
                <p className="text-small text-grey-200">Berkas hanya terlihat oleh verifikator pada ajuan indikator yang dipilih.</p>
              </div>
              <button
                type="button"
                onClick={() => setDipilih(new Set(semua ? [] : indikator.map((i) => i.id)))}
                className="shrink-0 text-small font-semibold underline"
              >
                {semua ? 'Kosongkan' : 'Pilih semua'}
              </button>
            </div>
            <ul className="overflow-hidden rounded-md border border-grey-75">
              {indikator.map((i) => (
                <li key={i.id} className="border-b border-grey-75/50 last:border-0">
                  <label className={`flex cursor-pointer items-start gap-3.5 px-5 py-3.5 ${dipilih.has(i.id) ? 'bg-lime-75' : 'hover:bg-grey2-75'}`}>
                    <input
                      type="checkbox"
                      checked={dipilih.has(i.id)}
                      onChange={(e) => ubah(i.id, e.target.checked)}
                      className="mt-0.5 size-4 shrink-0 accent-grey-300"
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-small font-semibold">Indikator {i.kode}</span>
                      <span className="text-small text-grey-200">{i.nama}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="text-small text-grey-200">{dipilih.size} dari {indikator.length} indikator dipilih</p>
          </div>

          {denganBerkas && (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Berkas</p>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  tambahFile(e.dataTransfer.files)
                }}
                className="flex flex-col items-center justify-center gap-2.5 rounded-md border-2 border-dashed border-grey-75 px-5 py-7 text-center text-grey-200"
              >
                <img src={uploadIcon} alt="" width={24} height={24} />
                <p>
                  <span className="block font-semibold">Unggah Berkas</span>
                  <span className="block text-small">Seret dan lepas ke kotak ini, atau pilih dari perangkat</span>
                </p>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  accept={ACCEPT}
                  onChange={(e) => {
                    tambahFile(e.target.files)
                    e.target.value = ''
                  }}
                  className="hidden"
                />
                <button type="button" onClick={() => fileInput.current.click()} className={buttonClass('outline', 'sm')}>
                  Pilih Berkas
                </button>
              </div>
              <p className="text-small text-grey-200">PDF, Word, Excel, JPG, atau PNG, maksimal 10 MB per berkas.</p>
              {files.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {files.map((f, index) => (
                    <li key={`${f.name}:${f.size}`} className="flex items-center justify-between gap-3 rounded-sm bg-grey2-75 px-4 py-2.5">
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-small font-medium">{f.name}</span>
                        <span className="text-caption text-grey-200">{formatUkuran(f.size)}</span>
                      </span>
                      <button type="button" onClick={() => setFiles((list) => list.filter((_, i) => i !== index))} aria-label={`Batalkan ${f.name}`} className="shrink-0">
                        <img src={removeIcon} alt="" width={20} height={20} className="grayscale" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <FormError>{error}</FormError>
          <ModalActions onCancel={onClose} submitLabel={mengirim ? 'Menyimpan...' : submitLabel} />
        </fieldset>
      </form>
    </Modal>
  )
}

export default PilihIndikatorModal
