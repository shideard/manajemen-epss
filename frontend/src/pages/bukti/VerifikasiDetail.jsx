import { useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { berkasUrl, useBerkas, useBukti, useKegiatan, usePeriode } from '../../lib/store'
import { bolehUbah } from '../../config/menu'
import { buktiKey, indikatorById, LEVELS, levelTerpenuhi, metaBerkas } from '../../lib/epss'
import { ChecklistItem, Field, FormError, Memuat, Notice, PageHeader, StatusBukti } from '../../components/ui'
import { buttonClass, fieldClass } from '../../components/classes'
import { useConfirm } from '../../components/useConfirm'
import PedomanModal from '../../components/PedomanModal'
import fileIcon from '../../assets/icons/file-3-fill.svg'
import bookIcon from '../../assets/icons/book-mark-fill.svg'
import fileWhite from '../../assets/icons/file-3-fill-white.svg'
import externalIcon from '../../assets/icons/external-link-line.svg'

function VerifikasiDetail() {
  const { kegiatanId, indikatorId } = useParams()
  const navigate = useNavigate()
  const { user } = useOutletContext()
  const { aktif } = usePeriode()
  const muat = [useKegiatan(), useBukti(), useBerkas()]
  const [{ kegiatan }, { bukti: semuaBukti, ubah: ubahBukti }, { berkas }] = muat
  const [dipilih, setDipilih] = useState(0)
  const [level, setLevel] = useState(null)
  const [catatan, setCatatan] = useState('')
  const [pedoman, setPedoman] = useState(false)
  const [error, setError] = useState('')
  // Centang verifikator hanya disimpan saat Setujui / Kirim Revisi; null = belum diubah
  const [draft, setDraft] = useState(null)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  const key = buktiKey(kegiatanId, indikatorId)
  const bukti = semuaBukti[key]
  const k = kegiatan.find((item) => item.id === kegiatanId)
  const indikator = indikatorById[indikatorId]
  if ((!bukti || !k) && muat.some((d) => d.loading || d.error)) return <Memuat dari={muat} />
  if (!bukti || !k || !indikator) return <Navigate to="/verifikasi-bukti-dukung" replace />

  // Hanya ajuan berstatus "menunggu" yang bisa diputuskan, dan tidak saat periode dikunci
  const bolehPutuskan = bolehUbah(user, 'verifikasiBukti', aktif) && bukti.status === 'menunggu'
  const files = berkas[kegiatanId] ?? []
  const file = files[dipilih]
  const semuaChecked = draft ?? bukti.checked ?? {}
  const terpenuhi = levelTerpenuhi(indikator.levels, semuaChecked)
  // Berjenjang: hanya boleh membuka level sampai satu di atas level terpenuhi
  const levelAktif = level ?? Math.min(terpenuhi + 1, LEVELS.length)
  const checked = semuaChecked[levelAktif] ?? []

  const simpan = (perubahan) => ubahBukti(key, { ...perubahan, checked: semuaChecked })

  function centang(index, value) {
    const baris = indikator.levels[levelAktif - 1].syarat.map((_, i) => (i === index ? value : Boolean(checked[i])))
    setDraft({ ...semuaChecked, [levelAktif]: baris })
  }

  function kirimRevisi() {
    if (!catatan.trim()) return setError('Isi catatan perbaikan untuk operator terlebih dahulu.')
    konfirmasi({
      title: 'Kirim Revisi',
      message: `Kembalikan ajuan "${k.nama}" ke operator dengan status Perlu Perbaikan?`,
      confirmLabel: 'Kirim Revisi',
      onConfirm: () => {
        simpan({ status: 'perbaikan', catatan: catatan.trim() })
        navigate('/verifikasi-bukti-dukung')
      },
    })
  }

  function setujui() {
    if (terpenuhi === 0) return setError('Belum ada level yang terpenuhi. Centang persyaratan level 1 terlebih dahulu.')
    konfirmasi({
      title: 'Setujui & Tetapkan Level',
      message: `Tetapkan "${k.nama}" untuk Indikator ${indikator.nomor} pada Level ${terpenuhi} (${LEVELS[terpenuhi - 1]})? Ajuan akan berstatus Terverifikasi.`,
      confirmLabel: 'Setujui',
      onConfirm: () => {
        simpan({ status: 'terverifikasi', level: terpenuhi, catatan: '' })
        navigate('/verifikasi-bukti-dukung')
      },
    })
  }

  const url = file && berkasUrl.get(file.id)

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader back="/verifikasi-bukti-dukung" title="Verifikasi Bukti Dukung Kegiatan" />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(440px,2fr)_3fr]">
        <div className="flex flex-col gap-6 rounded-lg bg-white p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-h3">{k.nama}</h2>
              <p>
                Indikator {indikator.nomor}: {indikator.nama}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <StatusBukti status={bukti.status} label={bukti.status === 'menunggu' ? 'Belum diverifikasi' : undefined} className="text-small" />
              <p className="font-light text-grey-200">Pengaju: <span className="font-semibold">{bukti.pengaju ?? '-'}</span></p>
            </div>
          </div>
          <hr className="border-grey-75" />

          <section className="flex flex-col gap-3">
            <h3 className="font-semibold">Bukti dukung yang dilampirkan</h3>
            {files.length === 0 && <p className="text-small text-grey-200">Belum ada berkas.</p>}
            {files.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDipilih(i)}
                aria-pressed={i === dipilih}
                className={`rounded-md p-5 text-left ${i === dipilih ? 'border-2 border-grey-500 bg-lime-300' : 'border border-grey-75 bg-white'}`}
              >
                <span className="flex items-center gap-2">
                  <img src={fileIcon} alt="" width={24} height={24} />
                  <span className="flex min-w-0 flex-col gap-2">
                    <span className="truncate text-small font-semibold">{f.nama}</span>
                    <span className="text-caption whitespace-pre-wrap text-grey-200">{metaBerkas(f)}</span>
                  </span>
                </span>
              </button>
            ))}
          </section>
          <hr className="border-grey-75" />

          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Checklist per Level</h3>
              {/* Tombol level hanya membuka checklist; level yang ditetapkan selalu Level Terpenuhi */}
              <p className="text-small text-grey-200">Pilih level untuk melihat syaratnya. Level yang ditetapkan saat disetujui adalah Level Terpenuhi.</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {LEVELS.map((nama, i) => {
                const n = i + 1
                const aktif = n === levelAktif
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setLevel(n)}
                    disabled={n > terpenuhi + 1}
                    aria-pressed={aktif}
                    className={`flex h-[65px] flex-col items-center justify-center gap-1 rounded-md disabled:opacity-40 ${
                      aktif ? 'border-2 border-grey-500 bg-lime-300 text-grey-500' : 'bg-grey-500 text-lime-300'
                    }`}
                  >
                    <span className="font-semibold">{n}</span>
                    <span className="text-caption">{nama}</span>
                    {n <= terpenuhi && <span className="text-caption font-semibold">Terpenuhi</span>}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">Checklist Persyaratan Bukti Dukung:</h3>
              <p className="text-small text-grey-200">Anda bisa lanjut ke level selanjutnya jika seluruh persyaratan pada level {levelAktif} sudah terpenuhi.</p>
            </div>
            {indikator.levels[levelAktif - 1].syarat.map((syarat, i) => (
              <ChecklistItem key={syarat} checked={Boolean(checked[i])} onChange={(value) => centang(i, value)} disabled={!bolehPutuskan}>
                {syarat}
              </ChecklistItem>
            ))}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">Level Terpenuhi : {terpenuhi}</p>
            <button type="button" onClick={() => setPedoman(true)} className={buttonClass('secondary', 'sm')}>
              <img src={bookIcon} alt="" width={19} height={19} />
              Lihat Pedoman Indikator
            </button>
          </div>

          {!bolehPutuskan && (
            <Notice tone="yellow" className="text-small">
              {aktif.terkunci ? 'Periode aktif sudah dikunci. Ajuan hanya dapat dilihat.' : 'Ajuan ini tidak sedang menunggu verifikasi, sehingga tidak dapat diputuskan.'}
            </Notice>
          )}

          {bolehPutuskan && (
            <Field label="Catatan perbaikan untuk operator">
              <textarea
                value={catatan}
                onChange={(e) => {
                  setCatatan(e.target.value)
                  setError('')
                }}
                className={`${fieldClass} min-h-[66px] resize-y py-3`}
              />
            </Field>
          )}

          <FormError>{error}</FormError>

          {bolehPutuskan && (
            <div className="flex flex-col gap-2 pt-4">
              <button type="button" onClick={kirimRevisi} className={buttonClass('outline')}>
                Kirim Revisi ke Operator
              </button>
              <button type="button" onClick={setujui} className={buttonClass()}>
                Setujui &amp; Tetapkan Level {terpenuhi || ''}
              </button>
            </div>
          )}
        </div>

        <section className="sticky top-6 flex min-h-[600px] flex-col overflow-hidden rounded-lg bg-grey-500 xl:h-[909px]">
          <header className="flex items-center justify-between gap-4 px-8 py-6">
            <p className="flex min-w-0 items-center gap-4 text-white">
              <img src={fileWhite} alt="" width={24} height={24} />
              <span className="truncate">{file?.nama ?? 'Tidak ada berkas'}</span>
            </p>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" aria-label="Buka berkas di tab baru">
                <img src={externalIcon} alt="" width={24} height={24} />
              </a>
            )}
          </header>
          <div className="grid flex-1 place-items-center rounded-b-lg bg-grey-50">
            {url ? (
              <iframe src={url} title={file.nama} className="size-full" />
            ) : (
              <p className="px-6 text-center text-grey-200">Pratinjau tidak tersedia. Isi berkas hanya bisa dilihat pada sesi saat berkas diunggah.</p>
            )}
          </div>
        </section>
      </div>

      {pedoman && <PedomanModal indikator={indikator} level={levelAktif} onClose={() => setPedoman(false)} />}
      {dialogKonfirmasi}
    </div>
  )
}

export default VerifikasiDetail
