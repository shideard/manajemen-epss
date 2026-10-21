import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { bobotDomain, DOMAINS, indikatorById, INDIKATOR, KEYS, SEED_USERS } from '../../lib/epss'
import { ROLES } from '../../config/menu'
import closeIcon from '../../assets/rencana/close-line.svg'
import triangle from '../../assets/rencana/dropdown-triangle.svg'
import bookIcon from '../../assets/icons/book-mark-fill.svg'
import removeIcon from '../../assets/icons/close-circle-line.svg'
import uploadIcon from '../../assets/icons/upload-cloud-2-fill.svg'

// Jenis file output bukti dukung → atribut accept untuk pilihan file contoh
const JENIS_FILE = { PDF: '.pdf', 'Gambar (JPG/PNG)': 'image/*', Word: '.doc,.docx', Excel: '.xls,.xlsx', Lainnya: '' }

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
// indikator = record bukti kegiatan ini; yang sudah diajukan/diverifikasi tidak bisa dilepas
// Panel samping "Daftar Indikator": semua indikator per domain beserta bobotnya
function DaftarIndikator({ onClose }) {
  return (
    <aside className="flex w-[min(476px,calc(100vw-2rem))] shrink-0 flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20.9px_rgba(0,0,0,0.25)] xl:max-h-[calc(100vh-2rem)]">
      <header className="flex h-[73px] shrink-0 items-center justify-between bg-grey-500 px-[29.5px]">
        <h2 className="text-[20px] leading-[1.2] font-semibold text-white">Daftar Indikator</h2>
        <button type="button" onClick={onClose} aria-label="Tutup daftar indikator">
          <img src={closeIcon} alt="" width={24} height={24} />
        </button>
      </header>
      <div className="flex flex-col gap-[25px] overflow-y-auto px-[18.5px] py-[25px] text-grey-500">
        {DOMAINS.map((domain, d) => (
          <section key={domain.id} className="flex flex-col gap-[11px]">
            <p className="flex flex-wrap items-center gap-[11px] text-[13px] leading-[1.2] font-semibold">
              Domain {d + 1} - {domain.nama}
              <span className="flex h-[25px] items-center rounded-[20px] border border-grey-400 bg-lime-75 px-3 text-[10px] font-normal">Bobot domain: {bobotDomain(domain)}%</span>
            </p>
            <ul className="rounded-[13px] bg-lime-50 py-[10px]">
              {INDIKATOR.filter((i) => i.domain === domain).map((i) => (
                <li key={i.id} className="flex flex-col gap-1 border-b border-grey-75/60 px-5 py-[7px] leading-[1.2] last:border-0">
                  <p className="flex flex-wrap items-center gap-x-[22px] gap-y-1 text-[13px] font-medium">
                    Indikator {i.nomor}: {i.nama}
                    <span className="flex h-[25px] items-center rounded-[20px] border border-grey-500 bg-green-50 px-3 text-[10px] font-normal">Bobot: {i.bobot}%</span>
                  </p>
                  <p className="text-[10px] font-light">Aspek: {i.aspek}</p>
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
  const [users] = useStore(KEYS.users, SEED_USERS)
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
      className="m-auto max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto bg-transparent font-sans backdrop:bg-black/40 xl:overflow-visible"
    >
      {/* Layar lebar: form & daftar indikator berdampingan, masing-masing bergulir sendiri; layar kecil: bertumpuk */}
      <div className="flex flex-col items-start gap-6 xl:flex-row xl:gap-[43px]">
      <form
        onSubmit={handleSubmit}
        className={`w-[min(833px,calc(100vw-2rem))] shrink-0 rounded-[20px] bg-white shadow-[0_4px_20.9px_rgba(0,0,0,0.25)] xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto ${
          daftarIndikator ? 'xl:w-[min(833px,calc(100vw-2rem-519px))]' : ''
        }`}
      >
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

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-[13px]">
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
            {/* PIC dicocokkan dengan akun operator: hanya PIC yang bisa mengunggah bukti kegiatan ini */}
            <input name="pic" required list="daftar-operator" defaultValue={kegiatan.pic} placeholder="Cari nama PIC..." className={inputClass} />
            <datalist id="daftar-operator">
              {users
                .filter((u) => u.role === ROLES.OPERATOR && u.status_aktif !== false)
                .map((u) => (
                  <option key={u.id} value={u.username} />
                ))}
            </datalist>
          </Field>
          <Field label="Deskripsi Kegiatan">
            <textarea name="deskripsi" defaultValue={kegiatan.deskripsi} placeholder="Isi deskripsi..." className={`${inputClass} h-[177px] resize-none py-[17px]`} />
          </Field>

          <div className="flex flex-col gap-[7px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="pilih-indikator" className="text-base leading-[1.2] font-semibold text-grey-500">
                Pemetaan Indikator EPSS (Indikator Tertaut)
              </label>
              <button
                type="button"
                onClick={() => setDaftarIndikator((buka) => !buka)}
                aria-expanded={daftarIndikator}
                className="flex items-center gap-[10px] rounded-[10px] bg-lime-300 px-3 py-1 text-[13px] text-grey-500"
              >
                <img src={bookIcon} alt="" width={15} height={15} />
                Lihat Pedoman Indikator
              </button>
            </div>
            <span className="relative">
              <select
                id="pilih-indikator"
                value=""
                onChange={(e) => setDipetakan((ids) => [...ids, e.target.value])}
                className={`${inputClass} appearance-none border-[#b4b4b4] font-light text-grey-75`}
              >
                <option value="">Pilih indikator yang akan ditambahkan...</option>
                {INDIKATOR.filter((i) => !dipetakan.includes(i.id)).map((i) => (
                  <option key={i.id} value={i.id}>
                    Indikator {i.nomor}: {i.nama}
                  </option>
                ))}
              </select>
              <img src={triangle} alt="" width={17} height={11} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 -scale-y-100" />
            </span>
            {dipetakan.map((id) => (
              <p key={id} className="flex items-center justify-between gap-3 rounded-[10px] bg-lime-300 px-[10px] py-[6px] text-[13px] leading-[1.2] text-grey-500">
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
            <p className="text-base leading-[1.2] font-semibold text-grey-500">Output Bukti Dukung yang Ditargetkan</p>
            <div className="flex flex-col gap-[7px]">
              <div className="flex flex-col gap-[10px] sm:flex-row">
                <input
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
                  className={`${inputClass} sm:flex-[3]`}
                />
                <span className="relative sm:flex-1">
                  <select
                    value={jenisOutput}
                    onChange={(e) => setJenisOutput(e.target.value)}
                    aria-label="Jenis file"
                    className={`${inputClass} appearance-none border-[#b4b4b4] pr-12 ${jenisOutput ? '' : 'font-light text-grey-75'}`}
                  >
                    <option value="">Pilih Jenis File</option>
                    {Object.keys(JENIS_FILE).map((jenis) => (
                      <option key={jenis}>{jenis}</option>
                    ))}
                  </select>
                  <img src={triangle} alt="" width={17} height={11} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 -scale-y-100" />
                </span>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files[0]) tambahOutput(e.dataTransfer.files[0])
                }}
                className="flex h-[175px] flex-col items-center justify-center gap-[10px] rounded-[15px] border-2 border-dashed border-grey-75 px-5 text-center leading-[1.2] text-grey-200"
              >
                <img src={uploadIcon} alt="" width={24} height={24} />
                <p>
                  <span className="block text-base font-bold">Unggah File</span>
                  <span className="block text-[13px]">Unggah atau seret dan lepas ke dalam kotak ini</span>
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
                <button type="button" onClick={() => fileContoh.current.click()} className="rounded-[16px] bg-grey-300 px-5 py-[10px] text-base text-lime-300">
                  Pilih File
                </button>
              </div>
              <p className="text-[13px] text-grey-200">Tekan Enter untuk menambah target tanpa file contoh.</p>

              {output.map((o) => (
                <p key={o.id} className="flex min-h-[45px] items-center justify-between gap-3 rounded-[15px] bg-lime-300 px-5 py-2 text-base leading-[1.2] text-[#4f4f4f]">
                  <span className="min-w-0">
                    {o.judul}
                    {o.jenis && <span className="text-[13px]"> ({o.jenis})</span>}
                    {o.contoh && <span className="block truncate text-[13px] text-grey-200">Contoh: {o.contoh.nama}</span>}
                  </span>
                  <button type="button" onClick={() => setOutput((list) => list.filter((x) => x.id !== o.id))} aria-label={`Hapus output ${o.judul}`} className="shrink-0">
                    <img src={removeIcon} alt="" width={24} height={24} className="grayscale" />
                  </button>
                </p>
              ))}
            </div>
          </div>

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
      {daftarIndikator && <DaftarIndikator onClose={() => setDaftarIndikator(false)} />}
      </div>
    </dialog>
  )
}

export default KegiatanForm
