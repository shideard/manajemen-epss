import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import KegiatanForm from './KegiatanForm'
import PetaKegiatan from './PetaKegiatan'
import { useInstrumen, usePeriode, useRencanaKegiatan, useSemuaKegiatan } from '../../lib/store'
import { bolehUbah } from '../../config/menu'
import { Memuat, PageHeader } from '../../components/ui'

function PetaRelasiKegiatan() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { aktif } = usePeriode()
  const rencana = useRencanaKegiatan(aktif?.id)
  const semuaKegiatan = useSemuaKegiatan(aktif?.id)
  const instrumen = useInstrumen(aktif?.id)
  const muat = [rencana, semuaKegiatan, instrumen]
  const [{ simpan }, { kegiatan, muatUlang }] = muat
  // Sama dengan halaman Rencana Kegiatan: verifikator membuka form edit, operator ke repositori buktinya
  const kelola = bolehUbah(user, 'kelolaRencana', aktif)
  const [editing, setEditing] = useState(null)

  const buka = (k) => (kelola ? setEditing(k) : navigate(`/repositori-bukti-dukung/${k.id}`))

  async function save(data) {
    await simpan(editing.id, data)
    muatUlang()
    setEditing(null)
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} bentuk="peta" />
      <PageHeader title="Peta Relasi Kegiatan" subtitle="Keterkaitan domain, aspek, dan indikator EPSS dengan rencana kegiatan." />
      <PetaKegiatan kegiatan={kegiatan} indikator={instrumen.indikator} domains={instrumen.domains} onOpen={buka} />

      {editing && (
        <KegiatanForm
          kegiatan={editing}
          indikator={editing.indikator}
          opds={rencana.opds}
          pics={rencana.pics}
          indikatorPilihan={rencana.indikator}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

export default PetaRelasiKegiatan
