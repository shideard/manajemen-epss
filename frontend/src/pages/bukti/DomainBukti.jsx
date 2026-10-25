import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBerkas, useBukti, useKegiatan, useSkor } from '../../lib/store'
import { DOMAINS, includesText, INDIKATOR, jumlahBukti, levelLabel } from '../../lib/epss'
import { Badge, Collapse, DomainPanel, Memuat, StatusBukti } from '../../components/ui'
import { buttonClass } from '../../components/classes'
import arrowLime from '../../assets/icons/arrow-down-s-line-lime.svg'
import arrowDark from '../../assets/icons/arrow-down-s-line-dark.svg'
import arrowLong from '../../assets/icons/arrow-long-lime.svg'

// Panah ke bawah = tertutup, ke atas = terbuka (seperti di desain)
function Toggle({ open, onClick, label, icon, className = '' }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={open} aria-label={label} className={`shrink-0 rounded-xs ${className}`}>
      <img src={icon} alt="" width={24} height={24} className={`transition-transform duration-300 ease-out-quint ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

const toggleSet = (set, id) => {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

// Domain → indikator → kegiatan yang dipetakan beserta status buktinya.
// onVerifikasi ada = tampilan verifikator (tombol Verifikasi Indikator + link ke detail verifikasi)
function DomainBukti({ query = '', onVerifikasi, bolehVerifikasi = false }) {
  const muat = [useKegiatan(), useBukti(), useBerkas(), useSkor()]
  const [{ kegiatan }, { bukti }, { berkas }, { levels }] = muat
  const [domainTerbuka, setDomainTerbuka] = useState(() => new Set([DOMAINS[0].id]))
  const [indikatorTerbuka, setIndikatorTerbuka] = useState(() => new Set())
  const verifikator = Boolean(onVerifikasi)
  const namaKegiatan = Object.fromEntries(kegiatan.map((k) => [k.id, k.nama]))

  return (
    <>
      <Memuat dari={muat} />
      {DOMAINS.map((domain, d) => {
        const indikator = INDIKATOR.filter((i) => i.domain === domain && includesText([i.nama, `indikator ${i.nomor}`], query))
        if (query && indikator.length === 0) return null
        const open = domainTerbuka.has(domain.id) || Boolean(query)
        return (
          <DomainPanel
            key={domain.id}
            title={
              <button
                type="button"
                onClick={() => setDomainTerbuka((s) => toggleSet(s, domain.id))}
                aria-expanded={open}
                className="cursor-pointer text-left"
              >
                Domain {d + 1} - {domain.nama}
              </button>
            }
            aside={
              <p className="flex items-center gap-2.5 font-light text-lime-300">
                Indikator Terverifikasi : {indikator.filter((i) => levels[i.id]).length} Indikator
                <Toggle open={open} onClick={() => setDomainTerbuka((s) => toggleSet(s, domain.id))} label={`Domain ${d + 1}`} icon={arrowLime} className="bg-grey-300" />
              </p>
            }
          >
            <div className="min-h-[25px] rounded-lg bg-white">
              <Collapse open={open}>
                <ul className="py-2">
                  {indikator.map((i) => {
                    const daftar = Object.values(bukti).filter((b) => b.indikatorId === i.id && namaKegiatan[b.kegiatanId])
                    const valid = daftar.filter((b) => b.status === 'terverifikasi')
                    const semuaValid = daftar.length > 0 && valid.length === daftar.length
                    const levelBaru = semuaValid ? Math.min(...valid.map((b) => b.level)) : null
                    const terbuka = indikatorTerbuka.has(i.id)
                    return (
                      <li key={i.id} className="border-b border-grey-75/50 py-4 last:border-0">
                        <div className="flex items-center justify-between gap-4 px-7">
                          <div className="flex flex-col gap-2">
                            <p className="flex flex-wrap items-center gap-x-8 gap-y-2">
                              <span className="font-semibold">
                                Indikator {i.nomor}: {i.nama}
                              </span>
                              <Badge tone={semuaValid ? 'green' : 'blue'} className="text-small">
                                {valid.length} dari {daftar.length} Kegiatan Terverifikasi
                              </Badge>
                            </p>
                            <p className="flex flex-wrap gap-x-4 text-small font-light text-grey-200">
                              <span>Level Terverifikasi: {levelLabel(levels[i.id])}</span>
                              <span aria-hidden className="text-grey-75">
                                |
                              </span>
                              <span>Tersedia : {jumlahBukti(bukti, berkas, i.id)} Bukti dukung</span>
                            </p>
                          </div>
                          <Toggle open={terbuka} onClick={() => setIndikatorTerbuka((s) => toggleSet(s, i.id))} label={`Indikator ${i.nomor}`} icon={arrowDark} />
                        </div>

                        <Collapse open={terbuka}>
                          <div className="flex flex-col items-end gap-5 pt-4">
                            <ul className="flex w-full flex-col gap-1.5">
                              {daftar.length === 0 && <li className="px-7 text-small text-grey-200">Belum ada kegiatan yang dipetakan ke indikator ini.</li>}
                              {daftar.map((b) => (
                                <li key={b.kegiatanId}>
                                  <Link
                                    to={verifikator ? `/verifikasi-bukti-dukung/${b.kegiatanId}/${i.id}` : `/repositori-bukti-dukung/${b.kegiatanId}`}
                                    className={`flex items-center justify-between gap-4 px-7 py-2 text-small font-medium text-grey-200 hover:underline ${verifikator ? 'bg-lime-75' : 'bg-grey2-75'}`}
                                  >
                                    {namaKegiatan[b.kegiatanId]}
                                    <StatusBukti status={b.status} label={verifikator && b.status === 'draft' ? 'Belum diajukan' : undefined} className="text-small" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            {verifikator && (
                              <button
                                type="button"
                                disabled={!bolehVerifikasi || !semuaValid || levels[i.id] === levelBaru}
                                onClick={() => onVerifikasi(i, levelBaru)}
                                className={`mx-4 w-[239px] justify-between! ${buttonClass()}`}
                              >
                                {levels[i.id] && levels[i.id] === levelBaru ? 'Indikator Terverifikasi' : 'Verifikasi Indikator'}
                                <img src={arrowLong} alt="" width={29} height={15} />
                              </button>
                            )}
                          </div>
                        </Collapse>
                      </li>
                    )
                  })}
                </ul>
              </Collapse>
            </div>
          </DomainPanel>
        )
      })}
    </>
  )
}

export default DomainBukti
