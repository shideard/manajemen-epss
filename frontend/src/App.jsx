import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import PlaceholderPage from './pages/PlaceholderPage'
import Login from './pages/Login'
import RencanaKegiatan from './pages/rencana-kegiatan/RencanaKegiatan'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedoman-indikator" element={<PlaceholderPage title="Pedoman Indikator" />} />
        <Route path="/rencana-kegiatan" element={<RencanaKegiatan />} />
        <Route path="/repositori-bukti-dukung" element={<PlaceholderPage title="Repositori Bukti Dukung" />} />
        <Route path="/verifikasi-bukti-dukung" element={<PlaceholderPage title="Verifikasi Bukti Dukung" />} />
        <Route path="/export-lke" element={<PlaceholderPage title="Export LKE & Bukti" />} />
        <Route path="/pengaturan-periode" element={<PlaceholderPage title="Pengaturan Periode" />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
