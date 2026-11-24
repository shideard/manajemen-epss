import { useRef, useState } from 'react'
import { Building2, CalendarDays, Clock3, File, FileImage, FileSpreadsheet, FileText, FileType, UserRound } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useBukti, useDetailKegiatan, useDokumenBukti, useInstrumen, usePeriode, useRencanaKegiatan, useSemuaKegiatan, useSkor } from '../../lib/store'
import { buktiKey, formatTanggal, kelompokOutput, LEVELS, metaBerkas } from '../../lib/epss'
import { bukaBerkas } from '../../lib/api'
import { bolehUbah } from '../../config/menu'
import { Badge, ChecklistItem, ContohOutput, FormError, Memuat, Notice, PageHeader, StatusBukti } from '../../components/ui'
import { buttonClass } from '../../components/classes'
import { useConfirm } from '../../components/useConfirm'
import PedomanModal from '../../components/PedomanModal'
import PilihIndikatorModal from './PilihIndikatorModal'
import searchIcon from '../../assets/rencana/search-2-line.svg'
import arrowUpRight from '../../assets/rencana/arrow-right-up-line.svg'
import bookIcon from '../../assets/icons/book-mark-fill-sm.svg'
import eyeIcon from '../../assets/icons/eye-line.svg'
import deleteIcon from '../../assets/icons/delete-bin-2-fill.svg'
import addIcon from '../../assets/rencana/add-circle-fill.svg'
import mindMap from '../../assets/icons/mind-map.svg'

// Logo jenis file satu output: dari jenis yang dipilih verifikator, atau dari nama berkas contohnya
const IKON_JENIS = [
  [/pdf/, FileText],
  [/gambar|jpe?g|png/, FileImage],
  [/word|docx?/, FileType],
  [/excel|xlsx?/, FileSpreadsheet],
]
const ikonJenis = (output) => IKON_JENIS.find(([pola]) => pola.test(`${output.jenis ?? ''} ${output.contoh?.nama ?? ''}`.toLowerCase()))?.[1] ?? File

// Satu berkas bukti (baris ringkas): nama, info, tombol lihat/hapus; children = keterangan tambahan (mis. indikator tertaut)
function BerkasBaris({ f, onLihat, onHapus, children }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-sm bg-grey2-75 px-4 py-2.5">
      <div className="flex min-w-0 items-start gap-3">
        <FileText size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-grey-300" />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-small font-medium">{f.nama}</span>
          <span className="text-caption text-grey-200">
            {metaBerkas(f)}
            {f.sumber && ` · Pintasan dari ${f.sumber.kegiatanNama}`}
          </span>
          {children}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => onLihat(f)} aria-label={`Lihat ${f.nama}`} title="Lihat berkas" className="grid size-6 place-items-center rounded-xs bg-lime-300">
          <img src={eyeIcon} alt="" width={18} height={18} />
        </button>
        {onHapus && f.isCurrent && (
          <button type="button" onClick={() => onHapus(f)} aria-label={`Hapus ${f.nama}`} title="Hapus berkas" className="grid size-6 place-items-center rounded-xs bg-red-200">
            <img src={deleteIcon} alt="" width={18} height={18} />
          </button>
        )}
      </div>
    </li>
  )
}

// Checklist satu indikator, hanya untuk level yang ditargetkan verifikator pada kegiatan ini.
// Tiap centang langsung tersimpan sebagai draft, jadi tidak hilang saat pindah halaman
function IndikatorBukti({ bukti, indikator, level, levelTerverifikasi, jumlahBerkas, readOnly, onSave }) {
  const checked = bukti.checked ?? {}
  const [pedoman, setPedoman] = useState(false)
  const [error, setError] = useState('')
  const [konfirmasi, dialogKonfirmasi] = useConfirm()
  const terkunci = readOnly || bukti.status === 'menunggu' || bukti.status === 'terverifikasi'
  const syarat = indikator.levels[level - 1]?.syarat ?? []
  const baris = syarat.map((_, i) => Boolean(checked[level]?.[i]))
  const lengkap = baris.length > 0 && baris.every(Boolean)

  function centang(index, value) {
    setError('')
    onSave({ checked: { [level]: baris.map((v, i) => (i === index ? value : v)) } }).catch((err) => setError(err.message))
  }

  function ajukan() {
    if (jumlahBerkas === 0) return setError('Unggah minimal satu berkas bukti dukung untuk indikator ini (lewat output atau berkas umum) sebelum mengajukan verifikasi.')
    if (!lengkap) return setError(`Centang seluruh persyaratan Level ${level} sebelum mengajukan verifikasi.`)
    konfirmasi({
      title: 'Ajukan Verifikasi',
      message: `Ajukan bukti dukung Indikator ${indikator.nomor} untuk Level ${level} (${LEVELS[level - 1]}) ke verifikator? Checklist tidak bisa diubah selama menunggu verifikasi.`,
      confirmLabel: 'Ajukan',
      onConfirm: () => onSave({ checked: { [level]: baris }, ajukan: true }).catch((err) => setError(err.message)),
    })
  }

  return (
    <article className="flex flex-col gap-5 rounded-lg bg-grey-300 pt-5">
      <header className="flex flex-wrap justify-between gap-4 px-9 text-lime-300">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">
            Domain {indikator.domainNomor} : {indikator.domain.nama}
          </p>
          <p className="font-light">
            Indikator {indikator.nomor}: {indikator.nama} (Bobot BPS: {indikator.bobot.toFixed(1)}%)
          </p>
        </div>
        <div className="flex flex-col gap-2 text-right">
          <p className="font-semibold">Level yang Dipenuhi Kegiatan :</p>
          <p className="font-light">
            Level {level} ({LEVELS[level - 1]})
          </p>
          <p className="text-small font-light">Level indikator saat ini: {levelTerverifikasi ? `Level ${levelTerverifikasi}` : 'belum terverifikasi'}</p>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-lg bg-white px-7 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">Checklist Persyaratan Bukti Dukung (Level {level}) :</p>
          <StatusBukti status={bukti.status} className="text-small" />
        </div>
        {bukti.status === 'perbaikan' && bukti.catatan && (
          <Notice tone="red" className="text-small">Catatan verifikator: {bukti.catatan}</Notice>
        )}
        {syarat.map((item, i) => (
          <ChecklistItem key={item} checked={baris[i]} onChange={(value) => centang(i, value)} disabled={terkunci}>
            {item}
          </ChecklistItem>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">
            Persyaratan Level {level} : {baris.filter(Boolean).length} dari {baris.length} terpenuhi
          </p>
          <button
                    type="button"
                    onClick={() => setPedoman(true)}
                    className={buttonClass('secondary', 'sm')}
                  >
                    <img src={bookIcon} alt="" width={15} height={15} />
                    Pedoman &amp; Syarat
            </button>
        </div>

        <FormError>{error}</FormError>
        {bukti.status === 'menunggu' && (
          <p role="status" className="text-small text-lime-500 text-end py-2">
            Ajuan telah terkirim ke verifikator. Silakan cek status ajuan secara berkala.
          </p>
        )}
        {!terkunci && (
          <div className="flex flex-wrap items-center justify-end gap-4">
            <p role="status" className="text-small text-grey-200">
              Draft tersimpan otomatis.
            </p>
            <button type="button" onClick={ajukan} className={buttonClass()}>
              Ajukan Verifikasi
            </button>
          </div>
        )}
      </div>

      {pedoman && <PedomanModal indikator={indikator} level={level} onClose={() => setPedoman(false)} />}
      {dialogKonfirmasi}
    </article>
  )
}

function RepositoriDetail() {
  const { kegiatanId } = useParams()
  const { pathname } = useLocation()
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const dariRencana = pathname.startsWith('/rencana-kegiatan/')
  const daftarKegiatanPath = dariRencana ? '/rencana-kegiatan' : '/repositori-bukti-dukung'
  const detailKegiatanPath = daftarKegiatanPath
  const { aktif } = usePeriode()
  const { kegiatan } = useRencanaKegiatan(aktif?.id)
  const semuaKegiatan = useSemuaKegiatan(aktif?.id)
  const detail = useDetailKegiatan(kegiatanId)
  const dokumen = useDokumenBukti(kegiatanId)
  const buktiData = useBukti()
  const instrumenData = useInstrumen(aktif?.id)
  const skorData = useSkor(instrumenData.indikator, semuaKegiatan.kegiatan, buktiData.bukti)
  const muat = [buktiData, skorData, dokumen, instrumenData, semuaKegiatan]
  const { bukti: semuaBukti, simpan: simpanAjuan } = buktiData
  const { levels } = skorData
  const [cari, setCari] = useState('')
  const [mengunggah, setMengunggah] = useState(false)
  const [errorBerkas, setErrorBerkas] = useState('')
  const [errorOutput, setErrorOutput] = useState('')
  const fileInput = useRef(null)
  // Output tujuan unggah dari tombol "Unggah" pada output yang ditargetkan
  const outputTujuan = useRef(null)
  // null | { mode: 'unggah' } | { mode: 'atur', berkas }: modal pilih indikator untuk berkas umum
  const [modalIndikator, setModalIndikator] = useState(null)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  if (detail.error?.status === 404) return <Navigate to={daftarKegiatanPath} replace />
  if (!detail.kegiatan || instrumenData.loading) return <Memuat dari={[detail, instrumenData]} bentuk="detail" />
  const k = detail.kegiatan

  // Berkas hanya bisa diunggah PIC kegiatan, jadi pengunggahnya = PIC
  const files = dokumen.dokumen.map((f) => ({ ...f, oleh: k.pic }))
  const tertaut = k.indikatorIds.map((id) => semuaBukti[buktiKey(k.id, id)] ?? { kegiatanId: k.id, indikatorId: id, status: 'draft' })
  // Operator lain boleh melihat sebagai referensi; hanya PIC yang bisa mengunggah, dan tidak saat periode dikunci
  const pic = k.pic_user_id === user.id
  const bolehEdit = pic && bolehUbah(user, 'unggahBukti', aktif)
  // Aturan backend: berkas kegiatan yang sudah punya ajuan terverifikasi tidak boleh dihapus
  const bolehHapus = bolehEdit && !tertaut.some((b) => b.status === 'terverifikasi')
  // Id indikator di halaman ini = kode; berkas menyimpan id API indikator
  const idApi = (kode) => k.indikator.find((i) => String(i.kode) === String(kode))?.id
  const namaIndikator = (id) => k.indikator.find((i) => i.id === id)
  const berkasUmum = files.filter((f) => !f.outputId)
  const detailKegiatan = [
    [Building2, 'OPD', k.opd],
    [UserRound, 'PIC', k.pic],
    [CalendarDays, 'Jadwal', `${formatTanggal(k.mulai)} - ${formatTanggal(k.selesai)}`],
    ...(aktif?.batas ? [[Clock3, 'Deadline Bukti', formatTanggal(aktif.batas)]] : []),
  ]

  // Unggah berkas untuk satu output yang ditargetkan; indikatornya mengikuti output tersebut
  async function unggahUntukOutput(event) {
    const pilihan = [...event.target.files]
    event.target.value = ''
    setErrorOutput('')
    setMengunggah(true)
    try {
      await dokumen.unggah(pilihan, { outputId: outputTujuan.current })
      buktiData.muatUlang()
    } catch (error) {
      setErrorOutput(Object.values(error.errors ?? {}).flat()[0] ?? error.message)
    } finally {
      setMengunggah(false)
    }
  }

  function pilihBerkasOutput(output) {
    outputTujuan.current = output.id
    fileInput.current.click()
  }

  async function lihat(f) {
    setErrorBerkas('')
    try {
      await dokumen.buka(f)
    } catch (error) {
      setErrorBerkas(error.message)
    }
  }

  function hapus(f) {
    setErrorBerkas('')
    konfirmasi({
      title: 'Hapus Berkas',
      message: `Hapus "${f.nama}" dari kegiatan ini? Kegiatan lain yang memakai berkas yang sama tidak terpengaruh.${
        tertaut.some((b) => b.status === 'menunggu') ? ' Ajuan yang sedang menunggu verifikasi akan ditarik kembali ke draft.' : ''
      }`,
      confirmLabel: 'Hapus',
      danger: true,
      onConfirm: async () => {
        await dokumen.hapus(f)
        buktiData.muatUlang()
      },
    })
  }

  const simpanBukti = (indikatorId, perubahan) => simpanAjuan(k, indikatorId, perubahan)

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} bentuk="detail" />
      <PageHeader
        back={daftarKegiatanPath}
        title="Pengumpulan Bukti Dukung"
        subtitle="Unggah dan kelola berkas bukti fisik terpusat berdasarkan kegiatan statistik dan indikator EPSS yang telah dipetakan."
      />

      {!bolehEdit && (
        <Notice tone="yellow">
          {!pic
            ? `Anda bukan PIC kegiatan ini (PIC: ${k.pic}). Halaman ini hanya dapat dilihat sebagai referensi.`
            : 'Periode aktif sudah dikunci. Bukti dukung hanya dapat dilihat.'}
        </Notice>
      )}

      <section className="flex flex-col gap-5 rounded-lg border-5 border-dashed border-lime-500 bg-lime-300 px-2.5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4.5">
          {/* Input dengan datalist bawaan browser untuk pindah ke kegiatan lain */}
          <label className="relative flex h-[45px] w-[330px] max-w-full items-center">
            <span className="sr-only">Cari rencana kegiatan</span>
            <img src={searchIcon} alt="" width={31} height={31} className="pointer-events-none absolute left-2 rounded-sm bg-grey-300" />
            <input
              list="daftar-kegiatan"
              value={cari}
              onChange={(e) => {
                setCari(e.target.value)
                const tujuan = kegiatan.find((item) => item.nama === e.target.value)
                if (tujuan) {
                  setCari('')
                  navigate(`${detailKegiatanPath}/${tujuan.id}`)
                }
              }}
              placeholder="Cari Rencana Kegiatan..."
              className="size-full rounded-md bg-grey2-75 pr-4 pl-13 placeholder:font-light placeholder:text-grey-75 placeholder:italic focus:outline-2 focus:outline-grey-300"
            />
            <datalist id="daftar-kegiatan">
              {kegiatan.map((item) => (
                <option key={item.id} value={item.nama} />
              ))}
            </datalist>
          </label>
          <Link to="/rencana-kegiatan" className={`gap-4! ${buttonClass('outline')}`}>
            Lihat Daftar Rencana Kegiatan
            <img src={arrowUpRight} alt="" width={24} height={24} />
          </Link>
        </div>

        <div className="flex flex-col items-center gap-12.5 rounded-lg bg-grey2-50 px-4 py-9 md:px-10">
          <div className="flex w-full flex-col items-center gap-4">
            <span className="rounded-md border border-grey-500 px-5 py-1">Rencana Kegiatan</span>
            <h2 className="text-center text-h2">{k.nama}</h2>
            <hr className="w-full border-grey-50" />
            {/* Selebar kartu. OPD dan Jadwal memakai dua kolom supaya isinya muat satu baris; jumlah kolom mengikuti ada tidaknya Deadline Bukti */}
            <dl className={`grid w-full grid-cols-1 gap-4 text-center ${detailKegiatan.length === 4 ? 'sm:grid-cols-6' : 'sm:grid-cols-5'}`}>
              {detailKegiatan.map(([Icon, label, value]) => (
                <div key={label} className={`flex flex-col items-center gap-2 ${label === 'Jadwal' || label === 'OPD' ? 'sm:col-span-2' : ''}`}>
                  <Icon size={25} aria-hidden="true" className="text-white bg-grey-500 py-1 px-1 rounded-xs" />
                  <dt className="font-bold">{label}</dt>
                  <dd className="flex min-h-14 w-full items-center justify-center rounded-sm bg-lime-100 px-4 py-2"><span>{value}</span></dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="flex flex-wrap items-center gap-4 font-semibold">
            Kelengkapan Bukti Kegiatan:
            <span className="flex h-6 items-center gap-2.5 rounded-sm bg-lime-300 px-5 font-medium">
              <img src={bookIcon} alt="" width={15} height={15} />
              {files.length} Berkas Terunggah
            </span>
          </p>
          <hr className="w-full border-grey-50" />

          {/* Output yang ditargetkan diisi verifikator di form Rencana Kegiatan; berkas diunggah per output */}
          {k.output?.length > 0 && (
            <section className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-h3">Output Bukti Dukung yang Ditargetkan</h3>
                {bolehEdit && <p className="text-small text-grey-200">Unggah berkas pada output yang sesuai. Berkas otomatis tertaut ke indikator output tersebut.</p>}
              </div>
              {/* Satu kartu per indikator; indikator tanpa output tidak ditampilkan */}
              {kelompokOutput(k.output, k.indikator).filter((g) => g.output.length).map(({ indikator: ind, output: milik }) => (
                <div key={ind?.id ?? 'tanpa-indikator'} className="overflow-hidden rounded-md border border-grey-75 bg-white">
                  <p className="bg-grey-500 px-5 py-3 text-small font-semibold text-lime-300">
                    {ind ? `Indikator ${ind.kode}: ${ind.nama}` : 'Output tanpa indikator'}
                  </p>
                  <ul>
                    {milik.map((o) => {
                      const Ikon = ikonJenis(o)
                      const berkasOutput = files.filter((f) => f.outputId === o.id)
                      return (
                        <li key={o.id} className="flex flex-col gap-3 border-b border-grey-75/50 px-5 py-4 last:border-0">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3.5">
                              <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-lime-300">
                                <Ikon size={22} aria-hidden="true" />
                              </span>
                              <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="font-medium">{o.judul}</span>
                                <span className="text-small text-grey-200">
                                  {o.jenis || 'Jenis file bebas'} · {berkasOutput.length ? `${berkasOutput.length} berkas terunggah` : 'belum ada berkas'}
                                </span>
                                <ContohOutput kegiatanId={k.id} output={o} label="Contoh dari verifikator" />
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {o.contoh?.berkas && (
                                <button
                                  type="button"
                                  onClick={() => bukaBerkas(`/api/rencana-kegiatan/${k.id}/output-diharapkan/${o.id}/contoh`).then(() => setErrorOutput(''), (error) => setErrorOutput(error.message))}
                                  aria-label={`Pratinjau contoh ${o.judul}`}
                                  title="Pratinjau contoh"
                                  className="grid size-6 place-items-center rounded-xs bg-lime-300"
                                >
                                  <img src={eyeIcon} alt="" width={18} height={18} />
                                </button>
                              )}
                              {bolehEdit && (
                                <button type="button" onClick={() => pilihBerkasOutput(o)} disabled={mengunggah} className={buttonClass('primary', 'sm')}>
                                  {mengunggah ? 'Mengunggah…' : 'Unggah Berkas'}
                                </button>
                              )}
                            </div>
                          </div>
                          {berkasOutput.length > 0 && (
                            <ul className="flex flex-col gap-2 sm:pl-13.5">
                              {berkasOutput.map((f) => (
                                <BerkasBaris key={f.id} f={f} onLihat={lihat} onHapus={bolehHapus ? hapus : null} />
                              ))}
                            </ul>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
              {bolehEdit && <input ref={fileInput} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={unggahUntukOutput} className="hidden" />}
              <FormError>{errorOutput}</FormError>
            </section>
          )}

          {/* Berkas di luar output: wajib dikaitkan ke satu, beberapa, atau semua indikator tertaut */}
          <section className="flex w-full flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-h3">Dokumen Bukti Umum</h3>
                <p className="text-small text-grey-200">Berkas pendukung di luar output, ditautkan ke indikator yang didukungnya.</p>
              </div>
              {bolehEdit && (
                <button type="button" onClick={() => setModalIndikator({ mode: 'unggah' })} disabled={k.indikator.length === 0} className={buttonClass()}>
                  <img src={addIcon} alt="" width={19} height={19} />
                  Unggah Berkas Umum
                </button>
              )}
            </div>
            <div className="rounded-md border border-grey-75 bg-white p-3">
              {berkasUmum.length === 0 ? (
                <p className="py-6 text-center text-small text-grey-200">
                  {k.indikator.length === 0 ? 'Belum ada indikator tertaut, berkas umum belum dapat diunggah.' : 'Belum ada berkas umum.'}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {berkasUmum.map((f) => (
                    <BerkasBaris key={f.id} f={f} onLihat={lihat} onHapus={bolehHapus ? hapus : null}>
                      <span className="flex flex-wrap items-center gap-1.5">
                        {f.indikatorIds.length === 0 ? (
                          <Badge tone="red" className="px-3! py-0.5! text-caption">Belum ditautkan, belum terlihat oleh verifikator</Badge>
                        ) : (
                          f.indikatorIds.map((id) => (
                            <span key={id} className="rounded-full border border-grey-500 bg-lime-75 px-3 py-0.5 text-caption">
                              Indikator {namaIndikator(id)?.kode ?? '?'}
                            </span>
                          ))
                        )}
                        {bolehEdit && f.isCurrent && k.indikator.length > 0 && (
                          <button type="button" onClick={() => setModalIndikator({ mode: 'atur', berkas: f })} className="text-caption font-semibold underline">
                            Atur indikator
                          </button>
                        )}
                      </span>
                    </BerkasBaris>
                  ))}
                </ul>
              )}
            </div>
            {dialogKonfirmasi}
            <FormError>{errorBerkas}</FormError>
          </section>
        </div>
      </section>

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-center text-h2">Indikator Tertaut</h2>
        <span className="flex h-6 items-center gap-2.5 rounded-sm bg-grey-500 px-5 font-medium text-lime-300">
          <img src={mindMap} alt="" width={21} height={19} />
          {tertaut.length} Indikator Terpetakan
        </span>
        {tertaut.length === 0 && <p className="mt-3 text-grey-200">Belum ada indikator. Pemetaan indikator diatur verifikator di menu Rencana Kegiatan.</p>}
      </div>

      {tertaut.map((b) => (
        <IndikatorBukti
          key={`${b.indikatorId}:${b.status}`}
          bukti={b}
          indikator={instrumenData.byId[b.indikatorId]}
          level={k.levelTarget[b.indikatorId] ?? 1}
          levelTerverifikasi={levels[b.indikatorId]}
          jumlahBerkas={files.filter((f) => f.indikatorIds.includes(idApi(b.indikatorId))).length}
          readOnly={!bolehEdit}
          onSave={(perubahan) => simpanBukti(b.indikatorId, perubahan)}
        />
      ))}

      {modalIndikator && (
        <PilihIndikatorModal
          title={modalIndikator.mode === 'unggah' ? 'Unggah Berkas Umum' : `Atur Indikator: ${modalIndikator.berkas.nama}`}
          indikator={k.indikator}
          awal={modalIndikator.berkas?.indikatorIds}
          denganBerkas={modalIndikator.mode === 'unggah'}
          submitLabel={modalIndikator.mode === 'unggah' ? 'Unggah' : 'Simpan'}
          onSimpan={async (indikatorIds, pilihan) => {
            if (modalIndikator.mode === 'unggah') await dokumen.unggah(pilihan, { indikatorIds })
            else await dokumen.aturIndikator(modalIndikator.berkas, indikatorIds)
            buktiData.muatUlang()
          }}
          onClose={() => setModalIndikator(null)}
        />
      )}
    </div>
  )
}

export default RepositoriDetail
