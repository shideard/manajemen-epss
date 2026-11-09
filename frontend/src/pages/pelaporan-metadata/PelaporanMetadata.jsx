import { useState, useEffect } from 'react'
import DaftarMetadata from './DaftarMetadata'
import FormMetadataWizard from './FormMetadataWizard'
import {
  MOCK_METADATA_SUBMISSIONS,
  STORAGE_METADATA_KEY,
  INITIAL_METADATA_FORM,
} from './metadataData'

function loadSavedSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_METADATA_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse saved submissions', e)
  }
  return MOCK_METADATA_SUBMISSIONS
}

function PelaporanMetadata() {
  const [submissions, setSubmissions] = useState(loadSavedSubmissions)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'wizard'
  const [currentEditData, setCurrentEditData] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_METADATA_KEY, JSON.stringify(submissions))
    } catch (e) {
      console.error('Failed to save to localStorage', e)
    }
  }, [submissions])

  const handleOpenCreate = () => {
    // Form baru selalu dimulai dari keadaan kosong: tidak ada isian yang
    // dibawa dari draft sebelumnya maupun dari data contoh.
    setCurrentEditData({
      ...INITIAL_METADATA_FORM,
      id: `MSB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    })
    setViewMode('wizard')
  }

  const handleOpenEdit = (submission) => {
    // Draft lama disimpan sebagai form lengkap; entri contoh (mock) hanya punya
    // beberapa field ringkas. Keduanya digabung di ATAS kerangka kosong
    // supaya field yang tidak tersimpan tetap kosong, bukan terisi default.
    const { halamanAwal, blok1, ...sisa } = submission

    setCurrentEditData({
      ...INITIAL_METADATA_FORM,
      ...sisa,
      // Entri daftar menyimpan status sebagai status pengajuan ("Draft",
      // "Sedang diperiksa", ...), bukan status form. Jangan ditimpa.
      status: INITIAL_METADATA_FORM.status,
      // Penanda "dengan rekomendasi" di daftar bukan riwayat penerapan
      // per field, jadi tidak dibawa ke form.
      aiAssisted: undefined,
      halamanAwal: {
        ...INITIAL_METADATA_FORM.halamanAwal,
        ...halamanAwal,
        rekomendasiBps: halamanAwal?.rekomendasiBps ?? '',
        judulKegiatan: halamanAwal?.judulKegiatan ?? submission.judulKegiatan ?? '',
        tahun: halamanAwal?.tahun ?? submission.tahun ?? '',
        caraPengumpulan: halamanAwal?.caraPengumpulan ?? submission.caraPengumpulan ?? '',
        sektorKegiatan: halamanAwal?.sektorKegiatan ?? '',
      },
      blok1: {
        ...INITIAL_METADATA_FORM.blok1,
        ...blok1,
        instansiPenyelenggara:
          blok1?.instansiPenyelenggara ??
          submission.instansi ??
          INITIAL_METADATA_FORM.blok1.instansiPenyelenggara,
      },
    })
    setViewMode('wizard')
  }

  const handleSaveSuccess = (savedForm) => {
    setSubmissions((prev) => {
      const idx = prev.findIndex((s) => s.id === savedForm.id)
      const submissionEntry = {
        id: savedForm.id,
        judulKegiatan: savedForm.halamanAwal?.judulKegiatan || 'Kegiatan Statistik Baru',
        instansi: savedForm.blok1?.instansiPenyelenggara || 'Diskominfo Kota Bogor',
        tahun: savedForm.halamanAwal?.tahun || new Date().getFullYear().toString(),
        status: savedForm.status,
        caraPengumpulan: savedForm.halamanAwal?.caraPengumpulan || 'Survei',
        tanggalPengajuan: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        skorKelengkapan: '100%',
        aiAssisted: (savedForm.rekomendasiDiterapkan || []).length > 0,
      }

      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = submissionEntry
        return copy
      }
      return [submissionEntry, ...prev]
    })
    setViewMode('list')
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Page Title & Subtitle in EPSS Kota Bogor layout */}
      <div className="flex flex-col gap-[7px] leading-[1.2] text-heading">
        <h1 className="text-[31px] font-bold text-grey-300">
          Pelaporan Metadata Statistik Sektoral
        </h1>
        <p className="text-[18px] font-medium text-grey-100">
          Kelola formulir pengajuan Metadata Statistik Sektoral (MSB) terintegrasi dengan rekomendasi cerdas.
        </p>
      </div>

      {viewMode === 'list' ? (
        <DaftarMetadata
          submissions={submissions}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
        />
      ) : (
        <FormMetadataWizard
          initialData={currentEditData}
          onBack={() => setViewMode('list')}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  )
}

export default PelaporanMetadata
