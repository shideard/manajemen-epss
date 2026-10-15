import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Sparkles,
  Check,
} from 'lucide-react'
import StepHalamanAwal from './steps/StepHalamanAwal'
import StepBlok1Penyelenggara from './steps/StepBlok1Penyelenggara'
import StepBlok2PenanggungJawab from './steps/StepBlok2PenanggungJawab'
import StepBlok3Perencanaan from './steps/StepBlok3Perencanaan'
import StepBlok4Desain from './steps/StepBlok4Desain'
import StepBlok6Pengumpulan from './steps/StepBlok6Pengumpulan'
import StepBlok7Pengolahan from './steps/StepBlok7Pengolahan'
import StepBlok8Diseminasi from './steps/StepBlok8Diseminasi'
import StepRingkasan from './steps/StepRingkasan'
import { INITIAL_METADATA_FORM } from './metadataData'

const STEPS = [
  { id: 'awal', label: 'Halaman Awal' },
  { id: 'blok1', label: 'Blok I' },
  { id: 'blok2', label: 'Blok II' },
  { id: 'blok3', label: 'Blok III' },
  { id: 'blok4', label: 'Blok IV' },
  { id: 'blok6', label: 'Blok VI' },
  { id: 'blok7', label: 'Blok VII' },
  { id: 'blok8', label: 'Blok VIII' },
  { id: 'ringkasan', label: 'Ringkasan' },
]

function FormMetadataWizard({ initialData, onBack, onSaveSuccess }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState(initialData || INITIAL_METADATA_FORM)
  const [toastMessage, setToastMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // State Updaters
  const updateHalamanAwal = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      halamanAwal: { ...prev.halamanAwal, [field]: val },
    }))
  }

  const updateBlok1 = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      blok1: { ...prev.blok1, [field]: val },
    }))
  }

  const updateBlok2 = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      blok2: { ...prev.blok2, [field]: val },
    }))
  }

  const updateBlok3 = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      blok3: { ...prev.blok3, [field]: val },
    }))
  }

  const updateBlok4 = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      blok4: { ...prev.blok4, [field]: val },
    }))
  }

  const updateBlok6 = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      blok6: { ...prev.blok6, [field]: val },
    }))
  }

  const updateBlok7 = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      blok7: { ...prev.blok7, [field]: val },
    }))
  }

  const updateBlok8 = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      blok8: { ...prev.blok8, [field]: val },
    }))
  }

  // AI Prediction Trigger
  const applyPrediction = (preset) => {
    const { predictions, confidence } = preset
    setFormData((prev) => ({
      ...prev,
      halamanAwal: {
        ...prev.halamanAwal,
        judulKegiatan: preset.sampleTitle || prev.halamanAwal.judulKegiatan,
        caraPengumpulan: predictions.caraPengumpulan || prev.halamanAwal.caraPengumpulan,
        sektorKegiatan: predictions.sektorKegiatan || prev.halamanAwal.sektorKegiatan,
      },
      blok4: {
        ...prev.blok4,
        frekuensiKegiatan: predictions.frekuensiKegiatan || prev.blok4.frekuensiKegiatan,
        tipePengumpulan: predictions.tipePengumpulan || prev.blok4.tipePengumpulan,
        cakupanWilayah: predictions.cakupanWilayah || prev.blok4.cakupanWilayah,
        metodePengumpulan: predictions.metodePengumpulan || prev.blok4.metodePengumpulan,
        saranaPengumpulan: predictions.saranaPengumpulan || prev.blok4.saranaPengumpulan,
        unitPengumpulan: predictions.unitPengumpulan || prev.blok4.unitPengumpulan,
      },
      blok6: {
        ...prev.blok6,
        pilotSurvey: predictions.pilotSurvey || prev.blok6.pilotSurvey,
        metodePemeriksaanKualitas:
          predictions.metodePemeriksaanKualitas || prev.blok6.metodePemeriksaanKualitas,
        penyesuaianNonrespon:
          predictions.penyesuaianNonrespon || prev.blok6.penyesuaianNonrespon,
      },
      blok7: {
        ...prev.blok7,
        tahapanPengolahan: predictions.tahapanPengolahan || prev.blok7.tahapanPengolahan,
        metodeAnalisis: predictions.metodeAnalisis || prev.blok7.metodeAnalisis,
        unitAnalisis: predictions.unitAnalisis || prev.blok7.unitAnalisis,
        tingkatPenyajian: predictions.tingkatPenyajian || prev.blok7.tingkatPenyajian,
      },
      blok8: {
        ...prev.blok8,
        produkUmum: predictions.produkUmum || prev.blok8.produkUmum,
      },
      aiPredictionsApplied: true,
      aiConfidence: confidence,
      predictedFields: preset.predictedFieldsList || [],
    }))

    showToast(
      `✨ Model AI Berhasil: 14 atribut pilihan pada Blok IV, VI, VII, dan VIII telah terisi otomatis (Akurasi ${confidence})!`,
      'success'
    )
  }

  const handleSaveDraft = () => {
    const saved = {
      ...formData,
      id: formData.id || `MSB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Draft',
      updatedAt: new Date().toISOString(),
    }
    showToast('Formulir berhasil disimpan sebagai Draft sementara!', 'success')
    if (onSaveSuccess) onSaveSuccess(saved)
  }

  const handleSubmitForm = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      const submitted = {
        ...formData,
        id: formData.id || `MSB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        status: 'Sedang diperiksa',
        updatedAt: new Date().toISOString(),
      }
      setIsSubmitting(false)
      showToast('Laporan Metadata Berhasil Disubmit ke Walidata!', 'success')
      if (onSaveSuccess) onSaveSuccess(submitted)
    }, 900)
  }

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-grey-300 px-5 py-3.5 text-white shadow-2xl border border-lime-300 animate-bounce">
          <Sparkles size={20} className="text-lime-300 shrink-0" />
          <span className="text-[13px] font-medium leading-snug">{toastMessage.msg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-grey-50 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex size-10 items-center justify-center rounded-xl bg-grey2-75 text-grey-200 hover:bg-grey-50 hover:text-black transition"
            title="Kembali ke Daftar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[22px] font-bold text-grey-300">Lapor Metadata Kegiatan Baru</h1>
              <span className="rounded-full bg-grey-50 px-2.5 py-0.5 text-[11px] font-bold text-grey-200 border border-grey-75/40">
                Status: {formData.status || 'Draft'}
              </span>
            </div>
            <p className="text-[13px] text-grey-100">
              Harap baca panduan terlebih dahulu, agar pelaporan kegiatan statistik Anda dapat menjadi lebih mudah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 rounded-full border border-grey-75 bg-white px-4 py-2 text-[13px] font-semibold text-grey-300 hover:bg-grey2-75 transition"
          >
            <Save size={16} />
            Simpan Sementara
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentStepIndex !== STEPS.length - 1) {
                setCurrentStepIndex(STEPS.length - 1)
              } else {
                handleSubmitForm()
              }
            }}
            className="flex items-center gap-1.5 rounded-full bg-grey-300 px-5 py-2 text-[13px] font-bold text-lime-300 shadow hover:bg-grey-500 transition"
          >
            <Send size={16} />
            {currentStepIndex === STEPS.length - 1 ? 'Submit Laporan' : 'Periksa & Submit'}
          </button>
        </div>
      </div>

      {/* Modern Stepper Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-grey2-75 border border-grey-50 no-scrollbar">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStepIndex
          const isPassed = idx < currentStepIndex

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition ${
                isActive
                  ? 'bg-grey-300 text-lime-300 shadow-sm'
                  : isPassed
                  ? 'bg-white text-grey-300 hover:bg-grey-50'
                  : 'text-grey-100 hover:text-grey-300 hover:bg-white/60'
              }`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-lime-300 text-grey-500'
                    : isPassed
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-grey-50 text-grey-100'
                }`}
              >
                {isPassed ? <Check size={12} /> : idx + 1}
              </span>
              <span>{step.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main Step Body */}
      <div className="min-h-[460px]">
        {currentStepIndex === 0 && (
          <StepHalamanAwal
            formData={formData}
            updateHalamanAwal={updateHalamanAwal}
            applyPrediction={applyPrediction}
          />
        )}
        {currentStepIndex === 1 && (
          <StepBlok1Penyelenggara formData={formData} updateBlok1={updateBlok1} />
        )}
        {currentStepIndex === 2 && (
          <StepBlok2PenanggungJawab formData={formData} updateBlok2={updateBlok2} />
        )}
        {currentStepIndex === 3 && (
          <StepBlok3Perencanaan formData={formData} updateBlok3={updateBlok3} />
        )}
        {currentStepIndex === 4 && (
          <StepBlok4Desain formData={formData} updateBlok4={updateBlok4} />
        )}
        {currentStepIndex === 5 && (
          <StepBlok6Pengumpulan formData={formData} updateBlok6={updateBlok6} />
        )}
        {currentStepIndex === 6 && (
          <StepBlok7Pengolahan formData={formData} updateBlok7={updateBlok7} />
        )}
        {currentStepIndex === 7 && (
          <StepBlok8Diseminasi formData={formData} updateBlok8={updateBlok8} />
        )}
        {currentStepIndex === 8 && (
          <StepRingkasan
            formData={formData}
            onSaveDraft={handleSaveDraft}
            onSubmitForm={handleSubmitForm}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-grey-50 pt-5 mt-2">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 rounded-full border border-grey-75 bg-white px-5 py-2.5 text-[13px] font-bold text-grey-300 hover:bg-grey2-75 transition disabled:opacity-40 disabled:pointer-events-none"
        >
          <ArrowLeft size={16} />
          Sebelumnya
        </button>

        <span className="text-[13px] text-grey-100 font-medium">
          Langkah <strong className="text-grey-300">{currentStepIndex + 1}</strong> dari {STEPS.length}
        </span>

        {currentStepIndex < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 rounded-full bg-grey-300 px-6 py-2.5 text-[13px] font-bold text-lime-300 shadow hover:bg-grey-500 transition"
          >
            Selanjutnya
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitForm}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-grey-300 px-6 py-2.5 text-[13px] font-bold text-lime-300 shadow-md hover:bg-grey-500 transition disabled:opacity-50"
          >
            <Send size={16} />
            {isSubmitting ? 'Mengirim...' : 'Submit Laporan'}
          </button>
        )}
      </div>
    </div>
  )
}

export default FormMetadataWizard
