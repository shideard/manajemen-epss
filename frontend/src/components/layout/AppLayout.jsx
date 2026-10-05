import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { api } from '../../lib/api'

// ponytail: login dimatikan sementara; hapus DEV_USER (jadikan null) untuk mengaktifkan login lagi.
// Ganti role ke VERIFIKATOR / SUPER_ADMIN_BIDANG untuk melihat menu role lain.
const DEV_USER = { name: 'Dev User', role: 'OPERATOR' }

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(DEV_USER)

  // Belum login (401) atau akun nonaktif (403) → ke halaman login
  useEffect(() => {
    if (DEV_USER) return
    api('/api/user')
      .then(setUser)
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate])

  async function logout() {
    await api('/logout', { method: 'POST' })
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar user={user} onLogout={logout} />
      <main className="min-w-0 flex-1 px-10 py-[95px]">
        {/* key berubah tiap pindah halaman, jadi animasinya diputar ulang */}
        <div key={location.pathname} className="motion-safe:animate-page-in">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
