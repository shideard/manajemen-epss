import { useEffect, useRef, useState } from 'react'
import { kelompokOutput, LEVELS } from '../../lib/epss'
import { useConfirm } from '../../components/useConfirm'
import { usePeriode, useSemuaKegiatan } from '../../lib/store'
import { levelTerpakai } from './kegiatan'
import { DialogHeader, Dropdown, Field, FormError, Input, ModalActions, Select } from '../../components/ui'
import { buttonClass, fieldClass } from '../../components/classes'
import bookIcon from '../../assets/icons/book-mark-fill.svg'
import removeIcon from '../../assets/icons/close-circle-line.svg'
import uploadIcon from '../../assets/icons/upload-cloud-2-fill.svg'

// Jenis file output bukti dukung → atribut accept untuk berkas contoh (server menerima PDF, Word, Excel, JPG, PNG)
const JENIS_FILE = { PDF: '.pdf', 'Gambar (JPG/PNG)': '.jpg,.jpeg,.png', Word: '.doc,.docx', Excel: '.xls,.xlsx', Lainnya: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png' }

// Modal pakai <dialog> bawaan browser: Esc, fokus, dan backdrop sudah ditangani
// indikator = record bukti kegiatan ini; yang sudah diajukan/diverifikasi tidak bisa dilepas
// Panel samping "Daftar Indikator": semua indikator per domain beserta bobotnya
function DaftarIndikator({ indikatorPilihan = [], onClose }) {
  const domains = new Map()
  for (const item of indikatorPilihan) {
    const source = item.domain
    if (!domains.has(source.id)) domains.set(source.id, { ...source, indikator: [] })
    domains.get(source.id).indikator.push(item)
  }

  return (
    <aside className="flex w-[min(476px,calc(100vw-2rem))] shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-lg xl:max-h-[calc(100vh-2rem)]">
      <DialogHeader title="Daftar Indikator" onClose={onClose} closeLabel="Tutup daftar indikator" />
      <div className="flex flex-col gap-6 overflow-y-auto px-5 py-6">
        {[...domains.values()].map((domain) => (
          <section key={domain.id} className="flex flex-col gap-3">
            <p className="flex flex-wrap items-center gap-3 text-small font-semibold">
              Domain {domain.kode} - {domain.nama}
              <span className="flex h-6 items-center rounded-full border border-grey-500 bg-lime-75 px-3 text-caption font-normal">Bobot domain: {domain.indikator.reduce((sum, item) => sum + Number(item.bobot), 0)}%</span>
            </p>
            <ul className="rounded-md bg-lime-50 py-2.5">
              {domain.indikator.map((i) => (
                <li key={i.id} className="flex flex-col gap-1 border-b border-grey-75/50 px-5 py-2 last:border-0">
                  <p className="flex items-center justify-between gap-5.5 text-small font-medium">
                    <span className="min-w-0">
                      Indikator {i.nomor ?? i.kode}: {i.nama}
                    </span>
                    <span className="flex h-6 shrink-0 items-center rounded-full border border-grey-500 bg-green-50 px-3 text-caption font-normal">Bobot: {i.bobot}%</span>
                  </p>
                  <p className="text-caption font-light">Aspek: {i.aspek.nama}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}

// Input satu target output di bawah satu indikator: isi judul, jenis, dan (opsional) file contoh,
// lalu output baru ditambahkan lewat tombol "Tambah Output". Memilih file tidak langsung menambah output.
// lainnya = indikator tertaut lain ({ id, label }) yang bisa ikut memakai output ini
function TambahOutput({ onTambah, lainnya = [] }) {
  const [judul, setJudul] = useState('')
  const [jenis, setJenis] = useState('')
  const [file, setFile] = useState(null)
  const [juga, setJuga] = useState(() => new Set())
  const fileContoh = useRef(null)
  const bisaTambah = Boolean(judul.trim() || file)

  function tambah() {
    if (!bisaTambah) return
    onTambah({ judul: judul.trim() || file.name, jenis, contoh: file?.name ?? '', file: file ?? undefined }, [...juga].filter((id) => lainnya.some((i) => i.id === id)))
    setJudul('')
    setFile(null)
    setJuga(new Set())
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Input
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          // Enter menambah target, bukan mengirim form
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              tambah()
            }
          }}
          aria-label="Judul bukti dukung yang ditargetkan"
          placeholder="Tulis Contoh Judul Bukti Dukung yang Ditargetkan"
          className="sm:flex-3"
        />
        <Select value={jenis} onChange={(e) => setJenis(e.target.value)} aria-label="Jenis file" className="sm:flex-1">
          <option value="">Pilih Jenis File</option>
          {Object.keys(JENIS_FILE).map((j) => (
            <option key={j}>{j}</option>
          ))}
        </Select>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0])
        }}
        className="flex h-[175px] flex-col items-center justify-center gap-2.5 rounded-md border-2 border-dashed border-grey-75 px-5 text-center text-grey-200"
      >
        <img src={uploadIcon} alt="" width={24} height={24} />
        {file ? (
          <p className="flex max-w-full items-center gap-2 text-grey-500">
            <span className="truncate font-semibold">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} aria-label={`Batalkan file ${file.name}`} className="shrink-0">
              <img src={removeIcon} alt="" width={20} height={20} className="grayscale" />
            </button>
          </p>
        ) : (
          <p>
            <span className="block font-semibold">Unggah File Contoh</span>
            <span className="block text-small">Unggah atau seret dan lepas ke dalam kotak ini</span>
          </p>
        )}
        <input
          ref={fileContoh}
          type="file"
          accept={JENIS_FILE[jenis] ?? JENIS_FILE.Lainnya}
          onChange={(e) => {
            if (e.target.files[0]) setFile(e.target.files[0])
            e.target.value = ''
          }}
          className="hidden"
        />
        <button type="button" onClick={() => fileContoh.current.click()} className={buttonClass('outline', 'sm')}>
          {file ? 'Ganti File' : 'Pilih File'}
        </button>
      </div>
      <p className="text-small text-grey-200">File contoh opsional: PDF, Word, Excel, JPG, atau PNG, maksimal 10 MB.</p>

      {/* Output yang sama untuk indikator lain: cukup dibuat sekali, operator cukup unggah sekali */}
      {lainnya.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-small font-semibold">Berlaku juga untuk:</span>
          {lainnya.map((i) => {
            const aktif = juga.has(i.id)
            return (
              <label key={i.id} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-small ${aktif ? 'border-grey-500 bg-lime-300' : 'border-grey-75 hover:bg-grey2-75'}`}>
                <input
                  type="checkbox"
                  checked={aktif}
                  onChange={(e) => setJuga((set) => {
                    const baru = new Set(set)
                    if (e.target.checked) baru.add(i.id)
                    else baru.delete(i.id)
                    return baru
                  })}
                  className="size-3.5 accent-grey-300"
                />
                {i.label}
              </label>
            )
          })}
        </div>
      )}

      <button type="button" onClick={tambah} disabled={!bisaTambah} className={`self-start ${buttonClass()}`}>
        Tambah Output
      </button>
    </div>
  )
}

// keterangan(o) = teks tambahan per output, mis. "Juga untuk Indikator 3"
function DaftarOutput({ items, onHapus, keterangan = () => null }) {
  if (!items.length) return null
  return (
    <ul className="flex flex-col gap-2">
      {items.map((o) => (
        <li key={o.index} className="flex min-h-[45px] items-center justify-between gap-3 rounded-md bg-lime-100 px-5 py-2">
          <span className="min-w-0">
            {o.judul}
            {o.jenis && <span className="text-small"> ({o.jenis})</span>}
            {o.contoh && <span className="block truncate text-small text-grey-200">Contoh: {o.contoh}</span>}
            {keterangan(o) && <span className="block text-small text-grey-200">{keterangan(o)}</span>}
          </span>
          <button type="button" onClick={() => onHapus(o.index)} aria-label={`Hapus output ${o.judul}`} className="shrink-0">
            <img src={removeIcon} alt="" width={24} height={24} className="grayscale" />
          </button>
        </li>
      ))}
    </ul>
  )
}

function KegiatanForm({ kegiatan, indikator = [], opds = [], pics = [], indikatorPilihan = [], onSave, onClose }) {
  const dialogRef = useRef(null)
  const [error, setError] = useState('')
  // [{ id, level }]: indikator tertaut beserta level yang ditargetkan dipenuhi kegiatan ini
  const [dipetakan, setDipetakan] = useState(() => indikator.map((item) => ({ id: item.id ?? item.indikatorId, level: item.level ?? 1 })))
  // Level indikator yang sudah dipakai kegiatan lain di periode ini tidak bisa dipilih lagi
  const { aktif } = usePeriode()
  const terpakai = levelTerpakai(useSemuaKegiatan(aktif?.id).kegiatan, kegiatan.id)
  const levelMulai = kegiatan.id ? 1 : 2
  const levelBebas = (id) => {
    for (let level = levelMulai; level <= LEVELS.length; level++) {
      if (!terpakai[id]?.[level]) return level
    }
    return 0
  }
  const namaIndikator = (id) => {
    const i = indikatorPilihan.find((x) => x.id === id) ?? indikator.find((x) => x.id === id)
    return i ? `Indikator ${i.nomor ?? i.kode}: ${i.nama}` : id
  }
  const kodeIndikator = (id) => {
    const i = indikatorPilihan.find((x) => x.id === id) ?? indikator.find((x) => x.id === id)
    return `Indikator ${i ? (i.nomor ?? i.kode) : '?'}`
  }
  // id = output yang sudah tersimpan (berkas contohnya dipertahankan); file = berkas contoh baru yang diunggah saat simpan
  // indikatorIds = indikator tempat output ditargetkan (bisa beberapa); kosong = output lama atau indikatornya sudah dilepas
  const [output, setOutput] = useState(() => (kegiatan.output ?? []).map((item) => ({
    id: item.id,
    indikatorIds: item.indikatorIds ?? [],
    judul: item.judul ?? '',
    jenis: item.jenis ?? '',
    contoh: item.contoh?.nama ?? '',
  })))
  const [daftarIndikator, setDaftarIndikator] = useState(false)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  // Melepas indikator tidak menghapus output-nya. Output yang tidak punya indikator lain pindah ke "Output tanpa indikator"
  function lepas(id) {
    const lepaskan = () => {
      setDipetakan((list) => list.filter((d) => d.id !== id))
      setOutput((list) => list.map((o) => ({ ...o, indikatorIds: o.indikatorIds.filter((x) => x !== id) })))
    }
    const jumlah = output.filter((o) => o.indikatorIds.length === 1 && o.indikatorIds[0] === id).length
    if (!jumlah) return lepaskan()
    konfirmasi({
      title: 'Lepas Indikator',
      message: `${namaIndikator(id)} punya ${jumlah} output bukti dukung yang tidak dipakai indikator lain. Output tidak dihapus, tetapi dipindah ke "Output tanpa indikator".`,
      confirmLabel: 'Lepas',
      onConfirm: lepaskan,
    })
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
      await onSave({ ...data, indikator_ids: dipetakan.map((d) => d.id), levels: Object.fromEntries(dipetakan.map((d) => [d.id, d.level])), output })
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

          {/* Alur: tetapkan indikator + level dulu, lalu output bukti dukung yang ditargetkan diisi di bawah indikator itu */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="pilih-indikator" className="font-semibold">
                Indikator Tertaut & Output Bukti Dukung yang Ditargetkan
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
              <>
                <p className="text-small text-grey-200">Pilih indikator dan levelnya, lalu tambahkan output bukti dukung yang ditargetkan di bawah indikator tersebut.</p>
                <Select id="pilih-indikator" value="" onChange={(e) => setDipetakan((list) => [...list, { id: e.target.value, level: levelBebas(e.target.value) }])}>
                  <option value="">Pilih indikator yang akan ditambahkan...</option>
                  {indikatorPilihan.filter((i) => !dipetakan.some((d) => d.id === i.id) && levelBebas(i.id) > 0).map((i) => (
                    <option key={i.id} value={i.id}>
                      Indikator {i.nomor ?? i.kode}: {i.nama}
                    </option>
                  ))}
                </Select>
              </>
            {dipetakan.length === 0 && (
              <p className="rounded-md border border-dashed border-grey-75 px-5 py-4 text-center text-small text-grey-200">
                Belum ada indikator tertaut. Pilih indikator untuk mulai menambahkan output bukti dukung.
              </p>
            )}

            {kelompokOutput(output, dipetakan).map(({ indikator: d, output: milik }) => (
              <section key={d?.id ?? 'tanpa-indikator'} className="overflow-hidden rounded-md border border-grey-75">
                {d ? (
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 bg-lime-300 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,18rem)_auto]">
                    <span className="min-w-0 break-words font-medium">{namaIndikator(d.id)}</span>
                      <>
                        <Dropdown
                          value={d.level}
                          label={`Level untuk ${namaIndikator(d.id)}`}
                          size="small"
                          onChange={(value) => setDipetakan((list) => list.map((x) => (x.id === d.id ? { ...x, level: Number(value) } : x)))}
                          className="col-span-2 w-full sm:col-span-1 sm:col-start-2 sm:row-start-1"
                          options={LEVELS.map((nama, i) => ({
                            value: i + 1,
                            label: `Level ${i + 1} (${nama})${terpakai[d.id]?.[i + 1] ? ` - dipakai ${terpakai[d.id][i + 1]}` : ''}`,
                            disabled: i + 1 < levelMulai || Boolean(terpakai[d.id]?.[i + 1]),
                          })).filter((option) => option.value >= levelMulai)}
                        />
                        <button type="button" onClick={() => lepas(d.id)} aria-label={`Lepas ${namaIndikator(d.id)}`} className="col-start-2 row-start-1 sm:col-start-3 sm:row-auto">
                          <img src={removeIcon} alt="" width={24} height={24} className="grayscale" />
                        </button>
                      </>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 bg-grey2-75 px-5 py-3">
                    <span className="font-medium">Output tanpa indikator</span>
                    <span className="text-small text-grey-200">Output data lama atau dari indikator yang sudah dilepas. Hapus bila tidak diperlukan lagi.</span>
                  </div>
                )}
                <div className="flex flex-col gap-2.5 px-5 py-4">
                  {d && <p className="text-small font-semibold">Output bukti dukung yang ditargetkan</p>}
                  <DaftarOutput
                    items={milik}
                    keterangan={(o) => {
                      const lain = d ? o.indikatorIds.filter((id) => id !== d.id) : []
                      return lain.length ? `Juga untuk ${lain.map(kodeIndikator).join(', ')}` : null
                    }}
                    // Di kartu indikator: lepas output dari indikator ini saja; dihapus bila tidak dipakai indikator lain
                    onHapus={(index) => setOutput((list) => list.flatMap((o, i) => {
                      if (i !== index) return [o]
                      const sisa = d ? o.indikatorIds.filter((id) => id !== d.id) : []
                      return sisa.length ? [{ ...o, indikatorIds: sisa }] : []
                    }))}
                  />
                  {d && (
                    <TambahOutput
                      lainnya={dipetakan.filter((x) => x.id !== d.id).map((x) => ({ id: x.id, label: kodeIndikator(x.id) }))}
                      onTambah={(o, juga) => setOutput((list) => [...list, { ...o, indikatorIds: [d.id, ...juga] }])}
                    />
                  )}
                </div>
              </section>
            ))}
          </div>

          <FormError>{error}</FormError>
          <ModalActions onCancel={close} submitLabel="Simpan" />
        </div>
      </form>
      {daftarIndikator && <DaftarIndikator indikatorPilihan={indikatorPilihan} onClose={() => setDaftarIndikator(false)} />}
      </div>
      {dialogKonfirmasi}
    </dialog>
  )
}

export default KegiatanForm
