import { useEffect, useState } from 'react'
import KegiatanForm from './KegiatanForm'
import KalenderKegiatan from './KalenderKegiatan'
import { matches, statusOf, STORAGE_KEY, WARNA } from './kegiatan'
import addIcon from '../../assets/rencana/add-circle-fill.svg'
import searchIcon from '../../assets/rencana/search-2-line.svg'
import arrowDown from '../../assets/rencana/arrow-down-s-line.svg'
import userIcon from '../../assets/rencana/user-3-fill.svg'
import editIcon from '../../assets/rencana/edit-2-fill.svg'
import arrowLeft from '../../assets/rencana/arrow-drop-left-line.svg'
import activeDot from '../../assets/rencana/pagination-dot.svg'

const PAGE_SIZE = 5

const STATUS_CLASS = {
  'Belum Mulai': 'bg-grey-50 text-grey-200',
  Berjalan: 'bg-lime-300 text-grey-300',
  Selesai: 'bg-grey-200 text-white',
}

function loadKegiatan() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

function SectionHeading({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-[7px] leading-[1.2] text-heading">
        <h1 className="text-[31px] font-bold">{title}</h1>
        <p className="text-[20px] font-medium">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function RencanaKegiatan() {
  const [kegiatan, setKegiatan] = useState(loadKegiatan)
  const [query, setQuery] = useState('')
  const [tahun, setTahun] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null) // null = form tertutup, {} = tambah baru

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kegiatan))
  }, [kegiatan])

  const years = [...new Set(kegiatan.map((k) => k.tahun))].sort()
  const filtered = kegiatan.filter((k) => matches(k, query) && (!tahun || k.tahun === tahun))
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  // Tampilkan maksimal 3 nomor halaman di sekitar halaman aktif, seperti di desain
  const firstPage = Math.max(1, Math.min(currentPage - 1, pageCount - 2))
  const pageNumbers = Array.from({ length: Math.min(3, pageCount) }, (_, i) => firstPage + i)

  function save(data) {
    setKegiatan((list) =>
      editing.id
        ? list.map((k) => (k.id === editing.id ? { ...k, ...data } : k))
        : [...list, { ...data, id: crypto.randomUUID(), warna: list.length % WARNA.length }],
    )
    setEditing(null)
  }

  return (
    <div className="mx-auto flex max-w-[1098px] flex-col gap-[33px] font-sans">
      <SectionHeading
        title="Rencana Kegiatan Statistik Sektoral"
        subtitle="Kelola agenda statistik sektoral OPD dalam siklus evaluasi biennial 2 tahunan."
      >
        <button
          type="button"
          onClick={() => setEditing({})}
          className="flex items-center gap-[10px] rounded-[16px] bg-grey-300 px-5 py-[10px] text-base leading-[1.2] text-lime-300"
        >
          <img src={addIcon} alt="" width={19} height={19} />
          Tambah Rencana Kegiatan
        </button>
      </SectionHeading>

      <section className="rounded-[20px] border-5 border-dashed border-lime-500 bg-lime-300 px-[10px] pt-[23px] pb-[10px]">
        <div className="mb-[29px] flex flex-wrap items-center justify-between gap-3 px-5">
          <label className="relative flex h-[45px] w-[330px] items-center">
            <span className="sr-only">Cari rencana kegiatan</span>
            <img src={searchIcon} alt="" width={31} height={31} className="pointer-events-none absolute left-2 rounded-[10px] bg-grey-300" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Cari Rencana Kegiatan..."
              className="size-full rounded-[16px] bg-grey2-75 pr-4 pl-[53px] text-base placeholder:font-light placeholder:text-grey-75 placeholder:italic focus:outline-2 focus:outline-grey-300"
            />
          </label>
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
                      ? 'Belum ada rencana kegiatan. Klik "Tambah Rencana Kegiatan" untuk menambahkan.'
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
                        <span className="font-light">Mulai :</span> {k.mulai}
                      </p>
                      <p className="mt-[7px]">
                        <span className="font-light">Selesai :</span> {k.selesai}
                      </p>
                    </td>
                    <td className="py-5 text-center">
                      <span className={`inline-flex h-6 items-center rounded-[10px] px-[10px] font-medium whitespace-nowrap ${STATUS_CLASS[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-5 text-center">
                      <button type="button" onClick={() => setEditing(k)} aria-label={`Edit ${k.nama}`} className="rounded-[5px] bg-lime-300">
                        <img src={editIcon} alt="" width={24} height={24} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {filtered.length > 0 && (
        <nav aria-label="Halaman" className="mx-auto flex h-[51px] w-[331px] items-center justify-between overflow-hidden rounded-[20px] bg-grey-300">
          <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Halaman sebelumnya" className="disabled:opacity-40">
            <img src={arrowLeft} alt="" width={53} height={53} />
          </button>
          <div className="flex items-center">
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === currentPage ? 'page' : undefined}
                className={`relative grid size-[37px] place-items-center text-[20px] leading-[1.2] font-semibold ${
                  n === currentPage ? 'text-grey-300' : 'text-lime-300'
                }`}
              >
                {n === currentPage && <img src={activeDot} alt="" width={37} height={37} className="absolute inset-0" />}
                <span className="relative">{n}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount} aria-label="Halaman berikutnya" className="disabled:opacity-40">
            <img src={arrowLeft} alt="" width={53} height={53} className="-scale-x-100" />
          </button>
        </nav>
      )}

      <hr className="border-grey-75" />

      <SectionHeading title="Kalender Kegiatan" subtitle="Pantau dan kelola jadwal kegiatan secara terstruktur dalam satu kalender." />
      <KalenderKegiatan kegiatan={kegiatan} onOpen={setEditing} />

      {editing && <KegiatanForm kegiatan={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

export default RencanaKegiatan
