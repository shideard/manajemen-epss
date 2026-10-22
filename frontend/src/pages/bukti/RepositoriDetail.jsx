import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { berkasUrl, useBerkas, useBukti, useKegiatan, usePeriode, useSkor } from '../../lib/store'
import { buktiKey, formatTanggal, indikatorById, isPic, LEVELS, levelTerpenuhi, metaBerkas } from '../../lib/epss'
import { bolehUbah } from '../../config/menu'
import { BackButton, ChecklistItem, Memuat, StatusBukti } from '../../components/ui'
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
    <article className="flex flex-col gap-[21px] rounded-[15px] bg-grey-300 pt-[21px]">
      <header className="flex flex-wrap justify-between gap-4 px-[35px] text-base leading-[1.2] text-lime-300">
        <div className="flex flex-col gap-[7px]">
          <p className="font-semibold">
            Domain {indikator.domainNomor} : {indikator.domain.nama}
          </p>
          <p className="font-light">
            Indikator {indikator.nomor}: {indikator.nama} (Bobot BPS: {indikator.bobot.toFixed(1)}%)
          </p>
        </div>
        <div className="flex flex-col gap-[7px] text-right">
          <p className="font-semibold">Target Kematangan :</p>
          <p className="font-light">
            Level {target} ({LEVELS[target - 1]})
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-[15px] bg-white px-[28px] py-[14px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-base leading-[1.2] font-semibold text-heading">Checklist Persyaratan Bukti Dukung (Level {level}) :</p>
          <StatusBukti status={bukti.status} className="text-[13px]" />
        </div>
        {bukti.status === 'perbaikan' && bukti.catatan && (
          <p className="rounded-[10px] border border-red-500 bg-red-50 px-4 py-2 text-[13px] text-red-500">Catatan verifikator: {bukti.catatan}</p>
        )}
        {syarat.map((item, i) => (
          <ChecklistItem key={item} checked={Boolean(checked[level]?.[i])} onChange={(value) => centang(i, value)} disabled={terkunci}>
            {item}
          </ChecklistItem>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="w-[160px] text-base leading-[1.2] font-bold text-heading">Level Terpenuhi : {terpenuhi}</p>
          {/* Berjenjang: tidak bisa lompat melewati level yang belum terpenuhi */}
          <div className="flex h-[41px] w-[209px] items-center justify-between overflow-hidden rounded-[20px] bg-grey-300">
            <button type="button" onClick={() => setLevel(level - 1)} disabled={level === 1} aria-label="Level sebelumnya" className="disabled:opacity-40">
              <img src={levelArrow} alt="" width={46} height={45} />
            </button>
            <span className="text-base leading-[1.2] font-semibold text-lime-200">Level {level}</span>
            <button type="button" onClick={() => setLevel(level + 1)} disabled={level >= maksLevel} aria-label="Level berikutnya" className="disabled:opacity-40">
              <img src={levelArrow} alt="" width={46} height={45} className="-scale-x-100" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setPedoman(true)}
            className="flex w-[186px] items-center justify-between rounded-[16px] border-[0.7px] border-grey-500 px-[14px] py-[7px] text-[11px] leading-[1.2] text-grey-500"
          >
            Lihat Pedoman Indikator
            <img src={arrowSmall} alt="" width={20} height={10} />
          </button>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {!terkunci && (
          <div className="flex flex-wrap items-center justify-end gap-[18px]">
            <p role="status" className="text-[13px] text-grey-200">
              Draft tersimpan otomatis.
            </p>
            <button type="button" onClick={ajukan} className="rounded-[16px] bg-grey-300 px-[19px] py-[10px] text-base leading-[1.2] text-lime-300">
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
    unggahBerkas(k.id, event.target.files, user.name)
    event.target.value = ''
  }

  const simpanBukti = (indikatorId, perubahan) => ubahBukti(buktiKey(k.id, indikatorId), { ...perubahan, pengaju: user.name })

  return (
    <div className="flex w-full flex-col gap-[33px]">
      <Memuat dari={muat} />
      <div className="flex flex-col items-start gap-[7px] leading-[1.2] text-grey-500">
        <BackButton fallback="/repositori-bukti-dukung" />
        <div className="flex flex-col gap-[7px]">
          <h1 className="text-[25px] font-semibold">Pengumpulan Bukti Dukung</h1>
          <p className="text-base">Unggah dan kelola berkas bukti fisik terpusat berdasarkan kegiatan statistik dan indikator EPSS yang telah dipetakan.</p>
        </div>
      </div>

      {!bolehEdit && (
        <p role="status" className="rounded-[15px] border border-yellow-500 bg-yellow-50 px-5 py-3 text-base text-yellow-500">
          {!pic
            ? `Anda bukan PIC kegiatan ini (PIC: ${k.pic}). Halaman ini hanya dapat dilihat sebagai referensi.`
            : 'Periode aktif sudah dikunci. Bukti dukung hanya dapat dilihat.'}
        </p>
      )}

      <section className="flex flex-col gap-5 rounded-[20px] border-5 border-dashed border-lime-500 bg-lime-300 px-[10px] py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-[18px]">
          {/* Input dengan datalist bawaan browser untuk pindah ke kegiatan lain */}
          <label className="relative flex h-[45px] w-[330px] max-w-full items-center">
            <span className="sr-only">Cari rencana kegiatan</span>
            <img src={searchIcon} alt="" width={31} height={31} className="pointer-events-none absolute left-2 rounded-[10px] bg-grey-300" />
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
              className="size-full rounded-[16px] bg-grey2-75 pr-4 pl-[53px] text-base placeholder:font-light placeholder:text-grey-75 placeholder:italic focus:outline-2 focus:outline-grey-300"
            />
            <datalist id="daftar-kegiatan">
              {kegiatan.map((item) => (
                <option key={item.id} value={item.nama} />
              ))}
            </datalist>
          </label>
          <Link to="/rencana-kegiatan" className="flex w-[292px] items-center justify-between rounded-[16px] border border-grey-200 px-[14px] py-[10px] text-base leading-[1.2] font-light text-grey-200 italic">
            Lihat Daftar Rencana Kegiatan
            <img src={arrowUpRight} alt="" width={24} height={24} />
          </Link>
        </div>

        <div className="flex flex-col items-center gap-[50px] rounded-[20px] bg-[#fdfdfd] px-4 py-9 md:px-[39px]">
          <div className="flex w-full flex-col items-center gap-4">
            <span className="rounded-[16px] border border-grey-500 px-5 py-1 text-base leading-[1.2] text-grey-500">Rencana Kegiatan</span>
            <h2 className="text-center text-[31px] leading-[1.2] font-bold text-heading">{k.nama}</h2>
            <hr className="w-full border-grey-500" />
            <dl className="grid w-full grid-cols-2 gap-[10px] px-4 text-center text-base leading-[1.2] text-black md:grid-cols-4 md:px-[60px]">
              {[
                ['OPD', k.opd],
                ['PIC', k.pic],
                ['Jadwal', `${formatTanggal(k.mulai)} s/d ${formatTanggal(k.selesai)}`],
                ['Deadline Bukti', formatTanggal(aktif.batas)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-bold">{label} :</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="flex flex-wrap items-center gap-4 text-base leading-[1.2] font-semibold text-heading">
            Kelengkapan Bukti Kegiatan :
            <span className="flex h-[25px] items-center gap-[10px] rounded-[10px] bg-lime-300 px-5 text-sm font-medium text-grey-400">
              <img src={bookIcon} alt="" width={15} height={15} />
              {files.length} Berkas Terunggah
            </span>
          </p>
          <hr className="w-full border-grey-500" />

          {/* Target output diisi verifikator di form Rencana Kegiatan */}
          {k.output?.length > 0 && (
            <div className="flex w-full flex-col items-start gap-[14px] md:px-[40px]">
              <h3 className="text-base leading-[1.2] font-bold text-heading">Output Bukti Dukung yang Ditargetkan :</h3>
              <ul className="flex w-full flex-col gap-[7px]">
                {k.output.map((o) => (
                  <li key={o.id} className="flex min-h-[45px] flex-col justify-center rounded-[15px] bg-lime-300 px-5 py-2 text-base leading-[1.2] text-[#4f4f4f]">
                    <span>
                      {o.judul}
                      {o.jenis && <span className="text-[13px]"> ({o.jenis})</span>}
                    </span>
                    {o.contoh && <span className="truncate text-[13px] text-grey-200">Contoh dari verifikator: {o.contoh.nama}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex w-full flex-col items-start gap-[14px] md:px-[40px]">
            <h3 className="text-base leading-[1.2] font-bold text-heading">Dokumen Bukti yang Terlampir :</h3>
            {files.length === 0 && <p className="text-[13px] text-grey-100">Belum ada berkas yang diunggah.</p>}
            {files.map((f) => {
              const url = berkasUrl.get(f.id)
              return (
                <div key={f.id} className="flex w-full items-center justify-between gap-4 rounded-[10px] border border-black px-[28px] py-[7px]">
                  <div className="flex min-w-0 items-center gap-[14px]">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-[10px] bg-grey-300">
                      <img src={fileText} alt="" width={54} height={54} className="absolute top-[3px] left-[-3px] max-w-none" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-[5px] leading-[1.2] text-heading">
                      <span className="truncate text-[13px] font-medium">{f.nama}</span>
                      <span className="text-[10px] font-light">{metaBerkas(f)}</span>
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-[14px]">
                    <img src={checkBadge} alt="Terunggah" width={30} height={30} />
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer" aria-label={`Lihat ${f.nama}`} className="grid size-[30px] place-items-center rounded-[10px] bg-lime-200">
                        <img src={eyeIcon} alt="" width={20} height={20} />
                      </a>
                    ) : (
                      <span title="Pratinjau hanya tersedia pada sesi saat berkas diunggah" className="grid size-[30px] place-items-center rounded-[10px] bg-lime-200 opacity-40">
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
                        className="grid size-[30px] place-items-center rounded-[10px] bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <img src={deleteIcon} alt="" width={20} height={20} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {bolehEdit && alasanTidakBisaHapus && files.length > 0 && <p className="text-[13px] text-grey-100">{alasanTidakBisaHapus}</p>}
            {bolehEdit && (
              <>
                <input ref={fileInput} type="file" multiple onChange={unggah} className="hidden" />
                <button type="button" onClick={() => fileInput.current.click()} className="flex items-center gap-[10px] rounded-[16px] bg-grey-300 px-5 py-[10px] text-sm leading-[1.2] text-lime-300">
                  <img src={addIcon} alt="" width={19} height={19} />
                  Unggah Berkas Baru
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col items-center gap-[7px]">
        <h2 className="text-center text-[31px] leading-[1.2] font-bold text-heading">Indikator tertaut :</h2>
        <span className="flex h-[25px] items-center gap-[10px] rounded-[10px] bg-grey-500 px-5 text-base leading-[1.2] font-medium text-lime-300">
          <img src={mindMap} alt="" width={21} height={19} />
          {tertaut.length} Indikator Terpetakan
        </span>
        {tertaut.length === 0 && <p className="mt-3 text-base text-grey-100">Belum ada indikator. Pemetaan indikator diatur verifikator di menu Rencana Kegiatan.</p>}
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
