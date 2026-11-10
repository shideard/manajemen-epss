import { useState } from 'react'
import { Link } from 'react-router-dom'
import DomainBukti from './DomainBukti'
import { useBukti, useInstrumen, usePeriode, useSemuaKegiatan } from '../../lib/store'
import { includesText, paginate } from '../../lib/epss'
import { Dropdown, Memuat, PageHeader, Pagination, SearchBox, StatusBukti } from '../../components/ui'

const PAGE_SIZE = 5

function  VerifikasiBukti() {
  const { aktif } = usePeriode()
  const muat = [useSemuaKegiatan(aktif?.id), useBukti(), useInstrumen(aktif?.id)]
  const [{ kegiatan }, { bukti }, { instrumen }] = muat
  const indikatorById = instrumen.byId
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [filterIndikator, setFilterIndikator] = useState('semua')

  const namaKegiatan = Object.fromEntries(kegiatan.map((k) => [k.id, k.nama]))
  const levelTarget = Object.fromEntries(kegiatan.map((k) => [k.id, k.levelTarget]))
  const ajuan = Object.values(bukti)
    .filter((b) => b.status === 'menunggu' && namaKegiatan[b.kegiatanId] && indikatorById[b.indikatorId])
    .filter((b) => includesText([indikatorById[b.indikatorId].nama, namaKegiatan[b.kegiatanId], b.pengaju], query))
    .sort((a, b) => b.diajukan.localeCompare(a.diajukan))
  const { rows, page: currentPage, pageCount } = paginate(ajuan, page, PAGE_SIZE)

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} bentuk="daftar" />
      <PageHeader title="Ajuan Terbaru">
        <SearchBox
          value={query}
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
          placeholder="Cari indikator..."
        />
      </PageHeader>

      <ul className="flex flex-col gap-4">
        {rows.length === 0 && <li className="rounded-lg bg-white py-10 text-center text-grey-200">Tidak ada ajuan yang menunggu verifikasi.</li>}
        {rows.map((b) => {
          const indikator = indikatorById[b.indikatorId]
          return (
            <li key={`${b.kegiatanId}:${b.indikatorId}`}>
              <Link
                to={`/verifikasi-bukti-dukung/${b.kegiatanId}/${b.indikatorId}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white px-7 py-4 transition duration-300 ease-out-quint hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex flex-col gap-2">
                  <span className="font-semibold">
                    Indikator {indikator.nomor}: {indikator.nama} · Level {levelTarget[b.kegiatanId]?.[b.indikatorId] ?? 1}
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-4 font-light text-grey-200">
                    <span>
                      Pengaju: <span className="font-medium">{b.pengaju}</span>
                    </span>
                    <span aria-hidden className="text-grey-75">
                      |
                    </span>
                    <span>
                      Kegiatan : <span className="font-medium">{namaKegiatan[b.kegiatanId]}</span>
                    </span>
                  </span>
                </span>
                <StatusBukti status="menunggu" className="text-small"/>
              </Link>
            </li>
          )
        })}
      </ul>

      {ajuan.length > 0 && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}

      <PageHeader as="h2" title="Status per Indikator">
        <Dropdown
          label="Filter indikator"
          value={filterIndikator}
          onChange={setFilterIndikator}
          options={[
            { value: 'semua', label: 'Semua indikator' },
            { value: 'terverifikasi', label: 'Sudah punya level terverifikasi' },
            { value: 'menunggu', label: 'Ada ajuan menunggu' },
            { value: 'belum', label: 'Belum ada level terverifikasi' },
          ]}
          className="w-[260px]"
        />
      </PageHeader>
      <div className="flex flex-col gap-6">
        <DomainBukti filterIndikator={filterIndikator} verifikator />
      </div>
    </div>
  )
}

export default VerifikasiBukti
