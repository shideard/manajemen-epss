import { api } from '../../../lib/api'
import { cariKontakOpd, kontakDariKode, normalNamaOpd } from './alamatOpd'

// Daftar OPD untuk saran "Instansi Penyelenggara". Dimuat sekali per halaman
// lalu dibagi antar pemakaian. Bila gagal (mis. peran tidak punya akses pilihan
// OPD), kembalikan daftar kosong — isian tetap bisa diketik manual.
let cadangan = null
let janji = null

export function muatDaftarOpd() {
  if (cadangan) return Promise.resolve(cadangan)
  janji ??= api('/api/pilihan/opd')
    .then((hasil) => {
      cadangan = (hasil?.data ?? [])
        .filter((item) => item?.nama)
        .map((item) => ({ kode: item.kode ?? '', nama: item.nama }))
      return cadangan
    })
    .catch(() => {
      // Coba lagi saat dibutuhkan berikutnya (mis. sesi belum siap)
      janji = null
      return []
    })
  return janji
}

// Hanya nama, untuk daftar saran.
export function muatNamaOpd() {
  return muatDaftarOpd().then((daftar) => daftar.map((item) => item.nama))
}

/**
 * Cari alamat + email instansi berdasarkan nama yang diketik/dipilih.
 *
 * Urutan pencocokan:
 * 1. `kode` dari daftar OPD (tahan beda ejaan nama).
 * 2. Nama ternormalisasi langsung dari berkas `alamatOpd.js` — dipakai bila
 *    daftar OPD tidak bisa dimuat (mis. akun tanpa akses pilihan OPD).
 */
export function cariAlamatInstansi(nama) {
  const kunci = normalNamaOpd(nama)
  if (!kunci) return Promise.resolve(null)

  return muatDaftarOpd()
    .then((daftar) => {
      const cocok = daftar.find((item) => normalNamaOpd(item.nama) === kunci)
      return cocok?.kode ? kontakDariKode(cocok.kode) : null
    })
    .then((hasil) => hasil ?? cariKontakOpd(nama))
}
