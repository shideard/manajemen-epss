import { useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import PetaKegiatan from './PetaKegiatan'
import { useBukti, useInstrumen, usePeriode, useSemuaKegiatan } from '../../lib/store'
import { pemetaanBukti } from '../../lib/epss'
import { bolehUbah } from '../../config/menu'
import { Memuat, PageHeader } from '../../components/ui'

function PetaRelasiKegiatan() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const { aktif } = usePeriode()
  const muat = [useSemuaKegiatan(aktif?.id), useBukti(), useInstrumen(aktif?.id)]
  const [{ kegiatan }, { bukti: ajuan }, { instrumen }] = muat
  const bukti = useMemo(() => pemetaanBukti(kegiatan, ajuan), [kegiatan, ajuan])
  // Verifikator ke detail kegiatan (ada tombol edit), operator ke repositori buktinya
  const kelola = bolehUbah(user, 'kelolaRencana', aktif)
  const buka = (k) => navigate(kelola ? `/rencana-kegiatan/${k.id}` : `/repositori-bukti-dukung/${k.id}`)

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} bentuk="peta" />
      <PageHeader title="Peta Relasi Kegiatan" subtitle="Keterkaitan domain, aspek, dan indikator EPSS dengan rencana kegiatan." />
      <PetaKegiatan instrumen={instrumen} kegiatan={kegiatan} bukti={bukti} onOpen={buka} />
    </div>
  )
}

export default PetaRelasiKegiatan
