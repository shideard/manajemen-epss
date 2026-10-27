import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import KegiatanForm from './KegiatanForm'
import KalenderKegiatan from './KalenderKegiatan'
import { matches } from './kegiatan'
import { useBukti, useKegiatan, usePeriode } from '../../lib/store'
import { formatTanggal, paginate, statusOf } from '../../lib/epss'
import { bolehUbah } from '../../config/menu'
import { Dropdown, Memuat, PageHeader, Pagination, SearchBox } from '../../components/ui'
import { buttonClass } from '../../components/classes'
import { useConfirm } from '../../components/useConfirm'
import addIcon from '../../assets/rencana/add-circle-fill.svg'
import userIcon from '../../assets/rencana/user-3-fill.svg'
import editIcon from '../../assets/rencana/edit-2-fill.svg'
import eyeIcon from '../../assets/icons/eye-line.svg'
import deleteIcon from '../../assets/icons/delete-bin-2-fill.svg'

const PAGE_SIZE = 5

const STATUS_CLASS = {
  'Belum Mulai': 'bg-grey-50 text-grey-200',
  Berjalan: 'bg-lime-300 text-grey-500',
  Selesai: 'bg-grey-200 text-white',
}

function RencanaKegiatan() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { aktif } = usePeriode()
  const muat = [useKegiatan(), useBukti()]
  const [{ kegiatan, simpan, hapus: hapusKegiatan }, { bukti }] = muat
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
          <SearchBox
            variant="grey"
            value={query}
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            placeholder="Cari Rencana Kegiatan..."
          />
          <Dropdown
            label="Tahun kegiatan"
            value={tahun}
            onChange={(value) => {
              setTahun(value)
              setPage(1)
            }}
            options={[{ value: '', label: 'Semua Tahun Kegiatan' }, ...years.map((y) => ({ value: y, label: y }))]}
            className="w-[220px]"
          />
          <Dropdown
            label="OPD"
            value={opd}
            onChange={(value) => {
              setOpd(value)
              setPage(1)
            }}
            options={[{ value: '', label: 'Semua OPD' }, ...opds.map((value) => ({ value, label: value }))]}
            className="w-[220px]"
          />
          <Dropdown
            label="PIC"
            value={pic}
            onChange={(value) => {
              setPic(value)
              setPage(1)
            }}
            options={[{ value: '', label: 'Semua PIC' }, ...pics.map((value) => ({ value, label: value }))]}
            className="w-[220px]"
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
            className="w-[220px]"
          />
        </div>

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
                      <span className={`inline-flex h-6 items-center rounded-sm px-2.5 font-medium whitespace-nowrap ${STATUS_CLASS[status]}`}>
                        {status}
                      </span>
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
      </section>

      {filtered.length > 0 && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}

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
