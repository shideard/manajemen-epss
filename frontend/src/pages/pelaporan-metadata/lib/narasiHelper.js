// Peringkat contoh narasi berdasarkan kemiripan kata dengan konteks isian.
//
// Ini pengganti ringan dari pendekatan retrieval pada layanan terpisah:
// alih-alih memanggil model bahasa, sistem hanya mengurutkan contoh asli
// formulir lama yang paling mirip dengan judul kegiatan dan instansi
// pengguna. Bobotnya TF-IDF sederhana di dalam browser — tanpa jaringan
// tambahan, tanpa kunci API, dan tetap jalan luring.

// Kata yang terlalu umum untuk membedakan urusan; dibuang saat mencocokkan.
const STOPWORDS = new Set([
  'dan', 'atau', 'yang', 'untuk', 'dengan', 'pada', 'dari', 'di', 'ke',
  'dalam', 'sebagai', 'serta', 'ini', 'itu', 'adalah', 'akan', 'tidak',
  'kota', 'bogor', 'kegiatan', 'data', 'tahun', 'kecamatan',
])

/** Huruf kecil, buang tanda baca, pecah jadi kata bermakna. */
export function tokenisasi(teks) {
  return (teks || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((kata) => kata.length >= 3 && !STOPWORDS.has(kata))
}

/**
 * Urutkan contoh dari yang paling mirip dengan `konteks`.
 * Skor = jumlah bobot IDF kata kueri yang muncul di teks/OPD contoh.
 * Bila konteks kosong, urutan asli (tersusun manual) dipertahankan.
 */
export function peringkatContoh(daftar, konteks) {
  const kataKueri = [...new Set(tokenisasi(konteks))]
  if (kataKueri.length === 0) return daftar

  const dokumen = daftar.map((contoh) => new Set(tokenisasi(`${contoh.teks} ${contoh.opd}`)))
  const jumlahDokumen = dokumen.length

  const idf = {}
  for (const kata of kataKueri) {
    const muncul = dokumen.filter((kataDokumen) => kataDokumen.has(kata)).length
    // Kata yang tidak ada di korpus bernilai 0; kata langka bernilai lebih tinggi.
    idf[kata] = muncul === 0 ? 0 : Math.log((jumlahDokumen + 1) / (muncul + 0.5))
  }

  return daftar
    .map((contoh, i) => {
      const skor = kataKueri.reduce((total, kata) => total + (dokumen[i].has(kata) ? idf[kata] : 0), 0)
      return { contoh, skor, urutan: i }
    })
    .sort((a, b) => b.skor - a.skor || a.urutan - b.urutan)
    .map(({ contoh }) => contoh)
}

/** Kata kueri yang benar-benar muncul di salah satu contoh, untuk ditampilkan. */
export function kataKunciCocok(daftar, konteks) {
  const kataKueri = [...new Set(tokenisasi(konteks))]
  const kosakata = new Set(daftar.flatMap((c) => tokenisasi(`${c.teks} ${c.opd}`)))
  return kataKueri.filter((kata) => kosakata.has(kata))
}
