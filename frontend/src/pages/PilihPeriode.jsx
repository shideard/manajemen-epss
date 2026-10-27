import { useState } from 'react'
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom'
import { usePeriode } from '../lib/store'
import { paginate } from '../lib/epss'
import { Badge, PageHeader, Pagination } from '../components/ui'
import { buttonClass } from '../components/classes'
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
    <div className="flex w-full flex-col gap-8">
      <PageHeader
        title="Pilih Periode Penilaian"
        subtitle="Pilih periode penilaian yang akan digunakan untuk mengelola dan melakukan evaluasi penyelenggaraan statistik sektoral."
      />

      <div className="grid w-full gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {rows.map((p) => (
          <article key={p.id} className="flex min-h-[193px] flex-col justify-between gap-4 rounded-lg bg-grey-300 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <h2 className="max-w-[305px] text-h3 text-white">{p.nama}</h2>
                <p className="text-body text-lime-300">
                  {p.tahun1}-{p.tahun2}
                </p>
              </div>
              <Badge tone={p.terkunci ? 'red' : 'green'}>
                {p.terkunci ? 'Periode terkunci' : 'Periode Aktif'}
              </Badge>
            </div>
            <button type="button" onClick={() => pilih(p.id)} className={`justify-between! ${buttonClass('secondary')}`}>
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
