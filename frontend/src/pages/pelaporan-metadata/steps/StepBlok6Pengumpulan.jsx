import { Sparkles } from 'lucide-react'
import SaranPill from '../components/SaranPill'
import { getSaranUntukOpsi } from '../lib/saranHelper'

function StepBlok6Pengumpulan({ formData, updateBlok6, caraPengumpulan }) {
  const data = formData.blok6
  const saranUntuk = (field, opsi) => getSaranUntukOpsi(`blok6.${field}`, caraPengumpulan, opsi)

  const handleQualityToggle = (item) => {
    const list = data.metodePemeriksaanKualitas || []
    if (list.includes(item)) {
      updateBlok6('metodePemeriksaanKualitas', list.filter((i) => i !== item))
    } else {
      updateBlok6('metodePemeriksaanKualitas', [...list, item])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-grey-50 pb-3">
        <div>
          <h2 className="text-[18px] font-bold text-grey-300">VI. PENGUMPULAN DATA</h2>
          <p className="text-[13px] text-grey-100">Prosedur operasional lapangan, penjaminan kualitas data, dan profil petugas survei.</p>
        </div>
        {formData.aiPredictionsApplied && (
          <div className="flex items-center gap-1.5 rounded-full bg-lime-100 border border-lime-300 px-3 py-1 text-[11px] font-bold text-grey-300">
            <Sparkles size={14} className="text-lime-500" />
            <span>Prediksi AI Aktif</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        {/* 6.1. Uji Coba (Pilot Survey) */}
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            6.1. Apakah Melakukan Uji Coba (Pilot Survey)?
          </label>
          <div className="flex gap-6">
            {['Ya', 'Tidak'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="pilotSurvey"
                  value={opt}
                  checked={data.pilotSurvey === opt}
                  onChange={(e) => updateBlok6('pilotSurvey', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 6.2. Metode Pemeriksaan Kualitas */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            6.2. Metode Pemeriksaan Kualitas Pengumpulan Data:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {['Kunjungan Kembali', 'Supervisi', 'Task Force', 'Lainnya'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="checkbox"
                  checked={data.metodePemeriksaanKualitas?.includes(opt)}
                  onChange={() => handleQualityToggle(opt)}
                  className="size-4 rounded text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <SaranPill saran={saranUntuk('metodePemeriksaanKualitas', opt)} />
              </label>
            ))}
          </div>
        </div>

        {/* 6.3. Penyesuaian Nonrespon */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            6.3. Apakah Melakukan Penyesuaian Nonrespon?
          </label>
          <div className="flex gap-6">
            {['Ya', 'Tidak'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="penyesuaianNonrespon"
                  value={opt}
                  checked={data.penyesuaianNonrespon === opt}
                  onChange={(e) => updateBlok6('penyesuaianNonrespon', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <SaranPill saran={saranUntuk('penyesuaianNonrespon', opt)} />
              </label>
            ))}
          </div>
        </div>

        {/* 6.4. Petugas Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            6.4. Petugas Pengumpulan Data:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Staf Instansi Penyelenggara',
              'Mitra Atau Tenaga Kontrak',
              'Staf Instansi Penyelenggara Dan Mitra Atau Tenaga Kontrak',
            ].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="petugasPengumpulan"
                  value={opt}
                  checked={data.petugasPengumpulan === opt}
                  onChange={(e) => updateBlok6('petugasPengumpulan', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 6.5. Persyaratan Pendidikan Terendah Petugas */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            6.5. Persyaratan Pendidikan Terendah Petugas Pengumpulan Data:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Kurang Dari Atau Sama Dengan SMP',
              'SMA Atau SMK',
              'Diploma I Atau II Atau III',
              'Diploma IV Atau S1 Atau S2 Atau S3',
            ].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="persyaratanPendidikan"
                  value={opt}
                  checked={data.persyaratanPendidikan === opt}
                  onChange={(e) => updateBlok6('persyaratanPendidikan', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 6.6 Jumlah Petugas */}
        <div className="border-t border-grey-50 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-grey-300 mb-1">
              6.6. Jumlah Petugas: Supervisor / Penyelia / Pengawas
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="4"
                value={data.jumlahSupervisor}
                onChange={(e) => updateBlok6('jumlahSupervisor', e.target.value)}
                className="w-full rounded-xl border border-grey-75/60 px-4 py-2 text-[14px] text-grey-300 outline-none focus:border-grey-300"
              />
              <span className="shrink-0 text-[13px] font-medium text-grey-100">Orang</span>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-grey-300 mb-1">
              6.6. Jumlah Petugas: Pengumpul Data / Enumerator
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="16"
                value={data.jumlahEnumerator}
                onChange={(e) => updateBlok6('jumlahEnumerator', e.target.value)}
                className="w-full rounded-xl border border-grey-75/60 px-4 py-2 text-[14px] text-grey-300 outline-none focus:border-grey-300"
              />
              <span className="shrink-0 text-[13px] font-medium text-grey-100">Orang</span>
            </div>
          </div>
        </div>

        {/* 6.7. Pelatihan Petugas */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            6.7. Apakah Melakukan Pelatihan Petugas?
          </label>
          <div className="flex gap-6">
            {['Ya', 'Tidak'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="pelatihanPetugas"
                  value={opt}
                  checked={data.pelatihanPetugas === opt}
                  onChange={(e) => updateBlok6('pelatihanPetugas', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <SaranPill saran={saranUntuk('pelatihanPetugas', opt)} />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok6Pengumpulan
