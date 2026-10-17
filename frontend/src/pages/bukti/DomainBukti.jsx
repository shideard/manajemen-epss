import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { STORAGE_KEY as KEGIATAN_KEY } from '../rencana-kegiatan/kegiatan'
import { DOMAINS, EMPTY_LIST, EMPTY_OBJECT, includesText, INDIKATOR, jumlahBukti, KEYS, levelLabel } from '../../lib/epss'
import { Collapse, DomainPanel, StatusBukti } from '../../components/ui'
import arrowLime from '../../assets/icons/arrow-down-s-line-lime.svg'
import arrowDark from '../../assets/icons/arrow-down-s-line-dark.svg'
import arrowLong from '../../assets/icons/arrow-long-lime.svg'
import arrowGrey from '../../assets/icons/arrow-long-grey.svg'

// Panah ke bawah = tertutup, ke atas = terbuka (seperti di desain)
function Toggle({ open, onClick, label, icon, className = '' }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={open} aria-label={label} className={`shrink-0 rounded-[5px] ${className}`}>
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
  const [kegiatan] = useStore(KEGIATAN_KEY, EMPTY_LIST)
  const [bukti] = useStore(KEYS.bukti, EMPTY_OBJECT)
  const [berkas] = useStore(KEYS.berkas, EMPTY_OBJECT)
  const [levels] = useStore(KEYS.levelIndikator, EMPTY_OBJECT)
  const [domainTerbuka, setDomainTerbuka] = useState(() => new Set([DOMAINS[0].id]))
  const [indikatorTerbuka, setIndikatorTerbuka] = useState(() => new Set())
  const verifikator = Boolean(onVerifikasi)
  const namaKegiatan = Object.fromEntries(kegiatan.map((k) => [k.id, k.nama]))

  return DOMAINS.map((domain, d) => {
    const indikator = INDIKATOR.filter((i) => i.domain === domain && includesText([i.nama, `indikator ${i.nomor}`], query))
    if (query && indikator.length === 0) return null
    const open = domainTerbuka.has(domain.id) || Boolean(query)
    return (
      <DomainPanel
        key={domain.id}
        title={`Domain ${d + 1} - ${domain.nama}`}
        aside={
          <p className="flex items-center gap-[10px] text-base leading-[1.2] font-medium text-lime-300">
            Indikator Terverifikasi : {indikator.filter((i) => levels[i.id]).length} Indikator
            <Toggle open={open} onClick={() => setDomainTerbuka((s) => toggleSet(s, domain.id))} label={`Domain ${d + 1}`} icon={arrowLime} className="bg-grey-300" />
          </p>
        }
      >
        <div className="min-h-[25px] rounded-[20px] bg-white">
          <Collapse open={open}>
            <ul className="py-2">
              {indikator.map((i) => {
                const daftar = Object.values(bukti).filter((b) => b.indikatorId === i.id && namaKegiatan[b.kegiatanId])
                const valid = daftar.filter((b) => b.status === 'terverifikasi')
                const semuaValid = daftar.length > 0 && valid.length === daftar.length
                const levelBaru = semuaValid ? Math.min(...valid.map((b) => b.level)) : null
                const terbuka = indikatorTerbuka.has(i.id)
                return (
                  <li key={i.id} className="border-b border-grey-75/60 py-4 last:border-0">
                    <div className="flex items-center justify-between gap-4 px-[27px]">
                      <div className="flex flex-col gap-2 leading-[1.2] text-grey-500">
                        <p className="flex flex-wrap items-center gap-x-[33px] gap-y-2">
                          <span className="text-base font-semibold">
                            Indikator {i.nomor}: {i.nama}
                          </span>
                          <span
                            className={`flex h-6 w-[211px] items-center justify-center rounded-[12px] border text-[13px] ${semuaValid ? 'border-green-500 bg-green-100' : 'border-blue-500 bg-blue-50'}`}
                          >
                            {valid.length} dari {daftar.length} Kegiatan Terverifikasi
                          </span>
                        </p>
                        <p className="flex flex-wrap gap-x-[17px] text-[13px] font-light">
                          <span>Level Terverifikasi: {levelLabel(levels[i.id])}</span>
                          <span aria-hidden className="text-[#cacaca]">
                            |
                          </span>
                          <span>Tersedia : {jumlahBukti(bukti, berkas, i.id)} Bukti dukung</span>
                        </p>
                      </div>
                      <Toggle open={terbuka} onClick={() => setIndikatorTerbuka((s) => toggleSet(s, i.id))} label={`Indikator ${i.nomor}`} icon={arrowDark} />
                    </div>

                    <Collapse open={terbuka}>
                      <div className="flex flex-col items-end gap-5 pt-4">
                        <ul className="flex w-full flex-col gap-[6px]">
                          {daftar.length === 0 && <li className="px-[27px] text-[13px] text-grey-100">Belum ada kegiatan yang dipetakan ke indikator ini.</li>}
                          {daftar.map((b) => (
                            <li key={b.kegiatanId}>
                              <Link
                                to={verifikator ? `/verifikasi-bukti-dukung/${b.kegiatanId}/${i.id}` : `/repositori-bukti-dukung/${b.kegiatanId}`}
                                className={`flex items-center justify-between gap-4 px-[27px] py-2 text-[13px] leading-[1.2] font-medium text-grey-200 hover:underline ${verifikator ? 'bg-lime-75' : 'bg-grey2-75'}`}
                              >
                                {namaKegiatan[b.kegiatanId]}
                                <StatusBukti status={b.status} label={verifikator && b.status === 'draft' ? 'Belum diajukan' : undefined} className="text-[13px]" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                        {verifikator && (
                          <button
                            type="button"
                            disabled={!bolehVerifikasi || !semuaValid || levels[i.id] === levelBaru}
                            onClick={() => onVerifikasi(i, levelBaru)}
                            className="group mx-[17px] flex w-[239px] items-center justify-between rounded-[16px] bg-grey-300 px-5 py-[10px] text-base leading-[1.2] text-lime-300 disabled:bg-grey-75 disabled:text-grey-50"
                          >
                            {levels[i.id] && levels[i.id] === levelBaru ? 'Indikator Terverifikasi' : 'Verifikasi Indikator'}
                            <img src={arrowLong} alt="" width={29} height={15} className="group-disabled:hidden" />
                            <img src={arrowGrey} alt="" width={29} height={15} className="hidden group-disabled:block" />
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
  })
}

export default DomainBukti
