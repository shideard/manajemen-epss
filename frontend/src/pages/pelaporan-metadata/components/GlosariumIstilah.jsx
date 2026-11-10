import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, Search, X } from 'lucide-react'
import { KAMUS_PER_BLOK } from '../data/kamusIstilah'

/**
 * Halaman glosarium terpusat.
 *
 * Sumber data sama dengan tooltip per field: `data/kamusIstilah.js`. Karena itu
 * tidak mungkin berbeda bunyi antara penjelasan di form dan di glosarium.
 *
 * Ditampilkan sebagai pengganti isi halaman (bukan route baru) supaya state
 * wizard yang sedang diisi tidak hilang ketika pengguna membuka glosarium.
 *
 * Props:
 * - onKembali : () => void, dipanggil saat tombol "Kembali ke form"
 */
function GlosariumIstilah({ onKembali }) {
  const [kataKunci, setKataKunci] = useState('')

  // Pencarian sederhana: cocokkan pada istilah DAN definisi, tanpa beda
  // huruf besar/kecil, supaya pengguna bisa mencari lewat kalimat yang
  // diingatnya walau lupa nama istilahnya.
  const hasil = useMemo(() => {
    const q = kataKunci.trim().toLowerCase()
    if (!q) return KAMUS_PER_BLOK

    return KAMUS_PER_BLOK.map((blok) => ({
      ...blok,
      items: blok.items.filter(
        (item) =>
          item.istilah.toLowerCase().includes(q) ||
          item.definisi.toLowerCase().includes(q)
      ),
    })).filter((blok) => blok.items.length > 0)
  }, [kataKunci])

  const jumlahTampil = hasil.reduce((total, blok) => total + blok.items.length, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold text-grey-300">Glosarium Istilah</h1>
          <p className="text-[13px] text-grey-100">
            Penjelasan istilah yang dipakai di formulir metadata. Definisi diambil dari panduan
            teknis pengisian metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={onKembali}
          className="flex items-center gap-1.5 rounded-full border border-grey-75 bg-white px-4 py-2 text-[13px] font-semibold text-grey-300 hover:bg-grey2-75 transition"
        >
          <ArrowLeft size={16} />
          Kembali ke form
        </button>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-grey-100"
        />
        <input
          type="text"
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
          placeholder="Cari istilah, misalnya: unit sampel, CAWI, atau nonrespon"
          aria-label="Cari istilah"
          className="w-full rounded-xl border border-grey-75/60 bg-white py-2.5 pl-11 pr-10 text-[14px] text-grey-300 outline-none transition focus:border-grey-300 focus:ring-1 focus:ring-grey-300"
        />
        {kataKunci && (
          <button
            type="button"
            onClick={() => setKataKunci('')}
            aria-label="Hapus pencarian"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-100 transition hover:text-grey-300"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <p className="text-[12.5px] text-grey-100">
        {jumlahTampil} istilah{hasil.length > 1 ? ` dalam ${hasil.length} kelompok` : ''}
      </p>

      {/* Hasil kosong: beri saran, jangan biarkan halaman terlihat rusak. */}
      {jumlahTampil === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-grey-50 bg-white px-6 py-12 text-center">
          <BookOpen size={22} className="text-grey-100" />
          <p className="text-[14px] font-semibold text-grey-300">
            Tidak ada istilah yang cocok
          </p>
          <p className="text-[12.5px] text-grey-100">
            Coba kata lain yang lebih pendek, atau hapus pencarian untuk melihat semua istilah.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {hasil.map((blok) => (
            <section key={blok.id} className="flex flex-col gap-3">
              <h2 className="text-[15px] font-bold text-grey-300">
                {blok.judul}
                <span className="ml-2 text-[12px] font-medium text-grey-100">
                  {blok.items.length} istilah
                </span>
              </h2>

              <div className="grid gap-3 md:grid-cols-2">
                {blok.items.map((item) => (
                  <article
                    key={item.id}
                    id={`istilah-glosarium-${item.id}`}
                    className="rounded-2xl border border-grey-50 bg-white p-4 shadow-xs"
                  >
                    <h3 className="text-[13.5px] font-bold text-grey-300">{item.istilah}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-grey-200">
                      {item.definisi}
                    </p>

                    {item.terkait?.length > 0 && (
                      <p className="mt-2 text-[11.5px] text-grey-100">
                        <span className="font-semibold uppercase tracking-wide">
                          Sering tertukar dengan:{' '}
                        </span>
                        {item.terkait
                          .map((idTerkait) =>
                            blok.items.find((kandidat) => kandidat.id === idTerkait)
                          )
                          .filter(Boolean)
                          .map((kandidat) => kandidat.istilah)
                          .join(' · ') || 'istilah lain'}
                      </p>
                    )}

                    <p className="mt-2 text-[10.5px] text-grey-100">{item.sumber}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default GlosariumIstilah
