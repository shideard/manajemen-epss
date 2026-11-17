import { useState } from 'react'
import { ArrowLeft, Link2 } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { useBukti, useDokumenBukti, usePeriode, useSemuaDokumen, useSemuaKegiatan } from '../../lib/store'
import { formatTanggal, formatUkuran, includesText, isPic, paginate } from '../../lib/epss'
import { bolehUbah } from '../../config/menu'
import { Badge, DialogHeader, Dropdown, Memuat, Notice, PageHeader, Pagination, SearchBox } from '../../components/ui'
import { buttonClass } from '../../components/classes'
import { useConfirm } from '../../components/useConfirm'
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

function Ikon({ src, besar = false, pintasan = false }) {
  return (
    <span className={`relative grid shrink-0 place-items-center bg-grey-300 ${besar ? 'size-16 rounded-md' : 'size-9 rounded-sm'}`}>
      <img src={src} alt="" width={besar ? 39 : 22} height={besar ? 39 : 22} />
      {pintasan && (
        <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full bg-lime-300 text-grey-500">
          <Link2 size={12} aria-label="Pintasan" />
        </span>
      )}
    </span>
  )
}

// Berkas asli + semua pintasannya di kegiatan lain berbagi id asli yang sama
const idAsli = (f) => f.sumber?.id ?? f.id

// Panel detail di kanan tabel (referensi: panel detail berkas ala Google Drive)
function DetailBerkas({ f, keluarga, user, aktif, kegiatan, terverifikasi, onKaitkan, onHapus, onBukaAsli, onClose }) {
  const [target, setTarget] = useState('')
  const [error, setError] = useState('')
  const dokumen = useDokumenBukti(f.kegiatan[0].id)
  const [, ekstensi] = pecahNama(f.nama)
  // Tautan baru masuk periode berjalan, jadi hanya kegiatan yang user ini PIC-nya dan periodenya belum dikunci
  const boleh = bolehUbah(user, 'unggahBukti', aktif)
  const sudahAda = new Set(keluarga.map((x) => x.kegiatan[0].id))
  const pilihan = kegiatan.filter((k) => isPic(k, user) && !sudahAda.has(k.id))
  // Aturan backend: hanya PIC, periode berjalan yang belum dikunci, dan belum ada ajuan terverifikasi
  const bolehHapus = boleh && f.periodeId === aktif?.id && isPic(f.kegiatan[0], user) && !terverifikasi

  return (
    // Sticky agar panel ikut layar saat tabel panjang; isinya bergulir sendiri bila lebih tinggi dari layar
    // (dropdown "Kaitkan" yang melewati bawah panel tinggal digulir, tidak terpotong mati)
    <aside className="sticky top-6 flex max-h-[calc(100vh-3rem)] w-[360px] max-w-full flex-col overflow-y-auto rounded-lg bg-white">
      {/* className rounded-t-lg: sudut atas header ikut membulat */}
      <DialogHeader title={<span className="break-all">{f.nama}</span>} onClose={onClose} closeLabel="Tutup detail berkas" className="rounded-t-lg" />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex h-40 flex-col items-center justify-center gap-4 rounded-md bg-grey2-75">
          <Ikon src={fileText} besar pintasan={Boolean(f.sumber)} />
          {f.id ? (
            <button type="button" onClick={() => dokumen.buka(f).catch((err) => setError(err.message))} className={buttonClass('outline', 'sm')}>
              <img src={eyeIcon} alt="" width={15} height={15} />
              Lihat Berkas
            </button>
          ) : (
            <p className="px-6 text-center text-small text-grey-200">Berkas tidak tersedia.</p>
          )}
          {error && <Notice tone="red" role="alert">{error}</Notice>}
        </div>

        {f.sumber && (
          <Notice tone="blue">
            <span className="flex flex-col items-start gap-2">
              Pintasan ke berkas asli di kegiatan {f.sumber.kegiatanNama}.
              <button type="button" onClick={onBukaAsli} className="font-semibold underline">
                Buka berkas asli
              </button>
            </span>
          </Notice>
        )}

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
          <h3 className="font-semibold">Tertaut ke {keluarga.length} Bukti Dukung</h3>
          <ul className="flex flex-col gap-2">
            {keluarga.map((x) => (
              <li key={x.id}>
                <Link to={`/repositori-bukti-dukung/${x.kegiatan[0].id}`} className="flex items-center justify-between gap-2 rounded-sm bg-grey2-75 px-3.5 py-2 text-small font-medium hover:underline">
                  {x.kegiatan[0].nama}
                  <span className="shrink-0 font-light text-grey-200">{x.sumber ? 'Pintasan' : 'Asli'}</span>
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
                Pakai ulang berkas ini tanpa mengunggah lagi. Folder kegiatan tujuan mendapat pintasan yang menunjuk ke berkas asli, bukan salinan.
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

        {bolehHapus && (
          <>
            <hr className="border-grey-75" />
            <section className="flex flex-col gap-3">
              <h3 className="font-semibold">Hapus Berkas</h3>
              <button type="button" onClick={() => onHapus(false)} className={buttonClass('outline')}>
                Lepas dari Kegiatan Ini
              </button>
              <button type="button" onClick={() => onHapus(true)} className={buttonClass('danger')}>
                Hapus dari Semua Kegiatan
              </button>
            </section>
          </>
        )}
      </div>
    </aside>
  )
}

function ArsipBukti() {
  const { user } = useOutletContext()
  const periodeData = usePeriode()
  const { periode, aktif } = periodeData
  const daftarKegiatan = useSemuaKegiatan(aktif?.id)
  const dataArsip = useSemuaDokumen(periode.map((p) => p.id))
  const muat = [periodeData, daftarKegiatan, dataArsip]
  const { kegiatan } = daftarKegiatan
  const { dokumen: arsip, kaitkan, lepas, hapus } = dataArsip
  const { bukti, muatUlang: muatUlangBukti } = useBukti()
  const [konfirmasi, dialogKonfirmasi] = useConfirm()
  const [periodeId, setPeriodeId] = useState(null)
  const [kegiatanId, setKegiatanId] = useState(null)
  const [dipilihId, setDipilihId] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pesan, setPesan] = useState('')
  const [pesanTone, setPesanTone] = useState('green')

  const folder = periode.find((p) => p.id === periodeId) ?? aktif
  const isiFolder = arsip.filter((f) => f.periode.includes(folder?.id))
  // Folder kegiatan: semua kegiatan periode berjalan (termasuk yang belum punya berkas) + kegiatan yang punya berkas
  const folderKegiatan = [...new Map([...(folder?.id === aktif?.id ? kegiatan : []), ...isiFolder.map((f) => f.kegiatan[0])].map((k) => [k.id, k])).values()]
  const kegiatanBuka = folderKegiatan.find((k) => k.id === kegiatanId)
  // Tanpa folder kegiatan terbuka, tabel hanya muncul saat mencari (lintas kegiatan)
  const tampilTabel = Boolean(kegiatanBuka || query)
  const cocok = isiFolder.filter((f) => (!kegiatanBuka || f.kegiatan[0].id === kegiatanBuka.id)).filter((f) =>
    includesText([f.nama, f.oleh, ...f.kegiatan.map((k) => k.nama), ...f.indikator.flatMap((i) => [i.nama, `indikator ${i.nomor}`, `ind. ${i.nomor}`])], query),
  )
  const { rows, page: currentPage, pageCount } = paginate(cocok, page, PAGE_SIZE)
  const dipilih = isiFolder.find((f) => f.id === dipilihId)
  const keluarga = dipilih ? arsip.filter((f) => idAsli(f) === idAsli(dipilih)) : []

  function bukaKegiatan(id, berkasId = null) {
    setKegiatanId(id)
    setDipilihId(berkasId)
    setPage(1)
  }

  function bukaFolder(id) {
    setPeriodeId(id)
    setKegiatanId(null)
    setDipilihId(null)
    setPage(1)
    setPesan('')
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} bentuk="kartu" />
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

      {pesan && <Notice tone={pesanTone} role={pesanTone === 'red' ? 'alert' : 'status'}>{pesan}</Notice>}

      <div className="flex flex-wrap items-start gap-6">
        <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg bg-grey-500 px-2 pt-6 pb-2">
          <div className="flex flex-wrap items-center gap-3 px-3">
            {kegiatanBuka && (
              <button type="button" onClick={() => bukaKegiatan(null)} aria-label="Kembali ke folder kegiatan" className="grid size-8 place-items-center rounded-sm bg-lime-300 text-grey-500">
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
            )}
            <h2 className="text-h3 text-lime-300">
              {folder ? `Periode ${folder.tahun1} - ${folder.tahun2}` : 'Berkas'}
              {kegiatanBuka && <span className="text-white"> / {kegiatanBuka.nama}</span>}
            </h2>
          </div>

          {/* Folder = rencana kegiatan; isinya berkas asli dan pintasan ke berkas di kegiatan lain */}
          {!tampilTabel && (
            <div className="rounded-md bg-white px-4 py-5">
              {folderKegiatan.length === 0 && <p className="py-10 text-center text-grey-200">Belum ada kegiatan di periode ini.</p>}
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {folderKegiatan.map((k) => {
                  const isi = isiFolder.filter((f) => f.kegiatan[0].id === k.id)
                  const pintasan = isi.filter((f) => f.sumber).length
                  return (
                    <li key={k.id}>
                      <button
                        type="button"
                        onClick={() => bukaKegiatan(k.id)}
                        className="flex size-full items-center gap-3.5 rounded-md bg-lime-100 p-4 text-left transition duration-300 ease-out-quint hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <Ikon src={folderIcon} />
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="font-medium">{k.nama}</span>
                          <span className="text-small text-grey-200">
                            {isi.length} berkas{pintasan > 0 && ` (${pintasan} pintasan)`}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {tampilTabel && (
            <div className="overflow-x-auto rounded-md bg-white px-4 py-5">
              <table className="w-full min-w-[800px] text-left text-body text-grey-500">
                <thead>
                  <tr className="border-b border-grey-75 font-semibold">
                    <th className="pb-3">Nama Berkas</th>
                    {!kegiatanBuka && <th className="pb-3">Kegiatan</th>}
                    <th className="pb-3">Indikator</th>
                    <th className="pb-3">Ukuran</th>
                    <th className="pb-3">Diunggah</th>
                  </tr>
                </thead>
                <tbody className="font-medium">
                  {cocok.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-grey-200">
                        {query ? 'Tidak ada berkas yang cocok.' : 'Belum ada berkas di kegiatan ini.'}
                      </td>
                    </tr>
                  )}
                  {rows.map((f) => {
                    const [nama, ekstensi] = pecahNama(f.nama)
                    return (
                      <tr key={f.id} className={`border-b border-grey-75/50 last:border-0 ${f.id === dipilihId ? 'bg-lime-75' : ''}`}>
                        <td className="py-2.5 pr-4">
                          <button type="button" onClick={() => setDipilihId(f.id)} aria-pressed={f.id === dipilihId} className="flex items-center gap-3.5 text-left hover:underline">
                            <Ikon src={fileText} pintasan={Boolean(f.sumber)} />
                            <span className="flex flex-col gap-0.5">
                              <span className="break-all">
                                {nama}
                                <span className="font-light text-grey-200">{ekstensi}</span>
                              </span>
                              {f.sumber && <span className="text-small font-light text-grey-200">Pintasan dari {f.sumber.kegiatanNama}</span>}
                            </span>
                          </button>
                        </td>
                        {!kegiatanBuka && (
                          <td className="py-2.5 pr-4">
                            <span className="text-small">{f.kegiatan[0].nama}</span>
                          </td>
                        )}
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
          )}
          {tampilTabel && cocok.length > PAGE_SIZE && (
            <div className="pb-2">
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            </div>
          )}
        </section>

        {dipilih && (
          <DetailBerkas
            key={dipilih.id}
            f={dipilih}
            keluarga={keluarga}
            onBukaAsli={() => {
              // Berkas asli bisa berada di folder periode lain
              setPeriodeId(arsip.find((x) => x.id === dipilih.sumber.id)?.periodeId ?? folder?.id)
              bukaKegiatan(dipilih.sumber.kegiatanId, dipilih.sumber.id)
            }}
            user={user}
            aktif={aktif}
            kegiatan={kegiatan}
            terverifikasi={Object.values(bukti).some((b) => b.kegiatanId === dipilih.kegiatan[0].id && b.status === 'terverifikasi')}
            onClose={() => setDipilihId(null)}
            onHapus={(semua) =>
              konfirmasi({
                title: semua ? 'Hapus dari Semua Kegiatan' : 'Lepas dari Kegiatan Ini',
                message:
                  (semua
                  ? `Hapus "${dipilih.nama}" beserta semua tautannya di kegiatan lain? Berkas tidak bisa dikembalikan.`
                  : `Lepas "${dipilih.nama}" dari ${dipilih.kegiatan[0].nama}? Kegiatan lain yang memakai berkas ini tidak terpengaruh.`) +
                  ' Ajuan yang sedang menunggu verifikasi akan ditarik kembali ke draft.',
                confirmLabel: semua ? 'Hapus' : 'Lepas',
                danger: true,
                onConfirm: async () => {
                  await (semua ? hapus : lepas)(dipilih.kegiatan[0].id, dipilih.id)
                  muatUlangBukti()
                  setDipilihId(null)
                  setPesanTone('green')
                  setPesan(`"${dipilih.nama}" ${semua ? 'dihapus' : 'dilepas dari kegiatan'}.`)
                },
              })
            }
            onKaitkan={async (kegiatanId) => {
              try {
                await kaitkan(kegiatanId, dipilih.id)
                setPesanTone('green')
                setPesan(`"${dipilih.nama}" ditautkan ke ${kegiatan.find((k) => k.id === kegiatanId).nama}.`)
              } catch (error) {
                setPesanTone('red')
                setPesan(error.message || 'Gagal mengaitkan berkas.')
              }
            }}
          />
        )}
      </div>
      {dialogKonfirmasi}
    </div>
  )
}

export default ArsipBukti
