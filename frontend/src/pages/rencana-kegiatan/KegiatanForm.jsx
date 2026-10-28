import { useEffect, useRef, useState } from 'react'
import { useUsers } from '../../lib/store'
import { bobotDomain, DOMAINS, indikatorById, INDIKATOR } from '../../lib/epss'
import { ROLES } from '../../config/menu'
import { DialogHeader, Field, FormError, Input, ModalActions, Select } from '../../components/ui'
import { buttonClass, fieldClass } from '../../components/classes'
import bookIcon from '../../assets/icons/book-mark-fill.svg'
import removeIcon from '../../assets/icons/close-circle-line.svg'
import uploadIcon from '../../assets/icons/upload-cloud-2-fill.svg'

// Jenis file output bukti dukung → atribut accept untuk pilihan file contoh
const JENIS_FILE = { PDF: '.pdf', 'Gambar (JPG/PNG)': 'image/*', Word: '.doc,.docx', Excel: '.xls,.xlsx', Lainnya: '' }

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

function KegiatanForm({ kegiatan, indikator = [], onSave, onClose }) {
  const dialogRef = useRef(null)
  const [error, setError] = useState('')
  const { users } = useUsers()
  const [dipetakan, setDipetakan] = useState(() => indikator.map((b) => b.indikatorId))
  const terkunci = indikator.filter((b) => b.status !== 'draft').map((b) => b.indikatorId)
  // Output bukti dukung yang ditargetkan: [{ id, judul, jenis, contoh?: { nama, ukuran } }]
  const [output, setOutput] = useState(kegiatan.output ?? [])
  const [judulOutput, setJudulOutput] = useState('')
  const [jenisOutput, setJenisOutput] = useState('')
  const fileContoh = useRef(null)
  const [daftarIndikator, setDaftarIndikator] = useState(false)

  // Tambah satu target output; file contoh opsional (judul kosong → pakai nama file)
  function tambahOutput(file) {
    const judul = judulOutput.trim() || file?.name
    if (!judul) return
    // ponytail: hanya nama & ukuran file contoh yang disimpan; isinya diunggah ke backend saat API siap
    const contoh = file && { nama: file.name, ukuran: file.size }
    setOutput((list) => [...list, { id: crypto.randomUUID(), judul, jenis: jenisOutput, contoh }])
    setJudulOutput('')
  }

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
    // Tahun pelaksanaan selalu mengikuti tanggal mulai, jadi tidak bisa berbeda
    onSave({ ...data, tahun: data.mulai.slice(0, 4), output, indikator: dipetakan })
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

          {/* ponytail: OPD masih teks bebas; jadi dropdown pencarian saat API master OPD tersedia */}
          <Field label="OPD Penanggung Jawab">
            <Input name="opd" required defaultValue={kegiatan.opd} placeholder="Contoh: DINSOS" />
          </Field>
          <Field label="Penanggung Jawab Teknis (PIC)">
            {/* PIC dicocokkan dengan akun operator: hanya PIC yang bisa mengunggah bukti kegiatan ini */}
            <Input name="pic" required list="daftar-operator" defaultValue={kegiatan.pic} placeholder="Cari nama PIC..." />
            <datalist id="daftar-operator">
              {users
                .filter((u) => u.role === ROLES.OPERATOR && u.status_aktif !== false)
                .map((u) => (
                  <option key={u.id} value={u.username} />
                ))}
            </datalist>
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
              {INDIKATOR.filter((i) => !dipetakan.includes(i.id)).map((i) => (
                <option key={i.id} value={i.id}>
                  Indikator {i.nomor}: {i.nama}
                </option>
              ))}
            </Select>
            {dipetakan.map((id) => (
              <p key={id} className="flex items-center justify-between gap-3 rounded-sm bg-lime-300 px-2.5 py-1.5 text-small">
                Indikator {indikatorById[id].nomor}: {indikatorById[id].nama}
                {terkunci.includes(id) ? (
                  <span className="text-grey-200">Sudah diajukan</span>
                ) : (
                  <button type="button" onClick={() => setDipetakan((ids) => ids.filter((x) => x !== id))} aria-label={`Lepas indikator ${indikatorById[id].nomor}`}>
                    <img src={removeIcon} alt="" width={15} height={15} className="grayscale" />
                  </button>
                )}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-semibold">Output Bukti Dukung yang Ditargetkan</p>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2.5 sm:flex-row">
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
                  aria-label="Judul bukti dukung yang ditargetkan"
                  placeholder="Tulis Contoh Judul Bukti Dukung yang Ditargetkan"
                  className="sm:flex-[3]"
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
                className="flex h-[175px] flex-col items-center justify-center gap-2.5 rounded-md border-2 border-dashed border-grey-75 px-5 text-center text-grey-200"
              >
                <img src={uploadIcon} alt="" width={24} height={24} />
                <p>
                  <span className="block font-semibold">Unggah File</span>
                  <span className="block text-small">Unggah atau seret dan lepas ke dalam kotak ini</span>
                </p>
                <input
                  ref={fileContoh}
                  type="file"
                  accept={JENIS_FILE[jenisOutput]}
                  onChange={(e) => {
                    if (e.target.files[0]) tambahOutput(e.target.files[0])
                    e.target.value = ''
                  }}
                  className="hidden"
                />
                <button type="button" onClick={() => fileContoh.current.click()} className={buttonClass()}>
                  Pilih File
                </button>
              </div>
              <p className="text-small text-grey-200">Tekan Enter untuk menambah target tanpa file contoh.</p>

              {output.map((o) => (
                <p key={o.id} className="flex min-h-[45px] items-center justify-between gap-3 rounded-md bg-lime-300 px-5 py-2">
                  <span className="min-w-0">
                    {o.judul}
                    {o.jenis && <span className="text-small"> ({o.jenis})</span>}
                    {o.contoh && <span className="block truncate text-small text-grey-200">Contoh: {o.contoh.nama}</span>}
                  </span>
                  <button type="button" onClick={() => setOutput((list) => list.filter((x) => x.id !== o.id))} aria-label={`Hapus output ${o.judul}`} className="shrink-0">
                    <img src={removeIcon} alt="" width={24} height={24} className="grayscale" />
                  </button>
                </p>
              ))}
            </div>
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
