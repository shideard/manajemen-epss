// Pola kalimat pembantu untuk isian 3.1 (Latar Belakang) dan 3.2 (Tujuan)
// pada formulir MS-Keg, berdasarkan katalog template pada dokumen panduan
// MS-Keg (status "Approved").
//
// Prinsip:
// - Template HANYA mengusulkan nilai awal; isian tetap milik pengguna.
// - Slot yang bisa diturunkan dari isian lain diberi fungsi `otomatis`;
//   slot tanpa `otomatis` dikosongkan agar pengguna mengisi sendiri.
// - `catatan` diambil dari catatan penelaah panduan, ditampilkan apa adanya
//   agar pengguna tahu batasan tiap pola.

/**
 * Ambil nilai slot otomatis dari formData.
 * Mengembalikan '' bila sumbernya kosong, supaya slot tetap diisi manual.
 */
function nilaiOtomatis(kunci, formData) {
  if (kunci === 'kegiatan') return (formData?.halamanAwal?.judulKegiatan || '').trim()
  if (kunci === 'instansi') return (formData?.blok1?.instansiPenyelenggara || '').trim()
  return ''
}

export const TEMPLATE_NARASI = {
  '3.1': [
    {
      id: 'MSKEG-LB-001',
      judul: 'Kegiatan mendukung tugas instansi',
      teks: 'Kegiatan {kegiatan} dilaksanakan untuk mendukung {kebutuhan} dalam rangka {tujuanPemerintahan}.',
      slot: [
        { key: 'kegiatan', label: 'Nama kegiatan', otomatis: 'kegiatan' },
        { key: 'kebutuhan', label: 'Kebutuhan/tugas instansi' },
        { key: 'tujuanPemerintahan', label: 'Tujuan pemerintahan/pembangunan' },
      ],
      catatan:
        'Sesuaikan dengan kebutuhan nyata instansi, jangan sekadar kalimat umum.',
    },
    {
      id: 'MSKEG-LB-002',
      judul: 'Data sebagai dasar kebijakan',
      teks: 'Data {topik} diperlukan sebagai dasar {dasar} {programUrusan}.',
      slot: [
        { key: 'topik', label: 'Topik/indikator data' },
        { key: 'dasar', label: 'Peruntukan data (perencanaan/kebijakan/evaluasi)' },
        { key: 'programUrusan', label: 'Program/urusan' },
      ],
      catatan:
        'Jangan menyatakan data menjadi dasar kebijakan bila pemanfaatannya belum jelas.',
    },
    {
      id: 'MSKEG-LB-003',
      judul: 'Gambaran permasalahan di wilayah',
      teks: 'Untuk memperoleh gambaran mengenai {permasalahan} di {wilayah}, diperlukan data dan informasi tentang {topik}.',
      slot: [
        { key: 'permasalahan', label: 'Permasalahan/kondisi' },
        { key: 'wilayah', label: 'Wilayah/instansi', otomatis: 'instansi' },
        { key: 'topik', label: 'Topik data' },
      ],
      catatan:
        'Pola penghubung kondisi dengan kebutuhan data; pastikan permasalahan nyata terjadi.',
    },
  ],
  '3.2': [
    {
      id: 'MSKEG-TU-001',
      judul: 'Mengumpulkan dan mengompilasi data',
      teks: 'Kegiatan ini bertujuan untuk mengumpulkan dan mengkompilasi data {topik} di {instansi}.',
      slot: [
        { key: 'topik', label: 'Topik/jenis statistik' },
        { key: 'instansi', label: 'OPD/wilayah', otomatis: 'instansi' },
      ],
      catatan:
        "Jangan gunakan kata 'kompilasi' bila metode kegiatan bukan kompilasi produk administrasi.",
    },
    {
      id: 'MSKEG-TU-002',
      judul: 'Data untuk satu pemanfaatan',
      teks: 'Kegiatan ini bertujuan untuk menghasilkan data/informasi {topik} yang dapat digunakan sebagai {manfaat}.',
      slot: [
        { key: 'topik', label: 'Topik data' },
        { key: 'manfaat', label: 'Manfaat/pemanfaatan' },
      ],
      catatan: 'Manfaat harus relevan dengan keluaran kegiatan dan kebutuhan pengguna data.',
    },
  ],
}

/** Daftar pola untuk satu bidang ('3.1' atau '3.2'). */
export function polaUntukBidang(bidang) {
  return TEMPLATE_NARASI[bidang] || []
}

/**
 * Susun kalimat utuh dari pola + nilai slot.
 * Slot kosong ditandai [label] agar terlihat apa yang belum diisi.
 */
export function susunNarasi(template, nilaiSlot) {
  return template.teks.replace(/\{(\w+)\}/g, (_, kunci) => {
    const isi = (nilaiSlot[kunci] || '').trim()
    if (isi) return isi
    const slot = template.slot.find((s) => s.key === kunci)
    return `[${slot ? slot.label : kunci}]`
  })
}

/** Nilai awal slot: slot ber-sumber otomatis diisi dari formData. */
export function slotAwal(template, formData) {
  const hasil = {}
  for (const slot of template.slot) {
    hasil[slot.key] = slot.otomatis ? nilaiOtomatis(slot.otomatis, formData) : ''
  }
  return hasil
}

/** True bila semua slot sudah terisi sehingga tombol "Pakai kalimat ini" berguna. */
export function narasiLengkap(template, nilaiSlot) {
  return template.slot.every((slot) => (nilaiSlot[slot.key] || '').trim() !== '')
}
