import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import DomainBukti from './DomainBukti'
import { useBukti, usePeriode, useSemuaKegiatan } from '../../lib/store'
import { buktiKey, includesText, indikatorById, paginate } from '../../lib/epss'
import { Memuat, PageHeader, Pagination, SearchBox, StatusBukti } from '../../components/ui'

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
  const { aktif } = usePeriode()
  const [semua, setSemua] = useState(false) // false = hanya kegiatan yang user ini PIC-nya
  const [filter, setFilter] = useState(null)
  const [query, setQuery] = useState('')
  const [queryIndikator, setQueryIndikator] = useState('')
  const [page, setPage] = useState(1)
  const muat = [useSemuaKegiatan(aktif?.id), useBukti()]
  const [{ kegiatan }, { bukti }] = muat

  // Satu baris per pasangan kegiatan–indikator; kegiatan yang belum dipetakan tetap tampil. Statusnya masih dari browser
  const baris = kegiatan
    .filter((k) => semua || k.pic_user_id === user.id)
    .flatMap((k) => {
      const daftar = k.indikatorIds.map((id) => ({ kegiatan: k, indikator: indikatorById[id], bukti: bukti[buktiKey(k.id, id)] ?? { status: 'draft' } }))
      return daftar.length ? daftar : [{ kegiatan: k, indikator: null, bukti: { status: 'draft' } }]
    })
  const filtered = baris.filter(
    ({ kegiatan: k, indikator, bukti: b }) => (!filter || b.status === filter) && includesText([k.nama, k.pic, indikator?.nama], query),
  )
  const { rows, page: currentPage, pageCount } = paginate(filtered, page, PAGE_SIZE)

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader title="Upload Bukti Dukung" />

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
              className={`h-[45px] rounded-md border border-grey-500 px-5 font-medium ${
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

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h3">{semua ? 'Semua Kegiatan' : 'Kegiatan Anda'}</h2>
          <label className="flex items-center gap-2">
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
          <p className="rounded-lg bg-white py-10 text-center text-grey-200">
            {kegiatan.length === 0
              ? 'Belum ada rencana kegiatan dari verifikator.'
              : semua
                ? 'Tidak ada kegiatan yang cocok.'
                : 'Tidak ada kegiatan dengan Anda sebagai PIC yang cocok.'}
          </p>
        )}
        {rows.map(({ kegiatan: k, indikator, bukti: b }) => {
          return (
            <Link
              key={`${k.id}:${indikator?.id}`}
              to={`/repositori-bukti-dukung/${k.id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white px-7 py-4 transition duration-300 ease-out-quint hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex flex-col gap-2">
                <span className="font-semibold">{k.nama}</span>
                <span className="flex flex-wrap items-baseline gap-x-4 font-light text-grey-200">
                  <span>
                    PIC : <span className="font-medium">{k.pic}</span>
                  </span>
                  <span aria-hidden className="text-grey-75">
                    |
                  </span>
                  <span>
                    {indikator ? `Indikator ${indikator.nomor} : ` : 'Indikator : '}
                    <span className="font-medium">{indikator?.nama ?? 'Belum dipetakan'}</span>
                  </span>
                </span>
              </span>
              <StatusBukti status={b.status} className="text-small"/>
            </Link>
          )
        })}
      </section>

      {filtered.length > 0 && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}

      <PageHeader as="h2" title="Status per Indikator">
        <SearchBox value={queryIndikator} onChange={setQueryIndikator} placeholder="Cari indikator..." />
      </PageHeader>
      <DomainBukti query={queryIndikator} />
    </div>
  )
}

export default RepositoriBukti
