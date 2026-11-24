import { useRef, useState } from 'react'
import { ChecklistItem, FormError, Modal, ModalActions } from '../../components/ui'
import { buttonClass } from '../../components/classes'

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

  async function handleSubmit(event) {
    event.preventDefault()
    if (dipilih.size === 0 && denganBerkas) return setError('Pilih minimal satu indikator untuk berkas ini.')
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
      <form onSubmit={handleSubmit} className="px-9 pt-7 pb-8">
        <fieldset disabled={mengirim} aria-busy={mengirim} className="flex flex-col gap-4">
          <p className="text-small text-grey-200">Berkas hanya terlihat oleh verifikator pada ajuan indikator yang dicentang.</p>
          <ChecklistItem checked={semua} onChange={(value) => setDipilih(new Set(value ? indikator.map((i) => i.id) : []))}>
            Semua indikator tertaut
          </ChecklistItem>
          <div className="flex flex-col gap-2 pl-6">
            {indikator.map((i) => (
              <ChecklistItem key={i.id} checked={dipilih.has(i.id)} onChange={(value) => ubah(i.id, value)}>
                Indikator {i.kode}: {i.nama}
              </ChecklistItem>
            ))}
          </div>

          {denganBerkas && (
            <div className="flex flex-col gap-2">
              <input
                ref={fileInput}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={(e) => setFiles([...e.target.files])}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => fileInput.current.click()} className={buttonClass('outline', 'sm')}>
                  {files.length ? 'Ganti Berkas' : 'Pilih Berkas'}
                </button>
                <span className="text-small text-grey-200">
                  {files.length ? files.map((f) => f.name).join(', ') : 'PDF, Word, Excel, JPG, atau PNG, maksimal 10 MB per berkas.'}
                </span>
              </div>
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
