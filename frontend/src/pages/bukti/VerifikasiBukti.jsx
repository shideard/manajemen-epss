import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { bolehUbah } from '../../config/menu'
import DomainBukti from './DomainBukti'
import { useBukti, useKegiatan, usePeriode, useSkor } from '../../lib/store'
import { includesText, indikatorById, paginate } from '../../lib/epss'
import { Memuat, Pagination, SearchBox, StatusBukti } from '../../components/ui'
import { useConfirm } from '../../components/useConfirm'

const PAGE_SIZE = 5

function VerifikasiBukti() {
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
    <div className="flex w-full flex-col gap-[25px]">
      <Memuat dari={muat} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[25px] leading-[1.2] font-semibold text-grey-500">Ajuan Terbaru</h1>
        <SearchBox
          value={query}
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
          placeholder="Cari indikator..."
        />
      </div>

      <ul className="flex flex-col gap-[14px]">
        {rows.length === 0 && <li className="rounded-[20px] bg-white py-10 text-center text-grey-100">Tidak ada ajuan yang menunggu verifikasi.</li>}
        {rows.map((b) => {
          const indikator = indikatorById[b.indikatorId]
          return (
            <li key={`${b.kegiatanId}:${b.indikatorId}`}>
              <Link
                to={`/verifikasi-bukti-dukung/${b.kegiatanId}/${b.indikatorId}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white px-[27px] py-4 transition duration-300 ease-out-quint hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex flex-col gap-2 leading-[1.2]">
                  <span className="text-base font-semibold text-grey-500">
                    Indikator {indikator.nomor}: {indikator.nama}
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-[17px] text-base font-light text-grey-200">
                    <span>
                      Pengaju: <span className="font-medium">{b.pengaju}</span>
                    </span>
                    <span aria-hidden className="text-[#cacaca]">
                      |
                    </span>
                    <span>
                      Kegiatan : <span className="text-[13px] font-medium">{namaKegiatan[b.kegiatanId]}</span>
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

      <div className="mt-[25px] flex flex-col gap-[25px]">
        <DomainBukti onVerifikasi={verifikasiIndikator} bolehVerifikasi={bolehUbah(user, 'verifikasiBukti', aktif)} />
      </div>
      {dialogKonfirmasi}
    </div>
  )
}

export default VerifikasiBukti
