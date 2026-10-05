import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { ROLES } from '../../config/menu'

// Sementara pakai user palsu; nanti diganti data dari GET /api/user
// Ganti role ke ROLES.VERIFIKATOR untuk melihat menu verifikator
const mockUser = { name: 'Ani', role: ROLES.OPERATOR }

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={mockUser} />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
