import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import KegiatanForm from './KegiatanForm'
import KalenderKegiatan from './KalenderKegiatan'
import KanbanKegiatan from './KanbanKegiatan'
import { matches } from './kegiatan'
import { useBerkas, useBukti, useKegiatan, usePeriode } from '../../lib/store'
import { formatTanggal, paginate, statusOf } from '../../lib/epss'
import { bolehUbah } from '../../config/menu'
import { Badge, Dropdown, Memuat, PageHeader, Pagination, SearchBox } from '../../components/ui'
import { buttonClass } from '../../components/classes'
import { useConfirm } from '../../components/useConfirm'
import addIcon from '../../assets/rencana/add-circle-fill.svg'
import userIcon from '../../assets/rencana/user-3-fill.svg'
import editIcon from '../../assets/rencana/edit-2-fill.svg'
import eyeIcon from '../../assets/icons/eye-line.svg'
import deleteIcon from '../../assets/icons/delete-bin-2-fill.svg'
import closeCircle from '../../assets/icons/close-circle-line.svg'
import timeIcon from '../../assets/icons/time-line.svg'
import checkCircle from '../../assets/icons/checkbox-circle-line.svg'
import tableIcon from '../../assets/kanban/table-line.svg'
import kanbanIcon from '../../assets/kanban/layout-column-line.svg'
import filterIcon from '../../assets/kanban/filter-3-fill.svg'

const PAGE_SIZE = 5

// Ikon dipakai sebagai mask supaya warnanya ikut teks tab (aktif/tidak)
const TAMPILAN = [
  { value: 'tabel', label: 'Tabel', icon: tableIcon },
  { value: 'kanban', label: 'Kanban', icon: kanbanIcon },
]

// Filter (Tahun, OPD, PIC, Status) disimpan di panel supaya toolbar tetap ringkas.
// Tertutup saat klik di luar atau Esc (fokus kembali ke tombolnya), seperti Dropdown.
function PanelFilter({ jumlahAktif, onReset, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const pemicuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const tutupLuar = (e) => !ref.current.contains(e.target) && setOpen(false)
    const tutupEsc = (e) => {
      if (e.key !== 'Escape' || ref.current.querySelector('[aria-expanded="true"][aria-haspopup]')) return
      setOpen(false)
      pemicuRef.current.focus()
    }
    document.addEventListener('pointerdown', tutupLuar)
    document.addEventListener('keydown', tutupEsc)
    return () => {
      document.removeEventListener('pointerdown', tutupLuar)
      document.removeEventListener('keydown', tutupEsc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        ref={pemicuRef}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={jumlahAktif ? `Filter, ${jumlahAktif} aktif` : 'Filter'}
        className={`relative grid h-[45px] w-[47px] place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-grey-300 ${
          open ? 'bg-white' : 'bg-grey2-75 hover:bg-white'
        }`}
      >
        <img src={filterIcon} alt="" width={30} height={30} />
        {jumlahAktif > 0 && (
          <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-grey-300 text-caption font-bold text-lime-300">{jumlahAktif}</span>
        )}
      </button>
      {open && (
        <div role="dialog" aria-label="Filter rencana kegiatan" className="absolute top-full right-0 z-20 mt-2 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-4 rounded-lg bg-white p-5 shadow-lg">
          <p className="font-semibold">Filter</p>
          {children}
          <button type="button" onClick={onReset} disabled={!jumlahAktif} className={buttonClass(jumlahAktif ? 'primary' : 'outline')}>
            Reset Filter
          </button>
        </div>
      )}
    </div>
  )
}

const STATUS_BADGE = {
  'Belum Mulai': { tone: 'red', icon: closeCircle },
  Berjalan: { tone: 'yellow', icon: timeIcon },
  Selesai: { tone: 'green', icon: checkCircle },
}

function RencanaKegiatan() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { aktif } = usePeriode()
  const muat = [useKegiatan(), useBukti(), useBerkas()]
  const [{ kegiatan, simpan, hapus: hapusKegiatan }, { bukti }, { berkas }] = muat
  const [tampilan, setTampilan] = useState('tabel')
  // Hanya verifikator yang mengelola rencana; operator melihat & membuka repositori buktinya
  const kelola = bolehUbah(user, 'kelolaRencana', aktif)
  const [query, setQuery] = useState('')
  const [tahun, setTahun] = useState('')
  const [opd, setOpd] = useState('')
  const [pic, setPic] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null) // null = form tertutup, {} = tambah baru
  const [kegiatanBaruId, setKegiatanBaruId] = useState(null)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  const years = [...new Set(kegiatan.map((k) => k.tahun))].sort()
  const opds = [...new Set(kegiatan.map((k) => k.opd).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'))
  const pics = [...new Set(kegiatan.map((k) => k.pic).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'))
  const urutanStatus = { Berjalan: 0, 'Belum Mulai': 1, Selesai: 2 }
  const filtered = kegiatan
    .filter(
      (k) =>
        matches(k, query) &&
        (!tahun || k.tahun === tahun) &&
        (!opd || k.opd === opd) &&
        (!pic || k.pic === pic) &&
        (!statusFilter || statusOf(k) === statusFilter),
    )
    .sort((a, b) => urutanStatus[statusOf(a)] - urutanStatus[statusOf(b)])
  const { rows, page: currentPage, pageCount } = paginate(filtered, page, PAGE_SIZE)

  function save(data) {
    const kegiatanBaru = !editing.id
    const id = simpan(editing.id, data)
    setEditing(null)
    if (kegiatanBaru) setKegiatanBaruId(id)
  }

  useEffect(() => {
    if (!kegiatanBaruId) return undefined
    const timer = window.setTimeout(() => navigate(`/rencana-kegiatan/${kegiatanBaruId}`, { replace: true }), 1600)
    return () => window.clearTimeout(timer)
  }, [kegiatanBaruId, navigate])

  // Sama dengan aturan lepas indikator: kegiatan yang buktinya sudah diajukan tidak bisa dihapus
  const sudahDiajukan = (k) => Object.values(bukti).some((b) => b.kegiatanId === k.id && b.status !== 'draft')

  function hapus(k) {
    konfirmasi({
      title: 'Hapus Rencana Kegiatan',
      message: `Hapus "${k.nama}"? Pemetaan indikator dan berkas bukti dukungnya ikut terhapus. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Hapus',
      danger: true,
      onConfirm: () => hapusKegiatan(k.id),
    })
  }

  const buka = (k) => (kelola ? setEditing(k) : navigate(`/repositori-bukti-dukung/${k.id}`))

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader
        title="Rencana Kegiatan Statistik Sektoral"
        subtitle={kelola ? 'Kelola agenda statistik sektoral OPD dalam siklus evaluasi biennial 2 tahunan.' : 'Agenda statistik sektoral OPD dalam siklus evaluasi biennial 2 tahunan.'}
      >
        {kelola && (
          <button type="button" onClick={() => setEditing({})} className={buttonClass()}>
            <img src={addIcon} alt="" width={19} height={19} />
            Tambah Rencana Kegiatan
          </button>
        )}
      </PageHeader>

      <section className="rounded-lg border-5 border-dashed border-lime-500 bg-lime-300 px-2.5 pt-6 pb-2.5">
        <div className="mb-6 flex flex-wrap items-center gap-3 px-5">
          <div role="group" aria-label="Tampilan" className="flex shrink-0 gap-1 rounded-md bg-grey2-75 p-1">
            {TAMPILAN.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTampilan(t.value)}
                aria-pressed={tampilan === t.value}
                className={`flex items-center gap-2 rounded-sm px-3.5 py-2 font-medium transition-colors ${
                  tampilan === t.value ? 'bg-grey-300 text-lime-300' : 'text-grey-200 hover:bg-white'
                }`}
              >
                <span aria-hidden className="size-4.5 bg-current" style={{ mask: `url("${t.icon}") center / contain no-repeat` }} />
                {t.label}
              </button>
            ))}
          </div>
          <SearchBox
            variant="grey"
            value={query}
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            placeholder="Cari Rencana Kegiatan..."
            className="ml-auto w-[330px]"
          />
          <PanelFilter
            jumlahAktif={[tahun, opd, pic, statusFilter].filter(Boolean).length}
            onReset={() => {
              setTahun('')
              setOpd('')
              setPic('')
              setStatusFilter('')
              setPage(1)
            }}
          >
            <Dropdown
              label="Tahun kegiatan"
              value={tahun}
              onChange={(value) => {
                setTahun(value)
                setPage(1)
              }}
              options={[{ value: '', label: 'Semua Tahun Kegiatan' }, ...years.map((y) => ({ value: y, label: y }))]}
              className="w-full"
            />
            <Dropdown
              label="OPD"
              value={opd}
              onChange={(value) => {
                setOpd(value)
                setPage(1)
              }}
              options={[{ value: '', label: 'Semua OPD' }, ...opds.map((value) => ({ value, label: value }))]}
              className="w-full"
            />
            <Dropdown
              label="PIC"
              value={pic}
              onChange={(value) => {
                setPic(value)
                setPage(1)
              }}
              options={[{ value: '', label: 'Semua PIC' }, ...pics.map((value) => ({ value, label: value }))]}
              className="w-full"
            />
            <Dropdown
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'Berjalan', label: 'Berjalan' },
                { value: 'Belum Mulai', label: 'Belum Mulai' },
                { value: 'Selesai', label: 'Selesai' },
              ]}
              className="w-full"
            />
          </PanelFilter>
        </div>

        {tampilan === 'kanban' ? (
          <KanbanKegiatan
            kegiatan={filtered}
            bukti={bukti}
            berkas={berkas}
            hrefOf={(k) => (kelola ? `/rencana-kegiatan/${k.id}` : `/repositori-bukti-dukung/${k.id}`)}
          />
        ) : (
        <div className="overflow-x-auto rounded-lg bg-grey2-50 px-5 py-3">
          <table className="w-full min-w-[920px] text-left text-grey-500">
            <thead>
              <tr className="border-b border-grey-75 text-center text-body font-semibold">
                <th className="w-14 py-5">No.</th>
                <th className="w-[35%] py-5">Informasi Kegiatan</th>
                <th className="py-5">OPD</th>
                <th className="py-5">PIC</th>
                <th className="py-5">Jadwal Kegiatan</th>
                <th className="py-5">Status</th>
                <th className="py-5">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-grey-200">
                    {kegiatan.length === 0
                      ? kelola
                        ? 'Belum ada rencana kegiatan. Klik "Tambah Rencana Kegiatan" untuk menambahkan.'
                        : 'Belum ada rencana kegiatan dari verifikator.'
                      : 'Tidak ada rencana kegiatan yang cocok dengan pencarian.'}
                  </td>
                </tr>
              )}
              {rows.map((k) => {
                const status = statusOf(k)
                return (
                  <tr key={k.id} className="border-b border-grey-75/50 align-top text-small last:border-0">
                    <td className="py-5 text-center font-medium">{(currentPage - 1) * PAGE_SIZE + rows.indexOf(k) + 1}</td>
                    <td className="py-5 pr-4">
                      <p className="text-body font-semibold">{k.nama}</p>
                      {k.deskripsi && <p className="mt-2 font-light">{k.deskripsi}</p>}
                    </td>
                    <td className="py-5 pr-4">
                      <span className="inline-flex h-6 items-center rounded-sm bg-grey-200 px-2.5 font-medium text-white">{k.opd}</span>
                    </td>
                    <td className="py-5 pr-4">
                      <p className="flex items-center gap-1">
                        <img src={userIcon} alt="" width={17} height={17} />
                        <span className="font-medium">{k.pic}</span>
                      </p>
                    </td>
                    <td className="py-5 pr-4 font-medium">
                      <p>
                        <span className="font-light">Mulai:</span> {formatTanggal(k.mulai)}
                      </p>
                      <p className="mt-2">
                        <span className="font-light">Selesai:</span> {formatTanggal(k.selesai)}
                      </p>
                    </td>
                    <td className="py-5 text-center">
                      <Badge {...STATUS_BADGE[status]} className="text-small">{status}</Badge>
                    </td>
                    <td className="py-5 text-center">
                      {kelola ? (
                        <span className="flex justify-center gap-2">
                          <Link
                            to={`/rencana-kegiatan/${k.id}`}
                            aria-label={`Lihat detail ${k.nama}`}
                            className="inline-grid size-6 place-items-center rounded-xs bg-lime-300"
                          >
                            <img src={eyeIcon} alt="" width={15} height={15} />
                          </Link>
                          <button type="button" onClick={() => setEditing(k)} aria-label={`Edit ${k.nama}`} className="rounded-xs bg-lime-300">
                            <img src={editIcon} alt="" width={24} height={24} />
                          </button>
                          <button
                            type="button"
                            onClick={() => hapus(k)}
                            disabled={sudahDiajukan(k)}
                            title={sudahDiajukan(k) ? 'Tidak bisa dihapus: bukti dukung kegiatan ini sudah diajukan' : undefined}
                            aria-label={`Hapus ${k.nama}`}
                            className="grid size-6 place-items-center rounded-xs bg-red-200 disabled:opacity-40"
                          >
                            <img src={deleteIcon} alt="" width={18} height={18} />
                          </button>
                        </span>
                      ) : (
                        <Link to={`/repositori-bukti-dukung/${k.id}`} aria-label={`Lihat bukti dukung ${k.nama}`} className="inline-grid size-6 place-items-center rounded-xs bg-lime-300 align-middle">
                          <img src={eyeIcon} alt="" width={15} height={15} />
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
      </section>

      {tampilan === 'tabel' && filtered.length > 0 && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}

      <hr className="border-grey-75" />

      <PageHeader as="h2" title="Kalender Kegiatan" subtitle="Pantau dan kelola jadwal kegiatan secara terstruktur dalam satu kalender." />
      <KalenderKegiatan kegiatan={kegiatan} onOpen={buka} />

      {editing && (
        <KegiatanForm
          kegiatan={editing}
          indikator={Object.values(bukti).filter((b) => b.kegiatanId === editing.id)}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {dialogKonfirmasi}
      {kegiatanBaruId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-grey-500/40 px-4" role="status" aria-live="polite">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl bg-white px-8 py-9 text-center shadow-xl">
            <span className="grid size-16 place-items-center rounded-full bg-green-50 text-green-500">
              <Check size={34} strokeWidth={3} aria-hidden="true" />
            </span>
            <p className="text-h3 font-semibold">Kegiatan berhasil dibuat</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RencanaKegiatan
