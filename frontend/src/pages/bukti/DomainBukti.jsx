import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBukti, usePeriode, useSemuaKegiatan, useSkor } from '../../lib/store'
import { buktiKey, DOMAINS, includesText, INDIKATOR, levelLabel } from '../../lib/epss'
import { Badge, Collapse, DomainPanel, Memuat, StatusBukti } from '../../components/ui'
import arrowLime from '../../assets/icons/arrow-down-s-line-lime.svg'
import arrowDark from '../../assets/icons/arrow-down-s-line-dark.svg'

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
// verifikator = link ke detail verifikasi. Level indikator naik sendiri saat ajuan level berikutnya diverifikasi (lihat levelIndikator)
function DomainBukti({ query = '', filterIndikator = 'semua', verifikator = false }) {
  const { aktif } = usePeriode()
  const muat = [useSemuaKegiatan(aktif?.id), useBukti(), useSkor()]
  const [{ kegiatan }, { bukti }, { levels }] = muat
  const [domainTerbuka, setDomainTerbuka] = useState(() => new Set([DOMAINS[0].id]))
  const [indikatorTerbuka, setIndikatorTerbuka] = useState(() => new Set())
  const namaKegiatan = Object.fromEntries(kegiatan.map((k) => [k.id, k.nama]))
  // Pemetaan dari API; status per pasangan masih dari browser (belum ada record = draft)
  const buktiIndikator = (indikatorId) =>
    kegiatan
      .filter((k) => k.indikatorIds.includes(indikatorId))
      .map((k) => bukti[buktiKey(k.id, indikatorId)] ?? { kegiatanId: k.id, indikatorId, status: 'draft' })
  const levelTarget = (kegiatanId, indikatorId) => kegiatan.find((k) => k.id === kegiatanId)?.levelTarget[indikatorId] ?? 1
  const jumlahBerkas = (indikatorId) => kegiatan.filter((k) => k.indikatorIds.includes(indikatorId)).reduce((n, k) => n + k.jumlahBerkas, 0)

  function cocokFilter(i) {
    if (filterIndikator === 'semua') return true
    if (filterIndikator === 'terverifikasi') return Boolean(levels[i.id])
    const menunggu = buktiIndikator(i.id).some((b) => b.status === 'menunggu')
    if (filterIndikator === 'menunggu') return menunggu
    return !levels[i.id] && !menunggu
  }
  const adaHasil = INDIKATOR.some(cocokFilter)

  return (
    <>
      <Memuat dari={muat} bentuk="daftar" />
      {!adaHasil && <p className="rounded-lg bg-white py-10 text-center text-grey-200">Tidak ada indikator pada kategori ini.</p>}
      {DOMAINS.map((domain, d) => {
        const indikator = INDIKATOR.filter((i) => i.domain === domain && includesText([i.nama, `indikator ${i.nomor}`], query) && cocokFilter(i))
        if ((query || filterIndikator !== 'semua') && indikator.length === 0) return null
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
                    const daftar = buktiIndikator(i.id)
                    const valid = daftar.filter((b) => b.status === 'terverifikasi')
                    const semuaValid = daftar.length > 0 && valid.length === daftar.length
                    const terbuka = indikatorTerbuka.has(i.id)
                    return (
                      <li key={i.id} className="border-b border-grey-75/50 py-4 last:border-0">
                        <div className="flex items-center justify-between gap-4 px-7">
                          <div className="flex flex-col gap-2">
                            <p className="font-semibold">
                              Indikator {i.nomor}: {i.nama}
                            </p>
                            <p className="flex flex-wrap gap-x-4 text-small font-light text-grey-200">
                              <span>Level Terverifikasi: {levelLabel(levels[i.id])}</span>
                              <span aria-hidden className="text-grey-75">
                                |
                              </span>
                              <span>Tersedia : {jumlahBerkas(i.id)} Bukti dukung</span>
                            </p>
                          </div>
                          {/* Badge rata kanan tepat sebelum tombol buka, jadi sejajar di semua indikator */}
                          <div className="flex shrink-0 items-center gap-4">
                            <Badge tone={semuaValid ? 'green' : 'blue'} className="text-small">
                              {valid.length} dari {daftar.length} Kegiatan Terverifikasi
                            </Badge>
                            <Toggle open={terbuka} onClick={() => setIndikatorTerbuka((s) => toggleSet(s, i.id))} label={`Indikator ${i.nomor}`} icon={arrowDark} />
                          </div>
                        </div>

                        <Collapse open={terbuka}>
                          <div className="flex flex-col items-end gap-5 pt-4">
                            <ul className="flex w-full flex-col gap-1.5">
                              {daftar.length === 0 && <li className="px-7 text-small text-grey-200">Belum ada kegiatan yang dipetakan ke indikator ini.</li>}
                              {daftar.map((b) => (
                                <li key={b.kegiatanId}>
                                  <Link
                                    to={verifikator ? `/verifikasi-bukti-dukung/${b.kegiatanId}/${i.id}` : `/repositori-bukti-dukung/${b.kegiatanId}`}
                                    className={`flex items-center justify-between gap-4 px-7 py-2 text-small font-medium text-grey-200 hover:underline transform transition duration-300 ease-out-quint ${b.status === 'terverifikasi' ? 'bg-green-50 text-green-500' : 'bg-grey2-75 text-grey-500 hover:bg-grey2-100'}`}
                                  >
                                    <span>
                                      {namaKegiatan[b.kegiatanId]} <span className="font-light">(Level {levelTarget(b.kegiatanId, i.id)})</span>
                                    </span>
                                    <StatusBukti status={b.status} label={verifikator && b.status === 'draft' ? 'Belum diajukan' : undefined} className="text-small" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
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
