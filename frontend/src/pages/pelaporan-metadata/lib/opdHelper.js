import { api } from '../../../lib/api'

// Daftar nama OPD untuk saran "Instansi Penyelenggara". Dimuat sekali per
// halaman lalu dibagi antar pemakaian. Bila gagal (mis. peran tidak punya akses
// pilihan OPD), kembalikan daftar kosong — isian tetap bisa diketik manual.
let cadangan = null
let janji = null

export function muatNamaOpd() {
  if (cadangan) return Promise.resolve(cadangan)
  janji ??= api('/api/pilihan/opd')
    .then((hasil) => {
      cadangan = (hasil?.data ?? []).map((item) => item.nama).filter(Boolean)
      return cadangan
    })
    .catch(() => {
      // Coba lagi saat dibutuhkan berikutnya (mis. sesi belum siap)
      janji = null
      return []
    })
  return janji
}
