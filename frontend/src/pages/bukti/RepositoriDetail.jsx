import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { berkasUrl, useBerkas, useBukti, useKegiatan, usePeriode, useSkor } from '../../lib/store'
import { buktiKey, formatTanggal, indikatorById, isPic, LEVELS, levelTerpenuhi, metaBerkas } from '../../lib/epss'
import { bolehUbah } from '../../config/menu'
import { ChecklistItem, FormError, Memuat, Notice, PageHeader, StatusBukti } from '../../components/ui'
import { buttonClass } from '../../components/classes'
import { useConfirm } from '../../components/useConfirm'
import PedomanModal from '../../components/PedomanModal'
import searchIcon from '../../assets/rencana/search-2-line.svg'
import arrowUpRight from '../../assets/rencana/arrow-right-up-line.svg'
import bookIcon from '../../assets/icons/book-mark-fill-sm.svg'
import fileText from '../../assets/icons/file-text-fill.svg'
import checkBadge from '../../assets/icons/check-badge.svg'
import eyeIcon from '../../assets/icons/eye-line.svg'
import addIcon from '../../assets/rencana/add-circle-fill.svg'
import mindMap from '../../assets/icons/mind-map.svg'
import levelArrow from '../../assets/icons/arrow-drop-left-level.svg'
import arrowSmall from '../../assets/icons/arrow-long-small.svg'
import deleteIcon from '../../assets/icons/delete-bin-2-fill.svg'

// Checklist satu indikator; tiap centang langsung tersimpan sebagai draft, jadi tidak hilang saat pindah halaman
function IndikatorBukti({ bukti, indikator, levelTerverifikasi, jumlahBerkas, readOnly, onSave }) {
  const checked = bukti.checked ?? {}
  const terpenuhi = levelTerpenuhi(indikator.levels, checked)
  const maksLevel = Math.min(terpenuhi + 1, LEVELS.length)
  const [level, setLevel] = useState(maksLevel)
  const [pedoman, setPedoman] = useState(false)
  const [error, setError] = useState('')
  const [konfirmasi, dialogKonfirmasi] = useConfirm()
  const terkunci = readOnly || bukti.status === 'menunggu' || bukti.status === 'terverifikasi'
  const target = Math.min((levelTerverifikasi ?? 0) + 1, LEVELS.length)
  const syarat = indikator.levels[level - 1].syarat

  function centang(index, value) {
    onSave({ checked: { ...checked, [level]: syarat.map((_, i) => (i === index ? value : Boolean(checked[level]?.[i]))) } })
  }

  function ajukan() {
    if (jumlahBerkas === 0) return setError('Unggah minimal satu berkas bukti dukung sebelum mengajukan verifikasi.')
    if (terpenuhi === 0) return setError('Lengkapi persyaratan level 1 sebelum mengajukan verifikasi.')
    konfirmasi({
      title: 'Ajukan Verifikasi',
      message: `Ajukan bukti dukung Indikator ${indikator.nomor} (Level Terpenuhi: ${terpenuhi}) ke verifikator? Checklist tidak bisa diubah selama menunggu verifikasi.`,
      confirmLabel: 'Ajukan',
      onConfirm: () => onSave({ checked, status: 'menunggu', diajukan: new Date().toISOString() }),
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
          <p className="font-semibold">Target Kematangan :</p>
          <p className="font-light">
            Level {target} ({LEVELS[target - 1]})
          </p>
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
          <ChecklistItem key={item} checked={Boolean(checked[level]?.[i])} onChange={(value) => centang(i, value)} disabled={terkunci}>
            {item}
          </ChecklistItem>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="w-[160px] font-semibold">Level Terpenuhi : {terpenuhi}</p>
          {/* Berjenjang: tidak bisa lompat melewati level yang belum terpenuhi */}
          <div className="flex h-[41px] w-[209px] items-center justify-between overflow-hidden rounded-lg bg-grey-300">
            <button type="button" onClick={() => setLevel(level - 1)} disabled={level === 1} aria-label="Level sebelumnya" className="disabled:opacity-40">
              <img src={levelArrow} alt="" width={46} height={45} />
            </button>
            <span className="font-semibold text-lime-300">Level {level}</span>
            <button type="button" onClick={() => setLevel(level + 1)} disabled={level >= maksLevel} aria-label="Level berikutnya" className="disabled:opacity-40">
              <img src={levelArrow} alt="" width={46} height={45} className="-scale-x-100" />
            </button>
          </div>
          <button type="button" onClick={() => setPedoman(true)} className={`gap-4! ${buttonClass('outline')}`}>
            Lihat Pedoman Indikator
            <img src={arrowSmall} alt="" width={20} height={10} />
          </button>
        </div>

        <FormError>{error}</FormError>

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
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { aktif } = usePeriode()
  const muat = [useKegiatan(), useBukti(), useBerkas(), useSkor()]
  const [{ kegiatan }, { bukti: semuaBukti, ubah: ubahBukti }, { berkas, unggah: unggahBerkas, hapus: hapusBerkasKegiatan }, { levels }] = muat
  const [cari, setCari] = useState('')
  const fileInput = useRef(null)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  const k = kegiatan.find((item) => item.id === kegiatanId)
  if (!k && muat.some((d) => d.loading || d.error)) return <Memuat dari={muat} />
  if (!k) return <Navigate to="/repositori-bukti-dukung" replace />

  const files = berkas[k.id] ?? []
  const tertaut = Object.values(semuaBukti).filter((b) => b.kegiatanId === k.id)
  // Operator lain boleh melihat sebagai referensi; hanya PIC yang bisa mengubah, dan tidak saat periode dikunci
  const pic = isPic(k, user)
  const bolehEdit = pic && bolehUbah(user, 'unggahBukti', aktif)
  // Berkas sedang diperiksa / sudah jadi dasar level → tidak boleh dihapus (status perbaikan boleh).
  // Tombol tetap tampil (disabled + alasan) supaya PIC tahu kenapa tidak bisa menghapus
  const alasanTidakBisaHapus = tertaut.some((b) => b.status === 'menunggu')
    ? 'Berkas tidak bisa dihapus selama ada indikator yang menunggu verifikasi.'
    : tertaut.some((b) => b.status === 'terverifikasi')
      ? 'Berkas tidak bisa dihapus karena sudah menjadi dasar indikator yang terverifikasi.'
      : ''

  function hapusBerkas(f) {
    konfirmasi({
      title: 'Hapus Berkas',
      message: `Hapus berkas "${f.nama}" dari kegiatan ini? Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Hapus',
      danger: true,
      onConfirm: () => hapusBerkasKegiatan(k.id, f.id),
    })
  }

  function unggah(event) {
    unggahBerkas(k.id, event.target.files, user.name, aktif.id)
    event.target.value = ''
  }

  const simpanBukti = (indikatorId, perubahan) => ubahBukti(buktiKey(k.id, indikatorId), { ...perubahan, pengaju: user.name })

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader
        back="/repositori-bukti-dukung"
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
                  navigate(`/repositori-bukti-dukung/${tujuan.id}`)
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
            <hr className="w-full border-grey-500" />
            <dl className="grid w-full grid-cols-2 gap-2.5 px-4 text-center md:grid-cols-4 md:px-15">
              {[
                ['OPD', k.opd],
                ['PIC', k.pic],
                ['Jadwal', `${formatTanggal(k.mulai)} s/d ${formatTanggal(k.selesai)}`],
                ['Deadline Bukti', formatTanggal(aktif.batas)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-semibold">{label} :</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="flex flex-wrap items-center gap-4 font-semibold">
            Kelengkapan Bukti Kegiatan :
            <span className="flex h-6 items-center gap-2.5 rounded-sm bg-lime-300 px-5 font-medium">
              <img src={bookIcon} alt="" width={15} height={15} />
              {files.length} Berkas Terunggah
            </span>
          </p>
          <hr className="w-full border-grey-500" />

          {/* Target output diisi verifikator di form Rencana Kegiatan */}
          {k.output?.length > 0 && (
            <div className="flex w-full flex-col items-start gap-3.5 md:px-10">
              <h3 className="font-semibold">Output Bukti Dukung yang Ditargetkan :</h3>
              <ul className="flex w-full flex-col gap-2">
                {k.output.map((o) => (
                  <li key={o.id} className="flex min-h-[45px] flex-col justify-center rounded-md bg-lime-300 px-5 py-2">
                    <span>
                      {o.judul}
                      {o.jenis && <span className="text-small"> ({o.jenis})</span>}
                    </span>
                    {o.contoh && <span className="truncate text-small text-grey-200">Contoh dari verifikator: {o.contoh.nama}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex w-full flex-col items-start gap-3.5 md:px-10">
            <h3 className="font-semibold">Dokumen Bukti yang Terlampir :</h3>
            {files.length === 0 && <p className="text-small text-grey-200">Belum ada berkas yang diunggah.</p>}
            {files.map((f) => {
              const url = berkasUrl.get(f.id)
              return (
                <div key={f.id} className="flex w-full items-center justify-between gap-4 rounded-sm border border-grey-500 px-7 py-2">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-grey-300">
                      <img src={fileText} alt="" width={54} height={54} className="absolute top-[3px] left-[-3px] max-w-none" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-small font-medium">{f.nama}</span>
                      <span className="text-caption font-light">{metaBerkas(f)}</span>
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3.5">
                    <img src={checkBadge} alt="Terunggah" width={30} height={30} />
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer" aria-label={`Lihat ${f.nama}`} className="grid size-[30px] place-items-center rounded-sm bg-lime-200">
                        <img src={eyeIcon} alt="" width={20} height={20} />
                      </a>
                    ) : (
                      <span title="Pratinjau hanya tersedia pada sesi saat berkas diunggah" className="grid size-[30px] place-items-center rounded-sm bg-lime-200 opacity-40">
                        <img src={eyeIcon} alt="" width={20} height={20} />
                      </span>
                    )}
                    {bolehEdit && (
                      <button
                        type="button"
                        onClick={() => hapusBerkas(f)}
                        disabled={Boolean(alasanTidakBisaHapus)}
                        title={alasanTidakBisaHapus || `Hapus ${f.nama}`}
                        aria-label={`Hapus ${f.nama}`}
                        className="grid size-[30px] place-items-center rounded-sm bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <img src={deleteIcon} alt="" width={20} height={20} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {bolehEdit && alasanTidakBisaHapus && files.length > 0 && <p className="text-small text-grey-200">{alasanTidakBisaHapus}</p>}
            {bolehEdit && (
              <>
                <input ref={fileInput} type="file" multiple onChange={unggah} className="hidden" />
                <button type="button" onClick={() => fileInput.current.click()} className={buttonClass()}>
                  <img src={addIcon} alt="" width={19} height={19} />
                  Unggah Berkas Baru
                </button>
              </>
            )}
          </div>
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
          indikator={indikatorById[b.indikatorId]}
          levelTerverifikasi={levels[b.indikatorId]}
          jumlahBerkas={files.length}
          readOnly={!bolehEdit}
          onSave={(perubahan) => simpanBukti(b.indikatorId, perubahan)}
        />
      ))}
      {dialogKonfirmasi}
    </div>
  )
}

export default RepositoriDetail
