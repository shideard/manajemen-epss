import { useEffect, useState } from 'react'
import { Building2, CalendarDays, UserRound } from 'lucide-react'
import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import KegiatanForm from './KegiatanForm'
import RepositoriDetail from '../bukti/RepositoriDetail'
import { bolehUbah, ROLES } from '../../config/menu'
import { buttonClass } from '../../components/classes'
import editIcon from '../../assets/rencana/edit-2-fill.svg'
import { usePeriode, useRencanaKegiatan } from '../../lib/store'
import { formatTanggal, LEVELS, statusOf } from '../../lib/epss'
import { Badge, Memuat, PageHeader } from '../../components/ui'

function RencanaKegiatanDetailVerifikator() {
  const { kegiatanId } = useParams()
  const { user } = useOutletContext()
  const { aktif } = usePeriode()
  const rencana = useRencanaKegiatan(aktif?.id)
  const muat = [rencana]
  const { detail } = rencana
  // Hasil detail ditandai id-nya: loading = hasil yang ada belum milik kegiatan ini
  const [hasil, setHasil] = useState({ id: null, item: null })
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!kegiatanId) return
    let hidup = true
    detail(kegiatanId).then(
      (item) => hidup && setHasil({ id: kegiatanId, item }),
      (error) => hidup && setHasil({ id: kegiatanId, item: { error } }),
    )
    return () => { hidup = false }
  }, [kegiatanId, detail])
  const detailLoading = Boolean(kegiatanId) && hasil.id !== kegiatanId
  const k = detailLoading ? null : hasil.item
  const setK = (item) => setHasil({ id: kegiatanId, item })
  if ((!k && detailLoading) || muat.some((data) => data.loading)) return <Memuat dari={muat} bentuk="detail" />
  if (k?.error) return <p role="alert" className="text-red-500">{k.error.message}</p>
  if (!k) return <Navigate to="/rencana-kegiatan" replace />

  const indikator = k.indikator ?? []
  const bolehEdit = bolehUbah(user, 'kelolaRencana', aktif)

  async function save(data) {
    const updated = await rencana.simpan(k.id, data)
    setK(updated)
    setEditing(false)
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} bentuk="detail" />
      <PageHeader back="/rencana-kegiatan" title="Detail Rencana Kegiatan" subtitle="Informasi dan pemetaan indikator kegiatan.">
        {bolehEdit && (
          <button type="button" onClick={() => setEditing(true)} className={buttonClass()}>
            <img src={editIcon} alt="" width={19} height={19} />
            Edit Kegiatan
          </button>
        )}
      </PageHeader>

      <section className="flex flex-col gap-8 rounded-lg border-5 border-dashed border-lime-500 bg-lime-300 px-4 py-6 md:px-8">
        <div className="flex flex-col items-center gap-12.5 rounded-lg bg-grey2-50 px-4 py-9 md:px-10">
          <div className="flex w-full flex-col items-center gap-4">
            <span className="rounded-md border border-grey-500 px-5 py-1">Rencana Kegiatan</span>
            <h2 className="text-center text-h2">{k.nama}</h2>
            <div className="rounded-full bg-lime-300 px-3 py-1 text-small font-medium">{statusOf(k)}</div>
            {k.deskripsi && <p className="max-w-3xl text-center text-grey-200">{k.deskripsi}</p>}
            <hr className="w-full border-grey-50" />
            <dl className="grid w-full grid-cols-2 gap-2.5 px-4 text-center md:grid-cols-3 md:px-15">
              {[
                [Building2, 'OPD', k.opd],
                [UserRound, 'PIC', k.pic],
                [CalendarDays, 'Jadwal', <>{formatTanggal(k.mulai)}<br />- {formatTanggal(k.selesai)}</>],
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <Icon size={25} aria-hidden="true" className="rounded-xs bg-grey-500 px-1 py-1 text-white" />
                  <dt className="font-bold">{label}</dt>
                  <dd className="rounded-sm bg-lime-100 px-4 py-2">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <section className="flex flex-col gap-3 rounded-lg bg-white p-6 md:p-8">
          <h3 className="font-semibold">Output Bukti Dukung yang Ditargetkan</h3>
          {k.output?.length ? (
            <ul className="flex flex-col gap-2">
              {k.output.map((output) => (
                <li key={output.id} className="flex min-h-11 flex-col justify-center rounded-md bg-lime-300 px-5 py-2">
                  <span>{output.judul}{output.jenis && <span className="text-small"> ({output.jenis})</span>}</span>
                  {output.contoh && <span className="text-small text-grey-200">Contoh: {output.contoh.nama}</span>}
                </li>
              ))}
            </ul>
          ) : <p className="text-small text-grey-200">Belum ada output bukti dukung yang ditargetkan.</p>}
        </section>

        <section className="flex flex-col gap-3 rounded-lg bg-white p-6 md:p-8">
          <h3 className="font-semibold">Indikator Tertaut ({indikator.length})</h3>
          {indikator.length ? (
            <ul className="flex flex-col gap-2">
              {indikator.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-grey2-75 px-5 py-3 text-small">
                  Indikator {item.kode}: {item.nama}
                  <Badge tone="blue">Target Level {item.level ?? 1} ({LEVELS[(item.level ?? 1) - 1]})</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="text-small text-grey-200">Belum ada indikator yang dipetakan ke kegiatan ini.</p>}
        </section>
      </section>

      {editing && (
        <KegiatanForm
          kegiatan={k}
          indikator={indikator}
          opds={rencana.opds}
          pics={rencana.pics}
          indikatorPilihan={rencana.indikator}
          onSave={save}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

function RencanaKegiatanDetail() {
  const { user } = useOutletContext()
  if (user.role === ROLES.OPERATOR) return <RepositoriDetail />
  return <RencanaKegiatanDetailVerifikator />
}

export default RencanaKegiatanDetail
