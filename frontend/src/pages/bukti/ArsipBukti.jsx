import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { berkasUrl, useBerkas, useBukti, useKegiatan, usePeriode } from '../../lib/store'
import { arsipBerkas, formatTanggal, formatUkuran, includesText, isPic, paginate } from '../../lib/epss'
import { bolehUbah } from '../../config/menu'
import { Badge, DialogHeader, Dropdown, Memuat, Notice, PageHeader, Pagination, SearchBox } from '../../components/ui'
import { buttonClass } from '../../components/classes'
import folderIcon from '../../assets/sidebar/folder-5-fill.svg'
import fileText from '../../assets/icons/file-text-fill.svg'
import eyeIcon from '../../assets/icons/eye-line.svg'

const PAGE_SIZE = 8
const TAG_TABEL = 3 // sisanya diringkas jadi "+n"; daftar lengkap ada di panel detail

function TagIndikator({ indikator }) {
  return (
    <span title={indikator.nama} className="inline-flex items-center gap-1.5 rounded-sm border border-grey-75 px-2.5 py-0.5 text-small font-medium whitespace-nowrap">
      <span aria-hidden className="size-1.5 rounded-full bg-lime-500" />
      Ind. {indikator.nomor}
    </span>
  )
}

// "Laporan Akhir.pdf" → ["Laporan Akhir", ".pdf"]; ekstensi ditampilkan samar seperti di referensi
const pecahNama = (nama) => {
  const titik = nama.lastIndexOf('.')
  return titik > 0 ? [nama.slice(0, titik), nama.slice(titik)] : [nama, '']
}

function Ikon({ src, besar = false }) {
  return (
    <span className={`grid shrink-0 place-items-center bg-grey-300 ${besar ? 'size-16 rounded-md' : 'size-9 rounded-sm'}`}>
      <img src={src} alt="" width={besar ? 39 : 22} height={besar ? 39 : 22} />
    </span>
  )
}

// Panel detail di kanan tabel (referensi: panel detail berkas ala Google Drive)
function DetailBerkas({ f, user, aktif, kegiatan, onKaitkan, onClose }) {
  const [target, setTarget] = useState('')
  const url = berkasUrl.get(f.id)
  const [, ekstensi] = pecahNama(f.nama)
  // Tautan baru masuk periode berjalan, jadi hanya kegiatan yang user ini PIC-nya dan periodenya belum dikunci
  const boleh = bolehUbah(user, 'unggahBukti', aktif)
  const pilihan = kegiatan.filter((k) => isPic(k, user) && !f.kegiatan.includes(k))

  return (
    <aside className="flex w-[360px] max-w-full flex-col overflow-hidden rounded-lg bg-white">
      <DialogHeader title={<span className="break-all">{f.nama}</span>} onClose={onClose} closeLabel="Tutup detail berkas" />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex h-40 flex-col items-center justify-center gap-4 rounded-md bg-grey2-75">
          <Ikon src={fileText} besar />
          {url ? (
            <a href={url} target="_blank" rel="noreferrer" className={buttonClass('outline', 'sm')}>
              <img src={eyeIcon} alt="" width={15} height={15} />
              Lihat Berkas
            </a>
          ) : (
            <p className="px-6 text-center text-small text-grey-200">Pratinjau hanya tersedia pada sesi saat berkas diunggah.</p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          {[
            ['Tipe', ekstensi ? ekstensi.slice(1).toUpperCase() : '-'],
            ['Ukuran', formatUkuran(f.ukuran)],
            ['Diunggah', formatTanggal(f.tanggal)],
            ['Oleh', f.oleh],
          ].map(([label, nilai]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="font-semibold">{label}</dt>
              <dd className="text-grey-200">{nilai}</dd>
            </div>
          ))}
        </dl>
        <hr className="border-grey-75" />

        <section className="flex flex-col gap-3">
          <h3 className="font-semibold">Mendukung {f.indikator.length} Indikator</h3>
          {f.indikator.length === 0 && <p className="text-small text-grey-200">Kegiatan tertaut belum dipetakan ke indikator.</p>}
          <ul className="flex flex-col gap-2">
            {f.indikator.map((i) => (
              <li key={i.id} className="flex items-start gap-2.5 rounded-sm bg-grey2-75 px-3.5 py-2 text-small">
                <TagIndikator indikator={i} />
                <span>{i.nama}</span>
              </li>
            ))}
          </ul>
        </section>
        <hr className="border-grey-75" />

        <section className="flex flex-col gap-3">
          <h3 className="font-semibold">Tertaut ke {f.kegiatan.length} Bukti Dukung</h3>
          <ul className="flex flex-col gap-2">
            {f.kegiatan.map((k) => (
              <li key={k.id}>
                <Link to={`/repositori-bukti-dukung/${k.id}`} className="block rounded-sm bg-grey2-75 px-3.5 py-2 text-small font-medium hover:underline">
                  {k.nama}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <hr className="border-grey-75" />

        <section className="flex flex-col gap-3">
          <h3 className="font-semibold">Kaitkan ke Bukti Dukung Lain</h3>
          {!boleh ? (
            <p className="text-small text-grey-200">{aktif?.terkunci ? 'Periode berjalan sudah dikunci.' : 'Hanya operator yang bisa mengaitkan berkas.'}</p>
          ) : pilihan.length === 0 ? (
            <p className="text-small text-grey-200">Tidak ada kegiatan lain dengan Anda sebagai PIC.</p>
          ) : (
            <>
              <p className="text-small text-grey-200">
                Pakai ulang berkas ini tanpa mengunggah lagi. Indikator kegiatan tujuan ikut ditambahkan ke tag berkas, dan berkas masuk folder periode {aktif.tahun1} - {aktif.tahun2}.
              </p>
              <Dropdown
                label="Kegiatan tujuan"
                value={target}
                onChange={setTarget}
                options={[{ value: '', label: 'Pilih kegiatan...' }, ...pilihan.map((k) => ({ value: k.id, label: k.nama }))]}
              />
              <button
                type="button"
                disabled={!target}
                onClick={() => {
                  onKaitkan(target)
                  setTarget('')
                }}
                className={buttonClass()}
              >
                Kaitkan Berkas
              </button>
            </>
          )}
        </section>
      </div>
    </aside>
  )
}

function ArsipBukti() {
  const { user } = useOutletContext()
  const muat = [useKegiatan(), useBukti(), useBerkas(), usePeriode()]
  const [{ kegiatan }, { bukti }, { berkas, kaitkan }, { periode, aktif }] = muat
  const [periodeId, setPeriodeId] = useState(null)
  const [dipilihId, setDipilihId] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pesan, setPesan] = useState('')

  const arsip = arsipBerkas(berkas, kegiatan, bukti, periode)
  const folder = periode.find((p) => p.id === periodeId) ?? aktif
  const isiFolder = arsip.filter((f) => f.periode.includes(folder?.id))
  const cocok = isiFolder.filter((f) =>
    includesText([f.nama, f.oleh, ...f.kegiatan.map((k) => k.nama), ...f.indikator.flatMap((i) => [i.nama, `indikator ${i.nomor}`, `ind. ${i.nomor}`])], query),
  )
  const { rows, page: currentPage, pageCount } = paginate(cocok, page, PAGE_SIZE)
  const dipilih = isiFolder.find((f) => f.id === dipilihId)

  function bukaFolder(id) {
    setPeriodeId(id)
    setDipilihId(null)
    setPage(1)
    setPesan('')
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader title="Repositori Bukti Dukung" subtitle="Arsip semua berkas bukti dukung per periode, beserta kegiatan yang memakainya.">
        <SearchBox
          value={query}
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
          placeholder="Cari berkas, kegiatan, atau indikator..."
        />
      </PageHeader>

      {/* Folder = periode evaluasi (referensi: kartu folder storage) */}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
        {periode.map((p) => {
          const isi = arsip.filter((f) => f.periode.includes(p.id))
          const terpilih = p.id === folder?.id
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={terpilih}
                onClick={() => bukaFolder(p.id)}
                className={`flex w-full flex-col gap-6 rounded-lg border-2 p-6 text-left transition duration-300 ease-out-quint hover:-translate-y-0.5 hover:shadow-md ${
                  terpilih ? 'border-grey-500 bg-lime-300' : 'border-transparent bg-lime-100'
                }`}
              >
                <span className="flex items-start justify-between gap-4">
                  <Ikon src={folderIcon} />
                  <Badge tone={p.terkunci ? 'blue' : 'green'} className="text-small">
                    {p.terkunci ? 'Terkunci' : 'Aktif'}
                  </Badge>
                </span>
                <span className="flex flex-col gap-2">
                  <span className="text-h3">
                    Periode {p.tahun1} - {p.tahun2}
                  </span>
                  <span className="flex items-center justify-between gap-4 text-small">
                    <span className="text-grey-200">{isi.length} berkas</span>
                    <span className="rounded-sm bg-white px-2.5 py-1 font-medium">{formatUkuran(isi.reduce((total, f) => total + f.ukuran, 0))}</span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {pesan && <Notice tone="green">{pesan}</Notice>}

      <div className="flex flex-wrap items-start gap-6">
        <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg bg-grey-500 px-2 pt-6 pb-2">
          <h2 className="px-3 text-h3 text-lime-300">{folder ? `Berkas Periode ${folder.tahun1} - ${folder.tahun2}` : 'Berkas'}</h2>
          <div className="overflow-x-auto rounded-md bg-white px-4 py-5">
            <table className="w-full min-w-[800px] text-left text-body text-grey-500">
              <thead>
                <tr className="border-b border-grey-75 font-semibold">
                  <th className="pb-3">Nama Berkas</th>
                  <th className="pb-3">Kegiatan Tertaut</th>
                  <th className="pb-3">Indikator</th>
                  <th className="pb-3">Ukuran</th>
                  <th className="pb-3">Diunggah</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {cocok.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-grey-200">
                      {isiFolder.length === 0 ? 'Belum ada berkas di periode ini.' : 'Tidak ada berkas yang cocok.'}
                    </td>
                  </tr>
                )}
                {rows.map((f) => {
                  const [nama, ekstensi] = pecahNama(f.nama)
                  return (
                    <tr key={f.id} className={`border-b border-grey-75/50 last:border-0 ${f.id === dipilihId ? 'bg-lime-75' : ''}`}>
                      <td className="py-2.5 pr-4">
                        <button type="button" onClick={() => setDipilihId(f.id)} aria-pressed={f.id === dipilihId} className="flex items-center gap-3.5 text-left hover:underline">
                          <Ikon src={fileText} />
                          <span className="break-all">
                            {nama}
                            <span className="font-light text-grey-200">{ekstensi}</span>
                          </span>
                        </button>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-small">{f.kegiatan[0].nama}</span>
                          {f.kegiatan.length > 1 && (
                            <Badge tone="blue" className="px-2.5! py-0.5! text-small">
                              +{f.kegiatan.length - 1}
                            </Badge>
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        {f.indikator.length === 0 ? (
                          <span className="text-small font-light text-grey-200">Belum dipetakan</span>
                        ) : (
                          <span className="flex flex-wrap gap-1.5">
                            {f.indikator.slice(0, TAG_TABEL).map((i) => (
                              <TagIndikator key={i.id} indikator={i} />
                            ))}
                            {f.indikator.length > TAG_TABEL && (
                              <span title={f.indikator.slice(TAG_TABEL).map((i) => `Indikator ${i.nomor}`).join(', ')} className="px-1 text-small text-grey-200">
                                +{f.indikator.length - TAG_TABEL}
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">{formatUkuran(f.ukuran)}</td>
                      <td className="py-2.5">
                        <span className="flex flex-col gap-1">
                          <span className="whitespace-nowrap">{formatTanggal(f.tanggal, 'short')}</span>
                          <span className="text-small font-light text-grey-200">{f.oleh}</span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {cocok.length > PAGE_SIZE && (
            <div className="pb-2">
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            </div>
          )}
        </section>

        {dipilih && (
          <DetailBerkas
            key={dipilih.id}
            f={dipilih}
            user={user}
            aktif={aktif}
            kegiatan={kegiatan}
            onClose={() => setDipilihId(null)}
            onKaitkan={(kegiatanId) => {
              kaitkan(kegiatanId, dipilih, aktif.id)
              setPesan(`"${dipilih.nama}" ditautkan ke ${kegiatan.find((k) => k.id === kegiatanId).nama}.`)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ArsipBukti
