import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import KegiatanForm from './KegiatanForm'
import PetaKegiatan from './PetaKegiatan'
import { useBukti, useKegiatan, usePeriode } from '../../lib/store'
import { bolehUbah } from '../../config/menu'
import { Memuat, PageHeader } from '../../components/ui'

function PetaRelasiKegiatan() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { aktif } = usePeriode()
  const muat = [useKegiatan(), useBukti()]
  const [{ kegiatan, simpan }, { bukti }] = muat
  // Sama dengan halaman Rencana Kegiatan: verifikator membuka form edit, operator ke repositori buktinya
  const kelola = bolehUbah(user, 'kelolaRencana', aktif)
  const [editing, setEditing] = useState(null)

  const buka = (k) => (kelola ? setEditing(k) : navigate(`/repositori-bukti-dukung/${k.id}`))

  function save(data) {
    simpan(editing.id, data)
    setEditing(null)
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader title="Peta Relasi Kegiatan" subtitle="Keterkaitan domain, aspek, dan indikator EPSS dengan rencana kegiatan." />
      <PetaKegiatan kegiatan={kegiatan} bukti={bukti} onOpen={buka} />

      {editing && (
        <KegiatanForm
          kegiatan={editing}
          indikator={Object.values(bukti).filter((b) => b.kegiatanId === editing.id)}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

export default PetaRelasiKegiatan
