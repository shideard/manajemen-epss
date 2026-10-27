import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { getMenuForRole } from '../../config/menu'
import { useStore } from '../../lib/store'
import { cariAkun, KEYS, SEED_USERS } from '../../lib/epss'
import { useConfirm } from '../useConfirm'
import accountIcon from '../../assets/sidebar/account-circle-fill.svg'

// Halaman tanpa menu sidebar yang boleh dibuka semua role
const COMMON_PATHS = ['/notifikasi', '/pilih-periode']

// bare = tanpa sidebar & topbar (halaman Pilih Periode)
function AppLayout({ bare = false }) {
  const location = useLocation()
  const [sesi, setSesi] = useStore(KEYS.sesi, null)
  const [users] = useStore(KEYS.users, SEED_USERS)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()
  const [menuMobile, setMenuMobile] = useState(false)
  const user = cariAkun(users, sesi)

  // Sesi dihapus → render ulang → <Navigate> ke halaman login di bawah
  const logout = () =>
    konfirmasi({
      title: 'Keluar',
      message: 'Keluar dari Sistem Manajemen EPSS?',
      confirmLabel: 'Keluar',
      onConfirm: () => setSesi(null),
    })

  // Belum login, atau akunnya dihapus/dinonaktifkan di Kelola Pengguna → ke halaman login
  if (!user || user.status_aktif === false) return <Navigate to="/login" replace />


  // Halaman di luar menu role ini → ke menu pertama (mis. superadmin → Kelola Pengguna)
  const menuPaths = getMenuForRole(user.role).flatMap((section) => section.items.map((item) => item.path))
  const allowed = [...menuPaths, ...COMMON_PATHS].some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))
  if (!allowed) return <Navigate to={menuPaths[0]} replace />

  if (bare) {
    return (
      <main className="relative min-h-screen bg-on-dark px-4 py-[102px] font-sans sm:px-10 xl:px-[60px]">
        <div className="stagger">
          <Outlet context={{ user, home: menuPaths[0] }} />
        </div>
        <button type="button" onClick={logout} title="Keluar" aria-label="Keluar" className="fixed bottom-[34px] left-[19px]">
          <img src={accountIcon} alt="" width={53} height={53} className="brightness-0" />
        </button>
        {dialogKonfirmasi}
      </main>
    )
  }

  return (
    <div className="flex min-h-screen bg-on-dark">
      <Sidebar user={user} onLogout={logout} open={menuMobile} onClose={() => setMenuMobile(false)} />
      <main className="min-w-0 flex-1 px-4 pt-[26px] pb-[95px] font-sans sm:px-6 lg:px-10">
        <div className="flex items-start gap-[7px]">
          {/* Di bawah lg sidebar disembunyikan dan dibuka sebagai laci lewat tombol ini */}
          <button
            type="button"
            onClick={() => setMenuMobile(true)}
            aria-label="Buka menu"
            aria-expanded={menuMobile}
            className="grid size-[42px] shrink-0 place-items-center rounded-[10px] bg-white text-grey-500 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="min-w-0 flex-1">
            <Topbar />
          </div>
        </div>
        {/* key berubah tiap pindah halaman, jadi animasinya diputar ulang */}
        <div key={location.pathname} className="stagger mt-[27px]">
          <Outlet context={{ user }} />
        </div>
      </main>
      {dialogKonfirmasi}
    </div>
  )
}

export default AppLayout
