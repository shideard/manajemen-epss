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
    setCurrentEditData({
      ...INITIAL_METADATA_FORM,
      id: `MSB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    })
    setViewMode('wizard')
  }

  const handleOpenEdit = (submission) => {
    // If it's a full form object, use it; otherwise adapt mock to full form
    setCurrentEditData({
      ...INITIAL_METADATA_FORM,
      id: submission.id,
      status: submission.status,
      halamanAwal: {
        ...INITIAL_METADATA_FORM.halamanAwal,
        judulKegiatan: submission.judulKegiatan || '',
        tahun: submission.tahun || new Date().getFullYear().toString(),
        caraPengumpulan: submission.caraPengumpulan || 'Survei',
      },
      aiPredictionsApplied: Boolean(submission.aiAssisted),
      aiConfidence: submission.aiAssisted ? '95%' : null,
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
        aiAssisted: savedForm.aiPredictionsApplied,
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
