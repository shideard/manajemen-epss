import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Login from './pages/Login'
import PilihPeriode from './pages/PilihPeriode'
import Notifikasi from './pages/Notifikasi'
import PedomanIndikator from './pages/PedomanIndikator'
import ExportLke from './pages/ExportLke'
import RencanaKegiatan from './pages/rencana-kegiatan/RencanaKegiatan'
import PetaRelasiKegiatan from './pages/rencana-kegiatan/PetaRelasiKegiatan'
import PengaturanPeriode from './pages/periode/PengaturanPeriode'
import KonfigurasiPeriode from './pages/periode/KonfigurasiPeriode'
import RepositoriBukti from './pages/bukti/RepositoriBukti'
import RepositoriDetail from './pages/bukti/RepositoriDetail'
import VerifikasiBukti from './pages/bukti/VerifikasiBukti'
import VerifikasiDetail from './pages/bukti/VerifikasiDetail'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout bare />}>
        <Route path="/pilih-periode" element={<PilihPeriode />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifikasi" element={<Notifikasi />} />
        <Route path="/pedoman-indikator" element={<PedomanIndikator />} />
        <Route path="/rencana-kegiatan" element={<RencanaKegiatan />} />
        <Route path="/rencana-kegiatan/peta-relasi" element={<PetaRelasiKegiatan />} />
        <Route path="/repositori-bukti-dukung" element={<RepositoriBukti />} />
        <Route path="/repositori-bukti-dukung/:kegiatanId" element={<RepositoriDetail />} />
        <Route path="/verifikasi-bukti-dukung" element={<VerifikasiBukti />} />
        <Route path="/verifikasi-bukti-dukung/:kegiatanId/:indikatorId" element={<VerifikasiDetail />} />
        <Route path="/export-lke" element={<ExportLke />} />
        <Route path="/pengaturan-periode" element={<PengaturanPeriode />} />
        <Route path="/pengaturan-periode/:id" element={<KonfigurasiPeriode />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
