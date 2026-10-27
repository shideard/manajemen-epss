import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { bolehUbah } from '../../config/menu'
import DomainBukti from './DomainBukti'
import { useBukti, useKegiatan, usePeriode, useSkor } from '../../lib/store'
import { includesText, indikatorById, paginate } from '../../lib/epss'
import { Memuat, PageHeader, Pagination, SearchBox, StatusBukti } from '../../components/ui'
import { useConfirm } from '../../components/useConfirm'

const PAGE_SIZE = 5

function  VerifikasiBukti() {
  const { user } = useOutletContext()
  const { aktif } = usePeriode()
  const muat = [useKegiatan(), useBukti(), useSkor()]
  const [{ kegiatan }, { bukti }, { tetapkanLevel }] = muat
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  const namaKegiatan = Object.fromEntries(kegiatan.map((k) => [k.id, k.nama]))
  const ajuan = Object.values(bukti)
    .filter((b) => b.status === 'menunggu' && namaKegiatan[b.kegiatanId])
    .filter((b) => includesText([indikatorById[b.indikatorId].nama, namaKegiatan[b.kegiatanId], b.pengaju], query))
    .sort((a, b) => b.diajukan.localeCompare(a.diajukan))
  const { rows, page: currentPage, pageCount } = paginate(ajuan, page, PAGE_SIZE)

  // Indikator valid jika semua kegiatan tertautnya valid; level indikator = level terendah dari kegiatan tsb
  function verifikasiIndikator(indikator, level) {
    konfirmasi({
      title: 'Verifikasi Indikator',
      message: `Tetapkan Indikator ${indikator.nomor} (${indikator.nama}) pada Level ${level}? Skor IPS dihitung ulang dan tercatat di riwayat snapshot.`,
      confirmLabel: 'Verifikasi',
      onConfirm: () => tetapkanLevel(aktif.id, indikator, level),
    })
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
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
                    Indikator {indikator.nomor}: {indikator.nama}
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
                <StatusBukti status="menunggu" />
              </Link>
            </li>
          )
        })}
      </ul>

      {ajuan.length > 0 && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}

      <PageHeader as="h2" title="Status per Indikator" />
      <div className="flex flex-col gap-6">
        <DomainBukti onVerifikasi={verifikasiIndikator} bolehVerifikasi={bolehUbah(user, 'verifikasiBukti', aktif)} />
      </div>
      {dialogKonfirmasi}
    </div>
  )
}

export default VerifikasiBukti
