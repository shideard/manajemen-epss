import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import KegiatanForm from './KegiatanForm'
import KalenderKegiatan from './KalenderKegiatan'
import PetaKegiatan from './PetaKegiatan'
import { matches, statusOf, STORAGE_KEY, WARNA } from './kegiatan'
import { usePeriode, useStore } from '../../lib/store'
import { EMPTY_LIST, EMPTY_OBJECT, formatTanggal, KEYS, paginate, sinkronPemetaan } from '../../lib/epss'
import { bolehUbah } from '../../config/menu'
import { Pagination, SearchBox } from '../../components/ui'
import { useConfirm } from '../../components/useConfirm'
import addIcon from '../../assets/rencana/add-circle-fill.svg'
import arrowDown from '../../assets/rencana/arrow-down-s-line.svg'
import userIcon from '../../assets/rencana/user-3-fill.svg'
import editIcon from '../../assets/rencana/edit-2-fill.svg'
import eyeIcon from '../../assets/icons/eye-line.svg'
import deleteIcon from '../../assets/icons/delete-bin-2-fill.svg'

const PAGE_SIZE = 5

const STATUS_CLASS = {
  'Belum Mulai': 'bg-grey-50 text-grey-200',
  Berjalan: 'bg-lime-300 text-grey-300',
  Selesai: 'bg-grey-200 text-white',
}

function SectionHeading({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-[7px] leading-[1.2] text-heading">
        <h1 className="font-semibold text-2xl leading-[1.2] text-grey-500">{title}</h1>
        <p className="font-base text-lg leading-[1.2] text-grey-500">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function RencanaKegiatan() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { aktif } = usePeriode()
  const [kegiatan, setKegiatan] = useStore(STORAGE_KEY, EMPTY_LIST)
  const [bukti, setBukti] = useStore(KEYS.bukti, EMPTY_OBJECT)
  const [, setBerkas] = useStore(KEYS.berkas, EMPTY_OBJECT)
  // Hanya verifikator yang mengelola rencana; operator melihat & membuka repositori buktinya
  const kelola = bolehUbah(user, 'kelolaRencana', aktif)
  const [query, setQuery] = useState('')
  const [tahun, setTahun] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null) // null = form tertutup, {} = tambah baru
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  const years = [...new Set(kegiatan.map((k) => k.tahun))].sort()
  const filtered = kegiatan.filter((k) => matches(k, query) && (!tahun || k.tahun === tahun))
  const { rows, page: currentPage, pageCount } = paginate(filtered, page, PAGE_SIZE)

  function save({ indikator, ...data }) {
    const id = editing.id ?? crypto.randomUUID()
    setKegiatan((list) =>
      editing.id ? list.map((k) => (k.id === id ? { ...k, ...data } : k)) : [...list, { ...data, id, warna: list.length % WARNA.length }],
    )
    setBukti((all) => sinkronPemetaan(all, id, indikator))
    setEditing(null)
  }

  // Sama dengan aturan lepas indikator: kegiatan yang buktinya sudah diajukan tidak bisa dihapus
  const sudahDiajukan = (k) => Object.values(bukti).some((b) => b.kegiatanId === k.id && b.status !== 'draft')

  function hapus(k) {
    konfirmasi({
      title: 'Hapus Rencana Kegiatan',
      message: `Hapus "${k.nama}"? Pemetaan indikator dan berkas bukti dukungnya ikut terhapus. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Hapus',
      danger: true,
      onConfirm: () => {
        setKegiatan((list) => list.filter((x) => x.id !== k.id))
        setBukti((all) => Object.fromEntries(Object.entries(all).filter(([, b]) => b.kegiatanId !== k.id)))
        setBerkas((all) => Object.fromEntries(Object.entries(all).filter(([id]) => id !== k.id)))
      },
    })
  }

  const buka = (k) => (kelola ? setEditing(k) : navigate(`/repositori-bukti-dukung/${k.id}`))

  return (
    <div className="flex w-full flex-col gap-[33px]">
      <SectionHeading
        title="Rencana Kegiatan Statistik Sektoral"
        subtitle={kelola ? 'Kelola agenda statistik sektoral OPD dalam siklus evaluasi biennial 2 tahunan.' : 'Agenda statistik sektoral OPD dalam siklus evaluasi biennial 2 tahunan.'}
      >
        {kelola && (
          <button
            type="button"
            onClick={() => setEditing({})}
            className="flex items-center gap-[10px] rounded-[16px] bg-grey-300 px-5 py-[10px] text-sm leading-[1.2] text-lime-300 transition-transform duration-300 ease-out-quint hover:scale-102"
          >
            <img src={addIcon} alt="" width={19} height={19} />
            Tambah Rencana Kegiatan
          </button>
        )}
      </SectionHeading>

      <section className="rounded-[20px] border-5 border-dashed border-lime-500 bg-lime-300 px-[10px] pt-[23px] pb-[10px]">
        <div className="mb-[29px] flex flex-wrap items-center justify-between gap-3 px-5">
          <SearchBox
            variant="grey"
            value={query}
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            placeholder="Cari Rencana Kegiatan..."
          />
          <label className="relative flex h-[45px] w-[280px] items-center">
            <span className="sr-only">Tahun kegiatan</span>
            <select
              value={tahun}
              onChange={(e) => {
                setTahun(e.target.value)
                setPage(1)
              }}
              className={`size-full appearance-none rounded-[16px] bg-grey2-75 px-[14px] text-base focus:outline-2 focus:outline-grey-300 ${
                tahun ? 'text-grey-500' : 'font-light text-grey-75 italic'
              }`}
            >
              <option value="">Semua Tahun Kegiatan</option>
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <img src={arrowDown} alt="" width={24} height={24} className="pointer-events-none absolute right-[14px] rounded-[5px] bg-grey-300" />
          </label>
        </div>

        <div className="overflow-x-auto rounded-[20px] bg-[#fdfdfd] px-5 py-3">
          <table className="w-full min-w-[760px] text-left text-black">
            <thead>
              <tr className="border-b border-grey-100 text-center text-base leading-[1.2] font-bold">
                <th className="w-[40%] py-5">Informasi Kegiatan</th>
                <th className="py-5">OPD/PIC</th>
                <th className="py-5">Jadwal Kegiatan</th>
                <th className="py-5">Status</th>
                <th className="py-5">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-grey-100">
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
                  <tr key={k.id} className="border-b border-grey-100/50 align-top text-[13px] leading-[1.2] last:border-0">
                    <td className="py-5 pr-4">
                      <p className="text-base font-semibold">{k.nama}</p>
                      {k.deskripsi && <p className="mt-2 font-light">{k.deskripsi}</p>}
                    </td>
                    <td className="py-5 pr-4">
                      <span className="inline-flex h-6 items-center rounded-[10px] bg-grey-200 px-[10px] font-medium text-white">{k.opd}</span>
                      <p className="mt-[7px] flex items-end gap-1">
                        <img src={userIcon} alt="" width={17} height={17} />
                        <span>
                          <span className="font-light">PIC :</span> <span className="font-medium">{k.pic}</span>
                        </span>
                      </p>
                    </td>
                    <td className="py-5 pr-4 font-medium">
                      <p>
                        <span className="font-light">Mulai :</span> {formatTanggal(k.mulai)}
                      </p>
                      <p className="mt-[7px]">
                        <span className="font-light">Selesai :</span> {formatTanggal(k.selesai)}
                      </p>
                    </td>
                    <td className="py-5 text-center">
                      <span className={`inline-flex h-6 items-center rounded-[10px] px-[10px] font-medium whitespace-nowrap ${STATUS_CLASS[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-5 text-center">
                      {kelola ? (
                        <span className="flex justify-center gap-[7px]">
                          <button type="button" onClick={() => setEditing(k)} aria-label={`Edit ${k.nama}`} className="rounded-[5px] bg-lime-300">
                            <img src={editIcon} alt="" width={24} height={24} />
                          </button>
                          <button
                            type="button"
                            onClick={() => hapus(k)}
                            disabled={sudahDiajukan(k)}
                            title={sudahDiajukan(k) ? 'Tidak bisa dihapus: bukti dukung kegiatan ini sudah diajukan' : undefined}
                            aria-label={`Hapus ${k.nama}`}
                            className="grid size-6 place-items-center rounded-[5px] bg-red-200 disabled:opacity-40"
                          >
                            <img src={deleteIcon} alt="" width={18} height={18} />
                          </button>
                        </span>
                      ) : (
                        <Link to={`/repositori-bukti-dukung/${k.id}`} aria-label={`Lihat bukti dukung ${k.nama}`} className="inline-block rounded-[5px] p-1 bg-lime-300 align-middle">
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

      <SectionHeading title="Kalender Kegiatan" subtitle="Pantau dan kelola jadwal kegiatan secara terstruktur dalam satu kalender." />
      <KalenderKegiatan kegiatan={kegiatan} onOpen={buka} />

      <hr className="border-grey-75" />

      <SectionHeading title="Peta Relasi Indikator" subtitle="Keterkaitan domain, aspek, dan indikator EPSS dengan rencana kegiatan." />
      <PetaKegiatan kegiatan={kegiatan} bukti={bukti} onOpen={buka} />

      {editing && (
        <KegiatanForm
          kegiatan={editing}
          indikator={Object.values(bukti).filter((b) => b.kegiatanId === editing.id)}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {dialogKonfirmasi}
    </div>
  )
}

export default RencanaKegiatan
