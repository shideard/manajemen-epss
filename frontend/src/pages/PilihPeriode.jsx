import { useState } from 'react'
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom'
import { usePeriode } from '../lib/store'
import { paginate } from '../lib/epss'
import { Badge, Pagination } from '../components/ui'
import { ROLES } from '../config/menu'
import arrowBlack from '../assets/icons/arrow-long-black.svg'

const PAGE_SIZE = 6

// Ditampilkan setelah login (tanpa sidebar), sebelum masuk dashboard
function PilihPeriode() {
  const { user, home } = useOutletContext()
  const navigate = useNavigate()
  const { periode, setAktifId } = usePeriode()
  const [page, setPage] = useState(1)

  // Superadmin tidak bekerja per periode
  if (user.role === ROLES.SUPER_ADMIN_BIDANG) return <Navigate to={home} replace />

  const { rows, page: currentPage, pageCount } = paginate(periode, page, PAGE_SIZE)

  function pilih(id) {
    setAktifId(id)
    navigate(home)
  }

  return (
    <div className="flex w-full flex-col items-center gap-[30px]">
      <div className="flex w-full flex-col gap-2 rounded-[20px] bg-lime-200 px-[27px] py-[21px] leading-[1.2] text-grey-500">
        <h1 className="text-[25px] font-bold">Pilih Periode Penilaian</h1>
        <p className="text-base">Pilih periode penilaian yang akan digunakan untuk mengelola dan melakukan evaluasi penyelenggaraan statistik sektoral.</p>
      </div>

      <div className="grid w-full gap-4 md:grid-cols-2 md:gap-x-[22px] 2xl:grid-cols-3">
        {rows.map((p) => (
          <article key={p.id} className="flex min-h-[193px] flex-col justify-between gap-4 rounded-[20px] bg-grey-300 px-[27px] pt-[22px] pb-[26px]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-[7px] leading-[1.2]">
                <h2 className="max-w-[305px] text-[25px] font-semibold text-white">{p.nama}</h2>
                <p className="text-base text-lime-75">
                  {p.tahun1}-{p.tahun2}
                </p>
              </div>
              <Badge tone={p.terkunci ? 'red' : 'green'} className="w-[158px] text-base">
                {p.terkunci ? 'Periode terkunci' : 'Periode Aktif'}
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => pilih(p.id)}
              className="flex items-center justify-between rounded-[16px] bg-white px-5 py-[10px] text-base leading-[1.2] text-grey-500"
            >
              Pilih Periode
              <img src={arrowBlack} alt="" width={29} height={15} />
            </button>
          </article>
        ))}
      </div>

      {periode.length > 0 && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}
    </div>
  )
}

export default PilihPeriode
