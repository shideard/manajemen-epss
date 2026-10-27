import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useBerkas, useBukti, useKegiatan, usePeriode, useSkor } from '../lib/store'
import { ROLES } from '../config/menu'
import { agendaTerdekat, DOMAINS, formatTanggal, hitungIps, INDIKATOR, levelLabel, LEVELS, predikat, PREDIKAT_BATAS, PREDIKAT_TONE, selisihHari, statusKegiatan, toISODate } from '../lib/epss'
import { ArrowLink, Badge, CountUp, Dropdown, Memuat, PageHeader } from '../components/ui'
import { buttonClass } from '../components/classes'
import arrowDark from '../assets/icons/arrow-long-dark.svg'
import arrowBlack from '../assets/icons/arrow-long-black.svg'
import addIcon from '../assets/rencana/add-circle-fill.svg'
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

// footer = baris tambahan di bawah angka (progress bar, tanggal)
function StatCard({ to, title, subtitle, value, unit, highlight, footer }) {
  return (
    <Link
      to={to}
      className={`group flex min-h-[130px] flex-col justify-between gap-4 rounded-lg px-7 py-5 transition duration-300 ease-out-quint hover:-translate-y-1 hover:shadow-md ${highlight ? 'bg-lime-200' : 'bg-white'}`}
    >
      <span>
        <span className="block text-h3 text-grey-500">{title}</span>
        <span className="block text-small text-grey-200">{subtitle}</span>
      </span>
      <span className="flex flex-col gap-3">
        <span className="flex items-end justify-between">
          <span className="flex items-baseline gap-2">
            {value}
            <span className="text-body text-grey-500">{unit}</span>
          </span>
          <img src={highlight ? arrowBlack : arrowDark} alt="" width={29} height={15} className="mb-3 transition-transform duration-300 ease-out-quint group-hover:translate-x-1" />
        </span>
        {footer}
      </span>
    </Link>
  )
}

// Posisi nilai IPS (skala 1–5) di sepanjang garis skala, dalam persen
const skala = (v) => `${Math.min(100, Math.max(0, ((v - 1) / 4) * 100))}%`
// Rentang tiap predikat [bawah, atas, nama], dari Kurang sampai Memuaskan
const RENTANG = PREDIKAT_BATAS.map(([bawah, nama], i) => [bawah, i === 0 ? 5 : PREDIKAT_BATAS[i - 1][0], nama]).reverse()

// Selisih di kartu IPS: hijau kalau naik/di atas, merah kalau turun/di bawah
function Selisih({ label, value, keterangan }) {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-white px-4 py-3">
      <p className="text-small text-grey-200">{label}</p>
      <p className={`text-h2 ${value == null ? 'text-grey-200' : value >= 0 ? 'text-green-500' : 'text-red-400'}`}>
        <CountUp value={value} format={bertanda} />
      </p>
      {keterangan && <p className="text-caption text-grey-200">{keterangan}</p>}
    </div>
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
  const hasilSimulasi = hitungIps(INDIKATOR, levelSimulasi)

  function ubahSimulasi(index, perubahan) {
    setSimulasi((rows) => rows.map((row, i) => (i === index ? { ...row, ...perubahan } : row)))
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader title={`Selamat datang, ${user.name}!`} subtitle={`Pantau capaian ${aktif.nama}.`} />
      <hr className="border-grey-75" />

      <section className="@container flex flex-col gap-6">
        {/* Kartu utama gelap: skor besar di kiri, posisinya di skala predikat + selisih di kanan.
            Disusun berdasarkan lebar area konten (container query), jadi aman saat sidebar ringkas/lebar */}
        <div className="rounded-lg bg-grey-500 px-8 py-7 text-white">
          <div className="flex flex-col gap-8 @min-[820px]:flex-row @min-[820px]:items-center @min-[820px]:gap-12">
            <div className="flex shrink-0 flex-col gap-2">
              <h2 className="text-h3">Indeks Pembangunan Statistik (IPS) Bayangan</h2>
              <p className="max-w-[360px] text-small font-light text-grey-75">
                Skor dihitung otomatis berdasarkan {INDIKATOR.length} indikator dan bobot resmi Peraturan BPS No 3/2022.
              </p>
              <div className="mt-3 flex items-center gap-5">
                <p className="text-display-1 font-bold text-lime-300">
                  <CountUp value={ips} format={angka} />
                </p>
                <Badge tone={PREDIKAT_TONE[predikat(ips)]} className="font-medium">
                  {predikat(ips)}
                </Badge>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-6">
              {/* Skala 1–5: isian lime = IPS Bayangan, pin putih = target, garis pemisah = batas predikat */}
              <div role="img" aria-label={`IPS Bayangan ${angka(ips)} dari skala 1 sampai 5, target ${angka(aktif.target)}`}>
                <div className="relative pt-9">
                  <span className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1" style={{ left: skala(aktif.target) }}>
                    <span className="rounded-sm bg-white px-2 py-0.5 text-caption font-semibold whitespace-nowrap text-grey-500">Target {angka(aktif.target)}</span>
                    <span className="h-3 w-0.5 bg-white" />
                  </span>
                  <div className="relative h-3 overflow-hidden rounded-full bg-grey-200">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-lime-300 transition-[width] duration-700 ease-out-quint motion-safe:animate-reveal-x"
                      style={{ width: skala(ips) }}
                    />
                    {RENTANG.slice(1).map(([bawah]) => (
                      <span key={bawah} className="absolute inset-y-0 w-0.5 bg-grey-500" style={{ left: skala(bawah) }} />
                    ))}
                  </div>
                </div>
                <div className="relative mt-2 h-3">
                  {RENTANG.map(([bawah, atas, nama]) => (
                    <span
                      key={nama}
                      className={`absolute -translate-x-1/2 text-caption whitespace-nowrap ${nama === predikat(ips) ? 'font-semibold text-lime-300' : 'text-grey-75'}`}
                      style={{ left: skala((bawah + atas) / 2) }}
                    >
                      {nama}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Selisih label="Kesenjangan ke target" value={ips - aktif.target} keterangan={`Target ${angka(aktif.target)}`} />
                <Selisih
                  label="Dibanding periode lalu"
                  value={sebelumnya ? ips - sebelumnya.actual : null}
                  keterangan={sebelumnya ? `IPS ${sebelumnya.tahun1}–${sebelumnya.tahun2}: ${angka(sebelumnya.actual)}` : 'Belum ada periode sebelumnya'}
                />
              </div>
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
            footer={
              <span className="flex items-center gap-3">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                  <span
                    className="block h-full rounded-full bg-grey-500 transition-[width] duration-700 ease-out-quint motion-safe:animate-reveal-x"
                    style={{ width: `${(terverifikasi / INDIKATOR.length) * 100}%` }}
                  />
                </span>
                <span className="text-small font-semibold text-grey-500">{Math.round((terverifikasi / INDIKATOR.length) * 100)}%</span>
              </span>
            }
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
            subtitle="Sisa waktu sampai batas unggah bukti dukung."
            value={<span className="text-display-2 font-semibold text-grey-500">
                <CountUp value={sisaHari} format={bulat} />
              </span>}
            unit="hari"
            // Warna tanggal mengikuti urgensi: merah ≤ 30 hari (atau lewat), kuning ≤ 90 hari
            footer={
              <Badge tone={sisaHari <= 30 ? 'red' : sisaHari <= 90 ? 'yellow' : 'green'} className="self-start text-small">
                {aktif.batas < today ? 'Batas lewat' : 'Batas'}: {formatTanggal(aktif.batas)}
              </Badge>
            }
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
          <div className="flex flex-1 flex-col gap-5 rounded-lg bg-white p-6">
            {/* Hasil di atas, jadi langsung terlihat setiap kali level diubah */}
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-md bg-grey-500 px-5 py-4 text-white">
              <p className="flex flex-col gap-1">
                <span className="text-small text-grey-75">Skor saat ini</span>
                <span className="text-h2">{angka(ips)}</span>
              </p>
              <span aria-hidden className="pb-1 text-h2 text-grey-75">
                →
              </span>
              <p className="flex flex-col gap-1">
                <span className="text-small text-grey-75">Hasil simulasi</span>
                <span className="flex items-baseline gap-2">
                  <span className="text-display-3 font-bold text-lime-300">
                    <CountUp value={hasilSimulasi} format={angka} />
                  </span>
                  {hasilSimulasi > ips && <span className="text-body font-semibold text-green-200">{bertanda(hasilSimulasi - ips)}</span>}
                </span>
              </p>
              <p className="ml-auto flex flex-col items-end gap-2">
                <Badge tone={PREDIKAT_TONE[predikat(hasilSimulasi)]} className="text-small font-medium">
                  {predikat(hasilSimulasi)}
                </Badge>
                <span className="text-small text-grey-75">
                  {hasilSimulasi >= aktif.target ? 'Target tercapai' : `Kurang ${angka(aktif.target - hasilSimulasi)} ke target ${angka(aktif.target)}`}
                </span>
              </p>
            </div>

            <p className="text-small text-grey-200">Pilih indikator lalu tentukan level tujuannya untuk melihat dampaknya pada skor IPS.</p>

            <ul className="flex flex-col gap-3">
              {simulasi.map((row, index) => {
                const levelSaatIni = levels[row.indikatorId] ?? 1
                const dampak = row.indikatorId ? hitungIps(INDIKATOR, { ...levels, [row.indikatorId]: row.level }) - ips : 0
                // Indikator yang sudah dipakai baris lain tidak muncul lagi
                const dipakai = new Set(simulasi.filter((_, i) => i !== index).map((r) => r.indikatorId))
                return (
                  <li key={index} className="flex flex-col gap-3 rounded-md border border-grey-75/50 p-4">
                    <div className="flex items-center gap-3">
                      <Dropdown
                        label="Indikator simulasi"
                        value={row.indikatorId}
                        // Langsung naik satu level dari level saat ini, jadi dampaknya langsung terlihat
                        onChange={(id) => ubahSimulasi(index, { indikatorId: id, level: id ? Math.min((levels[id] ?? 1) + 1, 5) : 1 })}
                        options={[
                          { value: '', label: 'Pilih indikator' },
                          ...INDIKATOR.filter((i) => !dipakai.has(i.id)).map((i) => ({ value: i.id, label: `Indikator ${i.nomor} – ${i.nama}` })),
                        ]}
                        className="min-w-0 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setSimulasi((rows) => rows.filter((_, i) => i !== index))}
                        aria-label="Hapus simulasi"
                        className="grid size-9 shrink-0 place-items-center rounded-sm hover:bg-grey2-100"
                      >
                        <img src={closeCircle} alt="" width={20} height={20} className="grayscale" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Level di bawah level saat ini dinonaktifkan: simulasinya untuk peningkatan */}
                      <div role="group" aria-label="Level tujuan" className="flex flex-1 gap-1 rounded-md bg-grey2-75 p-1">
                        {LEVELS.map((nama, i) => {
                          const level = i + 1
                          const dipilih = row.indikatorId && row.level === level
                          return (
                            <button
                              key={nama}
                              type="button"
                              onClick={() => ubahSimulasi(index, { level })}
                              disabled={!row.indikatorId || level < levelSaatIni}
                              aria-pressed={!!dipilih}
                              title={`Level ${level} (${nama})`}
                              className={`h-9 flex-1 rounded-sm text-small font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                dipilih ? 'bg-grey-500 text-lime-300' : 'text-grey-500 enabled:hover:bg-white'
                              }`}
                            >
                              L{level}
                            </button>
                          )
                        })}
                      </div>
                      <span className={`w-14 text-right text-body font-semibold ${dampak > 0 ? 'text-green-500' : 'text-grey-75'}`}>{bertanda(dampak)}</span>
                    </div>
                    {row.indikatorId && (
                      <p className="text-caption text-grey-200">
                        Saat ini {levelLabel(levelSaatIni)} → tujuan {levelLabel(row.level)}
                      </p>
                    )}
                  </li>
                )
              })}
              {simulasi.length === 0 && <li className="py-4 text-center text-small text-grey-200">Belum ada indikator yang disimulasikan.</li>}
            </ul>

            <div className="mt-auto flex flex-wrap justify-end gap-3">
              {simulasi.some((r) => r.indikatorId) && (
                <button type="button" onClick={() => setSimulasi([{ indikatorId: '', level: 1 }])} className={buttonClass('outline')}>
                  Reset
                </button>
              )}
              <button type="button" onClick={() => setSimulasi((rows) => [...rows, { indikatorId: '', level: 1 }])} className={buttonClass()}>
                <img src={addIcon} alt="" width={19} height={19} />
                Tambah indikator
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
