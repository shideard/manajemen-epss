import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useBerkas, useBukti, useKegiatan, usePeriode, useSkor } from '../lib/store'
import { ROLES } from '../config/menu'
import { agendaTerdekat, DOMAINS, formatTanggal, hitungIps, INDIKATOR, indikatorById, predikat, PREDIKAT_TONE, selisihHari, statusKegiatan, toISODate } from '../lib/epss'
import { ArrowLink, Badge, CountUp, Memuat, PageHeader } from '../components/ui'
import { buttonClass } from '../components/classes'
import arrowDark from '../assets/icons/arrow-long-dark.svg'
import arrowBlack from '../assets/icons/arrow-long-black.svg'
import addIcon from '../assets/rencana/add-circle-fill.svg'
import triangle from '../assets/icons/polygon-small.svg'
import closeCircle from '../assets/icons/close-circle-line.svg'
import timeIcon from '../assets/icons/time-line.svg'
import uploadIcon from '../assets/icons/file-upload-line.svg'
import checkCircle from '../assets/icons/checkbox-circle-line.svg'

const GRADIENT = 'bg-linear-to-b from-green-500 to-grey-500 bg-clip-text font-bold text-transparent'

const STATUS_KEGIATAN = {
  'Belum dilaksanakan': { tone: 'red', icon: closeCircle },
  'Sedang dilaksanakan': { tone: 'yellow', icon: timeIcon },
  'Bukti dukung diunggah': { tone: 'blue', icon: uploadIcon },
  Terverifikasi: { tone: 'green', icon: checkCircle },
}

const angka = (n) => (n == null ? '-' : n.toFixed(2))
const bertanda = (n) => (n > 0 ? `+${angka(n)}` : angka(n))
const bulat = (n) => String(Math.round(n))

function StatCard({ to, title, subtitle, value, unit, highlight }) {
  return (
    <Link
      to={to}
      className={`group flex min-h-[130px] flex-col justify-between gap-2 rounded-lg px-7 py-4 transition duration-300 ease-out-quint hover:-translate-y-1 hover:shadow-md ${highlight ? 'bg-lime-200' : 'bg-white'}`}
    >
      <span>
        <span className="block text-h3 text-grey-500">{title}</span>
        <span className="block text-small text-grey-200">{subtitle}</span>
      </span>
      <span className="flex items-end justify-between">
        <span className="flex items-baseline gap-2">
          {value}
          <span className="text-body text-grey-500">{unit}</span>
        </span>
        <img src={highlight ? arrowBlack : arrowDark} alt="" width={29} height={15} className="mb-3 transition-transform duration-300 ease-out-quint group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

function Dashboard() {
  const { user } = useOutletContext()
  const verifikator = user.role === ROLES.VERIFIKATOR
  const { periode, aktif } = usePeriode()
  const muat = [useSkor(), useBukti(), useBerkas(), useKegiatan()]
  const [{ levels }, { bukti }, { berkas }, { kegiatan }] = muat
  const [simulasi, setSimulasi] = useState([{ indikatorId: '', level: 1 }])
  const today = toISODate(new Date())

  const ips = hitungIps(INDIKATOR, levels)
  const sebelumnya = periode.filter((p) => p.actual != null && p.tahun2 < aktif.tahun1).sort((a, b) => b.tahun2.localeCompare(a.tahun2))[0]
  const terverifikasi = INDIKATOR.filter((i) => levels[i.id]).length
  const daftarBukti = Object.values(bukti)
  const ajuan = new Set(daftarBukti.filter((b) => b.status === 'menunggu').map((b) => b.indikatorId)).size
  const sisaHari = Math.max(0, selisihHari(today, aktif.batas))
  const buktiLink = verifikator ? '/verifikasi-bukti-dukung' : '/repositori-bukti-dukung'

  const levelSimulasi = { ...levels }
  for (const s of simulasi) if (s.indikatorId) levelSimulasi[s.indikatorId] = s.level

  function ubahSimulasi(index, perubahan) {
    setSimulasi((rows) => rows.map((row, i) => (i === index ? { ...row, ...perubahan } : row)))
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader title={`Selamat datang, ${user.name}!`} subtitle={`Pantau capaian ${aktif.nama}.`} />
      <hr className="border-grey-75" />

      <section className="flex flex-col gap-6">
        <div className="grid gap-5.5 2xl:grid-cols-2">
          <div className="relative flex min-h-[170px] flex-col justify-between rounded-lg bg-lime-200 px-6 py-4.5">
            <div className="flex flex-col gap-1">
              <h2 className="text-h3 text-grey-500">Indeks Pembangunan Statistik (IPS) Bayangan</h2>
              <p className="max-w-[420px] text-small font-light text-grey-500">
                Skor dihitung otomatis berdasarkan {INDIKATOR.length} indikator dan bobot resmi Peraturan BPS No 3/2022.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <p className={`text-display-1 ${GRADIENT}`}>
                <CountUp value={ips} format={angka} />
              </p>
              <Badge tone={PREDIKAT_TONE[predikat(ips)]} className="font-medium">
                {predikat(ips)}
              </Badge>
            </div>
          </div>

          <div className="grid min-h-[170px] grid-cols-3 gap-4 rounded-lg bg-white px-9 py-6.5">
            <div className="flex flex-col justify-between">
              <h2 className="text-h3 text-grey-500">Target IPS</h2>
              <p className={`text-display-1 ${GRADIENT}`}>
                <CountUp value={aktif.target} format={angka} />
              </p>
            </div>
            <div className="flex flex-col justify-between">
              <p className="text-small">Kesenjangan IPS Bayangan terhadap target</p>
              <p className={`text-display-3 ${GRADIENT}`}>
                <CountUp value={ips - aktif.target} format={bertanda} />
              </p>
            </div>
            <div className="flex flex-col justify-between">
              <p className="text-small">IPS Periode Sebelumnya</p>
              <p className="flex items-baseline gap-1 whitespace-nowrap">
                <span className={`text-display-3 ${GRADIENT}`}>
                  <CountUp value={sebelumnya?.actual} format={angka} />
                </span>
                {sebelumnya && <span className={`text-lead font-medium ${ips >= sebelumnya.actual ? 'text-green-500' : 'text-red-400'}`}>{bertanda(ips - sebelumnya.actual)}</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5.5 md:grid-cols-3">
          <StatCard
            to={buktiLink}
            highlight
            title="Kelengkapan Bukti Dukung"
            subtitle="Indikator yang telah terpenuhi dan terverifikasi."
            value={
              <>
                <span className={`text-display-2 ${GRADIENT}`}>
                  <CountUp value={terverifikasi} format={bulat} />
                </span>
                <span className="text-display-3 font-light text-grey-500">/ {INDIKATOR.length}</span>
              </>
            }
            unit="indikator"
          />
          <StatCard
            to={buktiLink}
            title="Ajuan Verifikasi Indikator"
            subtitle={verifikator ? 'Indikator yang perlu Anda cek dan verifikasi.' : 'Indikator yang masih menunggu verifikasi.'}
            value={<span className="text-display-2 font-semibold text-grey-500">
                <CountUp value={ajuan} format={bulat} />
              </span>}
            unit="indikator"
          />
          <StatCard
            to="/rencana-kegiatan"
            title="Sisa Waktu Periode"
            subtitle={`Batas unggah bukti: ${formatTanggal(aktif.batas)}.`}
            value={<span className="text-display-2 font-semibold text-grey-500">
                <CountUp value={sisaHari} format={bulat} />
              </span>}
            unit="hari"
          />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <PageHeader as="h2" title="Kegiatan Terdekat">
          <ArrowLink to="/rencana-kegiatan">Lihat Kegiatan</ArrowLink>
        </PageHeader>
        <div className="overflow-x-auto rounded-lg bg-grey-500 p-2">
          <table className="w-full min-w-[760px] text-left text-body">
            <thead className="text-lime-300">
              <tr>
                <th className="px-5 py-4 font-medium">Nama Kegiatan</th>
                <th className="w-[220px] px-5 py-4 font-medium">Jadwal Kegiatan</th>
                <th className="w-[220px] px-5 py-4 font-medium whitespace-nowrap">Kelengkapan Bukti</th>
                <th className="w-[269px] px-5 py-4 text-center font-medium">Status</th>
              </tr>
            </thead>
            {/* Baris putih membulat seperti kartu di desain */}
            <tbody className="bg-white text-grey-500 [&>tr:first-child>td:first-child]:rounded-tl-md [&>tr:first-child>td:last-child]:rounded-tr-md [&>tr:last-child>td:first-child]:rounded-bl-md [&>tr:last-child>td:last-child]:rounded-br-md">
              {agendaTerdekat(kegiatan, today).map((k) => {
                const status = statusKegiatan(
                  k,
                  daftarBukti.filter((b) => b.kegiatanId === k.id),
                  berkas[k.id]?.length ?? 0,
                  today,
                )
                return (
                  <tr key={k.id} className="border-b border-grey-75 last:border-0">
                    <td className="px-5 py-4">{k.nama}</td>
                    <td className="px-5 py-4">{formatTanggal(k.mulai)}</td>
                    <td className="px-5 py-4">{berkas[k.id]?.length ?? 0} berkas diunggah</td>
                    <td className="px-5 py-3">
                      <Badge {...STATUS_KEGIATAN[status]} className="w-full text-small">
                        {status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
              {kegiatan.length === 0 && (
                <tr>
                  <td colSpan={4} className="rounded-md px-5 py-10 text-center text-grey-200">
                    Belum ada rencana kegiatan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section className="flex flex-col gap-6">
          <PageHeader as="h2" title="Capaian Skor 5 Domain EPSS">
            <ArrowLink to="/pedoman-indikator">Lihat Pedoman</ArrowLink>
          </PageHeader>
          <div className="flex flex-col gap-4">
            {DOMAINS.map((domain, i) => {
              const skor = hitungIps(domain.indikator, levels)
              return (
                <div key={domain.id} className="flex flex-col gap-2.5">
                  <p className="text-body font-medium text-grey-500">
                    Domain {i + 1}: {domain.nama}
                  </p>
                  <div
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-valuenow={skor}
                    aria-label={`Skor domain ${i + 1}`}
                    className="flex h-[47px] items-center gap-4 rounded-lg bg-grey-300 pr-4.5 pl-3"
                  >
                    {/* overflow-hidden + translate: bar meluncur dari kiri tanpa repaint (hanya compositor) */}
                    <span className="flex-1 overflow-hidden rounded-md">
                      <span
                        className="block h-6 rounded-md bg-lime-300 transition-[width] duration-700 ease-out-quint motion-safe:animate-reveal-x"
                        style={{ width: `${(skor / 5) * 100}%`, animationDelay: `${400 + i * 90}ms` }}
                      />
                    </span>
                    <span className="text-body font-medium text-lime-300">{angka(skor)}/5.00</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <PageHeader as="h2" title="Simulasi Perubahan Level & Gap Analysis" />
          <div className="flex flex-1 flex-col gap-8 rounded-lg bg-white px-6 py-8">
            <p className="font-light">
              Geser simulasi untuk melihat estimasi kenaikan skor IPS jika indikator ditingkatkan levelnya.
            </p>
            {simulasi.map((row, index) => (
              <div key={index} className="flex flex-col justify-between gap-3">
                <span className="relative w-[186px]">
                  <select
                    value={row.indikatorId}
                    onChange={(e) => ubahSimulasi(index, { indikatorId: e.target.value, level: levels[e.target.value] ?? 1 })}
                    aria-label="Pilih indikator simulasi"
                    className="h-[25px] w-full appearance-none rounded-lg bg-lime-300 pr-8 pl-3 text-small text-grey-500"
                  >
                    <option value="">Pilih Indikator</option>
                    {INDIKATOR.map((i) => (
                      <option key={i.id} value={i.id}>
                        Indikator {i.nomor}
                      </option>
                    ))}
                  </select>
                  <img src={triangle} alt="" width={10} height={6} className="pointer-events-none absolute top-1/2 right-[10px] -translate-y-1/2 -scale-y-100" />
                  {simulasi.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSimulasi((rows) => rows.filter((_, i) => i !== index))}
                      aria-label="Hapus simulasi"
                      className="absolute top-1/2 -right-7 -translate-y-1/2"
                    >
                      <img src={closeCircle} alt="" width={18} height={18} className="grayscale" />
                    </button>
                  )}
                </span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={row.level}
                  disabled={!row.indikatorId}
                  onChange={(e) => ubahSimulasi(index, { level: Number(e.target.value) })}
                  aria-label={row.indikatorId ? `Level simulasi ${indikatorById[row.indikatorId].nama}` : 'Level simulasi'}
                  className="w-full cursor-pointer accent-grey-500 disabled:cursor-not-allowed"
                />
                {row.indikatorId && <p className="text-small text-grey-200">Level {row.level} — {indikatorById[row.indikatorId].nama}</p>}
              </div>
            ))}
            <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
              <button
                type="button"
                onClick={() => setSimulasi((rows) => [...rows, { indikatorId: '', level: 1 }])}
                className={buttonClass()}
              >
                <img src={addIcon} alt="" width={19} height={19} />
                Tambah simulasi indikator
              </button>
              <p className="flex flex-col items-end gap-1">
                <span className="text-body font-medium text-grey-500">Skor Hasil Simulasi</span>
                <span className={`text-display-2 ${GRADIENT}`}>
                  <CountUp value={hitungIps(INDIKATOR, levelSimulasi)} format={angka} />
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
