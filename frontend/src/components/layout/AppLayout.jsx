import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { menuPathsForRole } from '../../config/menu'
import { useAuth } from '../../lib/store'
import { Memuat } from '../ui'
import { useConfirm } from '../useConfirm'
import accountIcon from '../../assets/sidebar/account-circle-fill.svg'

// Halaman tanpa menu sidebar yang boleh dibuka semua role
const COMMON_PATHS = ['/notifikasi', '/pilih-periode']
const RINGKAS_KEY = 'epss.sidebar-ringkas'

// bare = tanpa sidebar & topbar (halaman Pilih Periode)
function AppLayout({ bare = false }) {
  const location = useLocation()
  const auth = useAuth()
  const { user } = auth
  const [konfirmasi, dialogKonfirmasi] = useConfirm()
  const [menuMobile, setMenuMobile] = useState(false)
  // Sidebar ringkas (hanya logo + ikon) di layar besar secara default, pilihannya diingat per browser
  const [ringkas, setRingkas] = useState(() => {
    try {
      return localStorage.getItem(RINGKAS_KEY) !== '0'
    } catch {
      return true
    }
  })

  // Di bawah lg tombol menu membuka laci; di lg ke atas meringkas/melebarkan sidebar
  const toggleMenu = () => {
    if (!window.matchMedia('(min-width: 64rem)').matches) return setMenuMobile(true)
    setRingkas(!ringkas)
    try {
      localStorage.setItem(RINGKAS_KEY, ringkas ? '0' : '1')
    } catch {
      // ponytail: tanpa localStorage pilihan hanya bertahan sampai halaman dimuat ulang
    }
  }

  // Sesi dihapus → render ulang → <Navigate> ke halaman login di bawah
  const logout = () =>
    konfirmasi({
      title: 'Keluar',
      message: 'Keluar dari Sistem Manajemen EPSS?',
      confirmLabel: 'Keluar',
      onConfirm: auth.logout,
    })

  // Sesi masih dicek → jangan lempar ke login dulu
  if (!user && (auth.loading || auth.error)) return <Memuat dari={[auth]} />

  // Belum login, atau akunnya dihapus/dinonaktifkan di Kelola Pengguna → ke halaman login
  if (!user || user.status_aktif === false) return <Navigate to="/login" replace />


  // Halaman di luar menu role ini → ke menu pertama (mis. superadmin → Kelola Pengguna)
  const menuPaths = menuPathsForRole(user.role)
  const allowed = [...menuPaths, ...COMMON_PATHS].some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))
  if (!allowed) return <Navigate to={menuPaths[0]} replace />

  if (bare) {
    return (
      <main className="relative min-h-screen bg-grey2-100 px-4 py-25.5 font-sans sm:px-10 xl:px-15">
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
    <div className="flex min-h-screen bg-grey2-100">
      <Sidebar user={user} onLogout={logout} ringkas={ringkas} open={menuMobile} onClose={() => setMenuMobile(false)} />
      <main className="min-w-0 flex-1 px-4 pt-6.5 pb-24 font-sans sm:px-6 lg:px-10">
        <div className="flex items-start gap-2">
          {/* Di bawah lg sidebar disembunyikan dan dibuka sebagai laci lewat tombol ini */}
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Tampilkan atau ringkas menu"
            aria-controls="sidebar"
            className="grid size-[45px] shrink-0 place-items-center rounded-sm bg-white text-grey-500"
          >
            <Menu size={24} />
          </button>
          <div className="min-w-0 flex-1">
            <Topbar />
          </div>
        </div>
        {/* key berubah tiap pindah halaman, jadi animasinya diputar ulang */}
        <div key={location.pathname} className="stagger mt-7">
          <Outlet context={{ user }} />
        </div>
      </main>
      {dialogKonfirmasi}
    </div>
  )
}

export default AppLayout
