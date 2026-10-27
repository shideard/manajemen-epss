import { useState } from 'react'
import { useBerkas, useBukti, useSkor } from '../lib/store'
import { bobotDomain, DOMAINS, hitungIps, includesText, INDIKATOR, jumlahBukti, levelLabel } from '../lib/epss'
import { DomainPanel, Memuat, PageHeader, SearchBox } from '../components/ui'
import { buttonClass } from '../components/classes'
import PedomanModal from '../components/PedomanModal'
import bookIcon from '../assets/icons/book-mark-fill-sm.svg'

function PedomanIndikator() {
  const muat = [useSkor(), useBukti(), useBerkas()]
  const [{ levels }, { bukti }, { berkas }] = muat
  const [query, setQuery] = useState('')
  const [dibuka, setDibuka] = useState(null)

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader title="Daftar Indikator dan Pedoman Bukti Dukung EPSS" subtitle="Struktur indikator beserta pedoman dan syarat pemenuhannya.">
        <SearchBox value={query} onChange={setQuery} placeholder="Cari indikator..." />
      </PageHeader>

      {DOMAINS.map((domain, d) => {
        const indikator = INDIKATOR.filter((i) => i.domain === domain && includesText([i.nama, `indikator ${i.nomor}`], query))
        if (indikator.length === 0) return null
        return (
          <DomainPanel
            key={domain.id}
            title={
              <>
                Domain {d + 1} - {domain.nama}
                <span className="flex h-6 items-center rounded-full border border-grey-500 bg-lime-75 px-3 text-small font-normal text-grey-500">
                  Bobot domain: {bobotDomain(domain)}%
                </span>
              </>
            }
            aside={<p className="text-body font-medium text-lime-300">Skor: {hitungIps(domain.indikator, levels).toFixed(2)}</p>}
          >
            <ul className="rounded-lg bg-white py-4">
              {indikator.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-grey-75/50 px-7 py-4 last:border-0">
                  <div className="flex flex-col gap-2">
                    <p className="flex flex-wrap items-center gap-x-8 gap-y-2">
                      <span className="font-semibold">
                        Indikator {i.nomor}: {i.nama}
                      </span>
                      <span className="flex h-6 items-center rounded-full border border-grey-500 bg-green-50 px-3 text-small">Bobot: {i.bobot}%</span>
                    </p>
                    <p className="flex flex-wrap gap-x-4 font-light text-grey-200">
                      <span>Level Terverifikasi: {levelLabel(levels[i.id])}</span>
                      <span aria-hidden className="text-grey-75">
                        |
                      </span>
                      <span>Tersedia: {jumlahBukti(bukti, berkas, i.id)} Bukti dukung</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDibuka(i)}
                    className={buttonClass('secondary', 'sm')}
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
