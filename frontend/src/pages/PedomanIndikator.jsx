import { useState } from 'react'
import { useStore } from '../lib/store'
import { bobotDomain, DOMAINS, EMPTY_OBJECT, hitungIps, includesText, INDIKATOR, jumlahBukti, KEYS, levelLabel } from '../lib/epss'
import { DomainPanel, SearchBox } from '../components/ui'
import PedomanModal from '../components/PedomanModal'
import bookIcon from '../assets/icons/book-mark-fill-sm.svg'

function PedomanIndikator() {
  const [levels] = useStore(KEYS.levelIndikator, EMPTY_OBJECT)
  const [bukti] = useStore(KEYS.bukti, EMPTY_OBJECT)
  const [berkas] = useStore(KEYS.berkas, EMPTY_OBJECT)
  const [query, setQuery] = useState('')
  const [dibuka, setDibuka] = useState(null)

  return (
    <div className="flex w-full flex-col gap-11">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-[7px] leading-[1.2] text-grey-500">
          <h1 className="text-[25px] font-semibold">Daftar Indikator dan Pedoman Bukti Dukung EPSS</h1>
          <p className="text-base">Struktur indikator beserta pedoman dan syarat pemenuhannya.</p>
        </div>
        <SearchBox value={query} onChange={setQuery} placeholder="Cari indikator..." />
      </div>

      {DOMAINS.map((domain, d) => {
        const indikator = INDIKATOR.filter((i) => i.domain === domain && includesText([i.nama, `indikator ${i.nomor}`], query))
        if (indikator.length === 0) return null
        return (
          <DomainPanel
            key={domain.id}
            title={
              <>
                Domain {d + 1} - {domain.nama}
                <span className="flex h-[25px] items-center rounded-[20px] border border-grey-400 bg-lime-75 px-3 text-[13px] font-normal text-grey-500">
                  Bobot domain: {bobotDomain(domain)}%
                </span>
              </>
            }
            aside={<p className="text-base font-medium text-lime-300">Skor: {hitungIps(domain.indikator, levels).toFixed(2)}</p>}
          >
            <ul className="rounded-[20px] bg-white py-4">
              {indikator.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-grey-75/60 px-[27px] py-4 last:border-0">
                  <div className="flex flex-col gap-2 leading-[1.2] text-grey-500">
                    <p className="flex flex-wrap items-center gap-x-[33px] gap-y-2">
                      <span className="text-base font-semibold">
                        Indikator {i.nomor}: {i.nama}
                      </span>
                      <span className="flex h-[25px] items-center rounded-[20px] border border-grey-500 bg-green-50 px-3 text-[13px]">Bobot: {i.bobot}%</span>
                    </p>
                    <p className="flex flex-wrap gap-x-[17px] text-base font-light">
                      <span>Level Terverifikasi: {levelLabel(levels[i.id])}</span>
                      <span aria-hidden className="text-[#cacaca]">
                        |
                      </span>
                      <span>Tersedia: {jumlahBukti(bukti, berkas, i.id)} Bukti dukung</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDibuka(i)}
                    className="flex h-[25px] items-center gap-[10px] rounded-[10px] bg-lime-300 px-5 text-base leading-[1.2] font-medium text-grey-400"
                  >
                    <img src={bookIcon} alt="" width={15} height={15} />
                    Pedoman &amp; Syarat
                  </button>
                </li>
              ))}
            </ul>
          </DomainPanel>
        )
      })}

      {dibuka && <PedomanModal indikator={dibuka} level={levels[dibuka.id] ?? 1} onClose={() => setDibuka(null)} />}
    </div>
  )
}

export default PedomanIndikator
