import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, ChevronUp, Info, Sparkles, X } from 'lucide-react'
import { CONTOH_NARASI } from '../data/contohNarasi'
import {
  narasiLengkap,
  polaUntukBidang,
  slotAwal,
  susunNarasi,
} from '../data/templateNarasi'
import { kataKunciCocok, peringkatContoh } from '../lib/narasiHelper'

/**
 * Bantuan penulisan narasi 3.1 (Latar Belakang) dan 3.2 (Tujuan).
 *
 * Prinsip (sama dengan PanelRekomendasi):
 * - Semua isian berstatus SARAN. Teks hanya masuk textarea setelah pengguna
 *   menekan tombol yang jelas, dan tidak pernah menimpa suntingan tanpa izin.
 * - Pola berasal dari katalog panduan MS-Keg; contoh dari formulir MS-Keg
 *   lama OPD Kota Bogor. Bukan definisi resmi dan bukan jawaban baku.
 * - Konteks (judul kegiatan + instansi) hanya dipakai untuk MENGURUTKAN
 *   contoh yang paling mirip — bukan menghasilkan kalimat baru.
 *
 * Props:
 * - bidang   : '3.1' atau '3.2'
 * - formData : objek form utama (sumber slot otomatis & konteks pencocokan)
 * - nilai    : isi textarea saat ini
 * - onGanti  : (teksBaru) => void — ganti seluruh isi textarea
 */
function BantuanNarasi({ bidang, formData, nilai, onGanti }) {
  const [terbuka, setTerbuka] = useState(false)
  // Pola aktif: null berarti tab "Contoh dari OPD lain" yang dipilih.
  const [polaAktif, setPolaAktif] = useState(null)
  const [nilaiSlot, setNilaiSlot] = useState({})
  // Dialog konfirmasi muncul bila textarea sudah berisi teks lain.
  const [teksMenunggu, setTeksMenunggu] = useState(null)
  const [pratinjau, setPratinjau] = useState(true)
  const wadahRef = useRef(null)

  const daftarPola = useMemo(() => polaUntukBidang(bidang), [bidang])
  const konteks = `${formData?.halamanAwal?.judulKegiatan || ''} ${formData?.blok1?.instansiPenyelenggara || ''}`
  const daftarContoh = useMemo(
    () => peringkatContoh(CONTOH_NARASI[bidang] || [], konteks),
    [bidang, konteks],
  )
  const kataKunci = useMemo(
    () => kataKunciCocok(CONTOH_NARASI[bidang] || [], konteks),
    [bidang, konteks],
  )

  const template = daftarPola.find((p) => p.id === polaAktif) || null
  const kalimat = template ? susunNarasi(template, nilaiSlot) : ''
  const sudahLengkap = template ? narasiLengkap(template, nilaiSlot) : false

  function bukaPola(id) {
    if (polaAktif === id) {
      setPolaAktif(null)
      return
    }
    const t = daftarPola.find((p) => p.id === id)
    setNilaiSlot(slotAwal(t, formData))
    setPolaAktif(id)
  }

  /** Kirim teks ke textarea: langsung bila kosong, konfirmasi bila sudah berisi. */
  function ajukanTeks(teks) {
    const isiSekarang = (nilai || '').trim()
    if (isiSekarang === '') {
      onGanti(teks)
      return
    }
    if (isiSekarang !== teks.trim()) setTeksMenunggu(teks)
  }

  const labelBidang = bidang === '3.1' ? 'Latar Belakang' : 'Tujuan'

  return (
    <div ref={wadahRef} className="rounded-2xl border border-lime-300 bg-lime-100/40 shadow-xs">
      {/* Kepala panel — selalu terlihat. */}
      <button
        type="button"
        onClick={() => setTerbuka((prev) => !prev)}
        aria-expanded={terbuka}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-grey-300 text-lime-300">
            <Sparkles size={15} />
          </span>
          <span>
            <span className="block text-[13.5px] font-bold text-grey-300">
              Bantu tulis {labelBidang}
            </span>
            <span className="block text-[12px] text-grey-100">
              Pola kalimat &amp; contoh dari formulir MS-Keg lama
              {kataKunci.length > 0 && (
                <> &middot; cocok: {kataKunci.slice(0, 4).join(', ')}</>
              )}
            </span>
          </span>
        </span>
        {terbuka ? (
          <ChevronUp size={18} className="shrink-0 text-grey-200" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-grey-200" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {terbuka && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-lime-300/70"
          >
            <div className="px-5 py-4">
              <p className="mb-3 flex items-start gap-1.5 text-[12px] text-grey-100">
                <Info size={13} className="mt-0.5 shrink-0 text-lime-500" />
                Ini hanya nilai awal yang bisa Anda ubah — bukan jawaban otomatis.
                Pola dan contoh diambil dari formulir MS-Keg lama, bukan definisi
                resmi istilah.
              </p>

              {/* Pemilih: pola katalog, lalu tab contoh. */}
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Pilih pola kalimat">
                {daftarPola.map((pola) => {
                  const aktif = polaAktif === pola.id
                  return (
                    <button
                      key={pola.id}
                      type="button"
                      role="tab"
                      aria-selected={aktif}
                      onClick={() => bukaPola(pola.id)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                        aktif
                          ? 'border-lime-400 bg-lime-300 text-grey-300'
                          : 'border-grey-75 bg-white text-grey-200 hover:border-lime-400 hover:text-grey-300'
                      }`}
                    >
                      {pola.judul}
                    </button>
                  )
                })}
                <button
                  type="button"
                  role="tab"
                  aria-selected={polaAktif === null}
                  onClick={() => setPolaAktif(null)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                    polaAktif === null
                      ? 'border-lime-400 bg-lime-300 text-grey-300'
                      : 'border-grey-75 bg-white text-grey-200 hover:border-lime-400 hover:text-grey-300'
                  }`}
                >
                  Contoh dari OPD lain ({daftarContoh.length})
                </button>
              </div>

              {/* Isi tab aktif. */}
              {template ? (
                <div className="mt-3 rounded-xl border border-grey-50 bg-white p-4">
                  <p className="text-[13px] font-bold text-grey-300">{template.id}</p>
                  <p className="mt-1 text-[12px] text-grey-100">Isi bagian yang kosong:</p>

                  <div className="mt-3 flex flex-col gap-2.5">
                    {template.slot.map((slot) => (
                      <div key={slot.key}>
                        <label
                          htmlFor={`slot-${bidang}-${slot.key}`}
                          className="mb-1 block text-[12px] font-semibold text-grey-200"
                        >
                          {slot.label}
                          {slot.otomatis && (nilaiSlot[slot.key] || '').trim() !== '' && (
                            <span className="ml-1.5 font-normal text-lime-500">terisi otomatis</span>
                          )}
                        </label>
                        <input
                          id={`slot-${bidang}-${slot.key}`}
                          type="text"
                          value={nilaiSlot[slot.key] || ''}
                          onChange={(e) =>
                            setNilaiSlot((prev) => ({ ...prev, [slot.key]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-grey-75/60 px-3 py-1.5 text-[13px] text-grey-300 outline-none transition focus:border-grey-300"
                        />
                      </div>
                    ))}
                  </div>

                  {pratinjau && (
                    <p className="mt-3 rounded-lg bg-lime-75 px-3 py-2 text-[13px] leading-relaxed text-grey-300">
                      {kalimat}
                    </p>
                  )}

                  <p className="mt-2 text-[12px] text-grey-100">{template.catatan}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={!sudahLengkap}
                      onClick={() => ajukanTeks(kalimat)}
                      className="rounded-lg bg-lime-500 px-3.5 py-1.5 text-[12px] font-bold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Pakai kalimat ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setPratinjau((prev) => !prev)}
                      className="rounded-lg border border-grey-75 bg-white px-3 py-1.5 text-[12px] font-semibold text-grey-200 transition hover:text-grey-300"
                    >
                      {pratinjau ? 'Sembunyikan pratinjau' : 'Tampilkan pratinjau'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {daftarContoh.map((contoh) => (
                    <div
                      key={contoh.id}
                      className="rounded-xl border border-grey-50 bg-white p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[12px] font-semibold text-grey-200">
                          {contoh.opd}
                          {contoh.frekuensi > 1 && (
                            <span className="ml-1.5 font-normal text-grey-100">
                              (dipakai {contoh.frekuensi}&times; di formulir lama)
                            </span>
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => ajukanTeks(contoh.teks)}
                          className="shrink-0 rounded-lg border border-lime-400 px-2.5 py-1 text-[11.5px] font-bold text-lime-500 transition hover:bg-lime-75"
                          aria-label={`Salin contoh dari ${contoh.opd} ke isian`}
                        >
                          Salin
                        </button>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-grey-300">
                        {contoh.teks}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konfirmasi: textarea sudah berisi teks lain. */}
      {teksMenunggu !== null && (
        <div
          role="dialog"
          aria-label="Konfirmasi ganti isian"
          className="fixed inset-0 z-40 flex items-center justify-center bg-grey-300/40 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-grey-50 bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13.5px] font-bold text-grey-300">Ganti isi {labelBidang}?</p>
              <button
                type="button"
                onClick={() => setTeksMenunggu(null)}
                aria-label="Batal"
                className="shrink-0 text-grey-100 transition hover:text-grey-300"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-grey-200">
              Isian sudah berisi teks lain. Isi sekarang akan diganti dengan kalimat
              bantuan di bawah ini.
            </p>
            <p className="mt-2 max-h-28 overflow-y-auto rounded-lg bg-lime-75 px-3 py-2 text-[12.5px] leading-relaxed text-grey-300">
              {teksMenunggu}
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setTeksMenunggu(null)}
                className="rounded-lg border border-grey-75 bg-white px-3 py-1.5 text-[12px] font-semibold text-grey-200 transition hover:text-grey-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onGanti(`${(nilai || '').trim()}\n${teksMenunggu}`)
                  setTeksMenunggu(null)
                }}
                className="rounded-lg border border-lime-400 bg-white px-3 py-1.5 text-[12px] font-bold text-lime-500 transition hover:bg-lime-75"
              >
                Tambahkan di akhir
              </button>
              <button
                type="button"
                onClick={() => {
                  onGanti(teksMenunggu)
                  setTeksMenunggu(null)
                }}
                className="rounded-lg bg-lime-500 px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90"
              >
                Ganti isi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BantuanNarasi
