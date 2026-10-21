import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PeriodeFields } from './PengaturanPeriode'
import { usePeriode, useStore } from '../../lib/store'
import { EMPTY_LIST, EMPTY_OBJECT, hitungIps, INDIKATOR, KEYS, predikat, PREDIKAT_TONE, validasiPeriode } from '../../lib/epss'
import { BackButton, Badge } from '../../components/ui'
import { useConfirm } from '../../components/useConfirm'

const formatWaktu = (iso) => new Date(iso).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' }).replace(' ', '   ')

function KonfigurasiPeriode() {
  const { id } = useParams()
  const { periode, setPeriode } = usePeriode()
  const [levels] = useStore(KEYS.levelIndikator, EMPTY_OBJECT)
  const [snapshot] = useStore(KEYS.snapshot, EMPTY_LIST)
  const [pesan, setPesan] = useState('')
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  const p = periode.find((item) => item.id === id)
  if (!p) return <Navigate to="/pengaturan-periode" replace />

  const lainnya = periode.filter((item) => item.id !== id && item.actual != null)
  const riwayat = snapshot.filter((s) => s.periodeId === id)
  const ubah = (perubahan) => setPeriode((list) => list.map((item) => (item.id === id ? { ...item, ...perubahan } : item)))

  function handleSubmit(event) {
    event.preventDefault()
    const { data, error } = validasiPeriode(Object.fromEntries(new FormData(event.currentTarget)))
    if (error) return setPesan(error)
    ubah(data)
    setPesan('Konfigurasi tersimpan.')
  }

  function kunci() {
    konfirmasi({
      title: 'Kunci Periode',
      message: `Kunci periode "${p.nama}"? Data dan skor IPS akan dibekukan dan tidak bisa diubah lagi.`,
      confirmLabel: 'Kunci Periode',
      danger: true,
      onConfirm: () => {
        ubah({ terkunci: true, actual: Math.round(hitungIps(INDIKATOR, levels) * 100) / 100 })
        setPesan('Periode dikunci.')
      },
    })
  }

  return (
    <div className="flex w-full flex-col gap-[33px]">
      <div className="flex flex-col items-start gap-[7px] leading-[1.2] text-grey-500">
        <BackButton fallback="/pengaturan-periode" />
        <div className="flex flex-col gap-[7px]">
          <h1 className="text-[31px] font-bold">Konfigurasi Periode &amp; Target IPS</h1>
          <p className="text-[20px] font-medium">Konfigurasi siklus 2 tahunan year-agnostic dan penetapan target IPS.</p>
        </div>
      </div>

      <div className="grid gap-[33px] lg:grid-cols-[3fr_2fr]">
        {/* key: form di-reset saat pindah periode */}
        <form key={p.id} onSubmit={handleSubmit} className="flex flex-col gap-[30px] rounded-[20px] bg-white px-[17px] py-[30px]">
          <PeriodeFields
            periode={p}
            disabled={p.terkunci}
            namaAside={
              <Badge tone={p.terkunci ? 'red' : 'green'} className="text-[13px] font-normal">
                {p.terkunci ? 'Periode terkunci' : 'Periode Aktif'}
              </Badge>
            }
          />
          {pesan && (
            <p role="status" className="text-sm text-grey-200">
              {pesan}
            </p>
          )}
          {!p.terkunci && (
            <div className="mt-auto flex flex-col gap-2">
              <button type="submit" className="rounded-[16px] bg-grey-300 px-5 py-[10px] text-base leading-[1.2] text-lime-300">
                Simpan konfigurasi
              </button>
              <button type="button" onClick={kunci} className="rounded-[16px] bg-red-300 px-5 py-[10px] text-base leading-[1.2] text-white">
                Kunci Periode (Freeze Data)
              </button>
            </div>
          )}
        </form>

        <section className="flex flex-col gap-3 rounded-[20px] bg-grey-500 px-2 pt-[25px] pb-2">
          <h2 className="px-3 text-[25px] leading-[1.2] font-bold text-lime-300">Skor IPS Tahun Sebelumnya</h2>
          <div className="max-h-[364px] flex-1 overflow-y-auto rounded-[16px] bg-white px-2 py-5">
            <table className="w-full text-center text-base leading-[1.2] text-black">
              <thead>
                <tr className="border-b border-grey-100 font-bold">
                  <th className="pb-3">Periode</th>
                  <th className="pb-3">Target Skor</th>
                  <th className="pb-3">Actual Skor</th>
                  <th className="pb-3">Selisih</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {lainnya.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-grey-100">
                      Belum ada periode yang dikunci.
                    </td>
                  </tr>
                )}
                {lainnya.map((item) => (
                  <tr key={item.id} className="border-b border-grey-100/50 last:border-0">
                    <td className="py-4">
                      {item.tahun1} - {item.tahun2}
                    </td>
                    <td className="py-4">{item.target.toFixed(2)}</td>
                    <td className="py-4">{item.actual.toFixed(2)}</td>
                    <td className="py-4">{(item.actual - item.target).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-[20px] bg-grey-500 px-2 pt-[25px] pb-2">
        <div className="flex flex-col gap-[7px] px-3 leading-[1.2] text-lime-300">
          <h2 className="text-[25px] font-bold">Riwayat Snapshot Skor IPS</h2>
          <p className="text-base">Log kalkulasi indeks resmi yang terekam setiap kali terjadi verifikasi bukti dan penetapan capaian indikator oleh Walidata.</p>
        </div>
        <div className="overflow-x-auto rounded-[16px] bg-white px-2 py-5">
          <table className="w-full min-w-[640px] text-center text-base leading-[1.2] text-black">
            <thead>
              <tr className="border-b border-grey-100 font-bold">
                <th className="pb-3">Waktu Kalkulasi</th>
                <th className="pb-3">Nilai Skor IPS</th>
                <th className="pb-3">Predikat Skor</th>
                <th className="pb-3">Riwayat Perubahan</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {riwayat.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-grey-100">
                    Belum ada snapshot. Snapshot terekam saat verifikator memverifikasi indikator.
                  </td>
                </tr>
              )}
              {riwayat.map((s) => (
                <tr key={s.id} className="border-b border-grey-100/50 last:border-0">
                  <td className="py-3 whitespace-pre">{formatWaktu(s.waktu)}</td>
                  <td className="py-3">{s.nilai.toFixed(2)}</td>
                  <td className="py-3">
                    <Badge tone={PREDIKAT_TONE[predikat(s.nilai)]} className="w-[149px] text-base">
                      {predikat(s.nilai)}
                    </Badge>
                  </td>
                  <td className="py-3">{s.perubahan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {dialogKonfirmasi}
    </div>
  )
}

export default KonfigurasiPeriode
