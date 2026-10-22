import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import DomainBukti from './DomainBukti'
import { useBukti, useKegiatan } from '../../lib/store'
import { includesText, indikatorById, isPic, paginate } from '../../lib/epss'
import { Memuat, Pagination, SearchBox, StatusBukti } from '../../components/ui'

const PAGE_SIZE = 5
const FILTER = [
  { label: 'Semua', status: null },
  { label: 'Belum Unggah', status: 'draft' },
  { label: 'Menunggu Verifikasi', status: 'menunggu' },
  { label: 'Perlu Perbaikan', status: 'perbaikan' },
  { label: 'Terverifikasi', status: 'terverifikasi' },
]

function RepositoriBukti() {
  const { user } = useOutletContext()
  const muat = [useKegiatan(), useBukti()]
  const [{ kegiatan }, { bukti }] = muat
  const [semua, setSemua] = useState(false) // false = hanya kegiatan yang user ini PIC-nya
  const [filter, setFilter] = useState(null)
  const [query, setQuery] = useState('')
  const [queryIndikator, setQueryIndikator] = useState('')
  const [page, setPage] = useState(1)

  // Satu baris per pasangan kegiatan–indikator; kegiatan yang belum dipetakan tetap tampil
  const baris = kegiatan.filter((k) => semua || isPic(k, user)).flatMap((k) => {
    const daftar = Object.values(bukti).filter((b) => b.kegiatanId === k.id)
    return daftar.length ? daftar.map((b) => ({ kegiatan: k, bukti: b })) : [{ kegiatan: k, bukti: { status: 'draft' } }]
  })
  const filtered = baris.filter(
    ({ kegiatan: k, bukti: b }) =>
      (!filter || b.status === filter) && includesText([k.nama, k.pic, indikatorById[b.indikatorId]?.nama], query),
  )
  const { rows, page: currentPage, pageCount } = paginate(filtered, page, PAGE_SIZE)

  return (
    <div className="flex w-full flex-col gap-[30px]">
      <Memuat dari={muat} />
      <h1 className="text-[25px] leading-[1.2] font-semibold text-grey-500">Upload Bukti Dukung</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status">
          {FILTER.map((f) => (
            <button
              key={f.label}
              type="button"
              aria-pressed={filter === f.status}
              onClick={() => {
                setFilter(f.status)
                setPage(1)
              }}
              className={`h-[35px] cursor-pointer rounded-[15px] border border-grey-500 px-5 text-sm leading-[1.2] font-medium ${
                filter === f.status ? 'bg-grey-500 text-lime-300' : 'bg-lime-75 text-grey-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <SearchBox
          value={query}
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
          placeholder="Cari kegiatan atau indikator..."
        />
      </div>

      <section className="flex flex-col gap-[14px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] leading-[1.2] font-medium text-grey-500">{semua ? 'Semua Kegiatan' : 'Kegiatan Anda'}</h2>
          <label className="flex items-center gap-2 text-base text-grey-500">
            <input
              type="checkbox"
              checked={semua}
              onChange={(e) => {
                setSemua(e.target.checked)
                setPage(1)
              }}
              className="size-[18px] accent-grey-500"
            />
            Tampilkan kegiatan operator lain
          </label>
        </div>
        {rows.length === 0 && (
          <p className="rounded-[20px] bg-white py-10 text-center text-grey-100">
            {kegiatan.length === 0
              ? 'Belum ada rencana kegiatan dari verifikator.'
              : semua
                ? 'Tidak ada kegiatan yang cocok.'
                : 'Tidak ada kegiatan dengan Anda sebagai PIC yang cocok.'}
          </p>
        )}
        {rows.map(({ kegiatan: k, bukti: b }) => {
          const indikator = indikatorById[b.indikatorId]
          return (
            <Link
              key={`${k.id}:${b.indikatorId}`}
              to={`/repositori-bukti-dukung/${k.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white px-[27px] py-4 transition duration-300 ease-out-quint hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex flex-col gap-2 leading-[1.2]">
                <span className="text-base font-semibold text-grey-500">{k.nama}</span>
                <span className="flex flex-wrap items-baseline gap-x-[17px] text-base font-light text-grey-200">
                  <span>
                    PIC : <span className="font-medium">{k.pic}</span>
                  </span>
                  <span aria-hidden className="text-[#cacaca]">
                    |
                  </span>
                  <span>
                    {indikator ? `Indikator ${indikator.nomor} : ` : 'Indikator : '}
                    <span className="text-[13px] font-medium">{indikator?.nama ?? 'Belum dipetakan'}</span>
                  </span>
                </span>
              </span>
              <StatusBukti status={b.status} />
            </Link>
          )
        })}
      </section>

      {filtered.length > 0 && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[25px] leading-[1.2] font-semibold text-grey-500">Status per Indikator</h2>
        <SearchBox value={queryIndikator} onChange={setQueryIndikator} placeholder="Cari indikator..." />
      </div>
      <DomainBukti query={queryIndikator} />
    </div>
  )
}

export default RepositoriBukti
