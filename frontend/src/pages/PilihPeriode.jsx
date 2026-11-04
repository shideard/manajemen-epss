import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useOutletContext } from 'react-router-dom'
import { usePeriode } from '../lib/store'
import { paginate } from '../lib/epss'
import { Badge, PageHeader, Pagination } from '../components/ui'
import { buttonClass } from '../components/classes'
import { ROLES } from '../config/menu'
import arrowBlack from '../assets/icons/arrow-long-black.svg'
import addIcon from '../assets/rencana/add-circle-fill.svg'
import emptyIcon from '../assets/icons/file-3-fill.svg'

const PAGE_SIZE = 6

// Ditampilkan setelah login (tanpa sidebar), sebelum masuk dashboard
function PilihPeriode() {
  const { user, home } = useOutletContext()
  const navigate = useNavigate()

  const { periode, setAktifId, muat } = usePeriode()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function ambilPeriode() {
      try {
        setLoading(true)
        setError(null)
        await muat()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    ambilPeriode()
  }, [muat])

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

      {loading ? (
        <p className="text-body text-grey-500">
          Memuat daftar periode...
        </p>
      ) : error ? (
        <p className="text-body text-red-500">
          Gagal memuat periode: {error}
        </p>
      ) : periode.length === 0 ? (
        <section className="flex min-h-[280px] flex-col items-center justify-center gap-5 rounded-lg border border-grey-75 bg-white px-6 py-10 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-lime-300">
            <img src={emptyIcon} alt="" width={32} height={32} />
          </div>
          <div className="flex max-w-[520px] flex-col gap-2">
            <h2 className="text-h3">Belum ada periode penilaian</h2>
            <p className="text-body text-grey-200">Buat periode baru untuk mulai mengelola dan melakukan evaluasi penyelenggaraan statistik sektoral.</p>
          </div>
          {user.role === ROLES.VERIFIKATOR && (
            <Link to="/pengaturan-periode" className={buttonClass()}>
              <img src={addIcon} alt="" width={19} height={19} />
              Buat Periode Baru
            </Link>
          )}
        </section>
      ) : (
        <>
          <div className="grid w-full gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {rows.map((p) => (
              <article
                key={p.id}
                className="flex min-h-[193px] flex-col justify-between gap-4 rounded-lg bg-grey-300 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <h2 className="max-w-[305px] text-h3 text-white">
                      {p.nama}
                    </h2>
                    <p className="text-body text-lime-300">
                      {p.tahun1}-{p.tahun2}
                    </p>
                  </div>

                  <Badge tone={p.terkunci ? 'red' : 'green'}>
                    {p.terkunci ? 'Periode terkunci' : 'Periode Aktif'}
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={() => pilih(p.id)}
                  className={`justify-between! ${buttonClass('secondary')}`}
                >
                  Pilih Periode
                  <img src={arrowBlack} alt="" width={29} height={15} />
                </button>
              </article>
            ))}
          </div>

          {periode.length > 0 && (
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}

export default PilihPeriode
