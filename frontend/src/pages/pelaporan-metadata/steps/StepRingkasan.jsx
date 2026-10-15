import { CheckCircle2, Sparkles, Building, User, Calendar, Sliders, Database, Layers, Send } from 'lucide-react'

function SummaryItem({ label, value }) {
  const displayValue = Array.isArray(value)
    ? value.length > 0
      ? value.join(', ')
      : '-'
    : value || '-'

  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between py-2 border-b border-grey-50/70 text-[13px] gap-1">
      <span className="text-grey-100 font-medium">{label}</span>
      <span className="text-grey-300 font-semibold text-right">{displayValue}</span>
    </div>
  )
}

function StepRingkasan({ formData, onSaveDraft, onSubmitForm, isSubmitting }) {
  const { halamanAwal, blok1, blok2, blok3, blok4, blok6, blok7, blok8 } = formData

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-grey-50 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-grey-300">RINGKASAN PELAPORAN METADATA</h2>
          <p className="text-[13px] text-grey-100">
            Periksa kembali seluruh isian formulir sebelum melakukan pengajuan (Submit) ke Walidata / Pembina Data BPS.
          </p>
        </div>

        {formData.aiPredictionsApplied && (
          <div className="flex items-center gap-1.5 rounded-full bg-lime-100 border border-lime-300 px-3.5 py-1.5 text-[12px] font-bold text-grey-300 shadow-xs">
            <Sparkles size={15} className="text-lime-500" />
            <span>Prediksi AI Diterapkan ({formData.aiConfidence})</span>
          </div>
        )}
      </div>

      {/* Ringkasan Halaman Awal */}
      <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-grey-300 font-bold text-[15px]">
          <Sliders size={18} className="text-lime-500" />
          <span>Informasi Dasar Kegiatan</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <SummaryItem label="Judul Kegiatan" value={halamanAwal.judulKegiatan} />
          <SummaryItem label="Tahun Kegiatan" value={halamanAwal.tahun} />
          <SummaryItem label="Cara Pengumpulan Data" value={halamanAwal.caraPengumpulan} />
          <SummaryItem label="Sektor Kegiatan" value={halamanAwal.sektorKegiatan} />
          <SummaryItem label="Rekomendasi BPS" value={halamanAwal.rekomendasiBps} />
        </div>
      </div>

      {/* Ringkasan Blok I & II */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-grey-300 font-bold text-[15px]">
            <Building size={18} className="text-lime-500" />
            <span>I. Penyelenggara</span>
          </div>
          <SummaryItem label="Instansi Penyelenggara" value={blok1.instansiPenyelenggara} />
          <SummaryItem label="Alamat" value={blok1.alamat} />
          <SummaryItem label="Telepon" value={blok1.telepon} />
          <SummaryItem label="Email" value={blok1.email} />
        </div>

        <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-grey-300 font-bold text-[15px]">
            <User size={18} className="text-lime-500" />
            <span>II. Penanggung Jawab</span>
          </div>
          <SummaryItem label="Eselon 1" value={blok2.eselon1} />
          <SummaryItem label="Eselon 2" value={blok2.eselon2} />
          <SummaryItem label="Penanggung Jawab Teknis" value={blok2.teknisNama} />
          <SummaryItem label="Jabatan Teknis" value={blok2.teknisJabatan} />
          <SummaryItem label="Email Teknis" value={blok2.teknisEmail} />
        </div>
      </div>

      {/* Ringkasan Blok III */}
      <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-grey-300 font-bold text-[15px]">
          <Calendar size={18} className="text-lime-500" />
          <span>III. Perencanaan & Persiapan</span>
        </div>
        <div className="flex flex-col gap-3">
          <SummaryItem label="Latar Belakang" value={blok3.latarBelakang} />
          <SummaryItem label="Tujuan" value={blok3.tujuan} />
          <div>
            <span className="text-grey-100 font-medium text-[13px] block mb-2">Jadwal Tahapan:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {blok3.jadwal.map((j, idx) => (
                <div key={idx} className="rounded-lg bg-grey2-75 p-2.5 text-[12px]">
                  <p className="font-semibold text-grey-300">{j.tahapan}</p>
                  <p className="text-grey-100">{j.mulai} s.d. {j.selesai}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <span className="text-grey-100 font-medium text-[13px] block mb-2">
              Variabel yang Dikumpulkan ({blok3.variabel.length} Variabel):
            </span>
            <div className="flex flex-wrap gap-2">
              {blok3.variabel.map((v, idx) => (
                <span key={idx} className="rounded-lg border border-grey-50 bg-grey2-75/60 px-3 py-1 text-[12px] font-medium text-grey-300">
                  {v.nama || `Variabel #${idx + 1}`}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan Blok IV & VI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-grey-300 font-bold text-[15px]">
            <Sliders size={18} className="text-lime-500" />
            <span>IV. Desain Kegiatan</span>
          </div>
          <SummaryItem label="Frekuensi Pelaksanaan" value={blok4.frekuensiKegiatan} />
          <SummaryItem label="Tipe Pengumpulan" value={blok4.tipePengumpulan} />
          <SummaryItem label="Cakupan Wilayah" value={blok4.cakupanWilayah} />
          <SummaryItem label="Metode Pengumpulan" value={blok4.metodePengumpulan} />
          <SummaryItem label="Sarana Pengumpulan" value={blok4.saranaPengumpulan} />
          <SummaryItem label="Unit Pengumpulan" value={blok4.unitPengumpulan} />
        </div>

        <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-grey-300 font-bold text-[15px]">
            <Layers size={18} className="text-lime-500" />
            <span>VI. Pengumpulan Data</span>
          </div>
          <SummaryItem label="Uji Coba (Pilot Survey)" value={blok6.pilotSurvey} />
          <SummaryItem label="Metode Pemeriksaan Kualitas" value={blok6.metodePemeriksaanKualitas} />
          <SummaryItem label="Penyesuaian Nonrespon" value={blok6.penyesuaianNonrespon} />
          <SummaryItem label="Petugas Pengumpulan" value={blok6.petugasPengumpulan} />
          <SummaryItem label="Supervisor" value={blok6.jumlahSupervisor} />
          <SummaryItem label="Enumerator" value={blok6.jumlahEnumerator} />
          <SummaryItem label="Pelatihan Petugas" value={blok6.pelatihanPetugas} />
        </div>
      </div>

      {/* Ringkasan Blok VII & VIII */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-grey-300 font-bold text-[15px]">
            <Database size={18} className="text-lime-500" />
            <span>VII. Pengolahan & Analisis</span>
          </div>
          <SummaryItem
            label="Tahapan Pengolahan"
            value={Object.entries(blok7.tahapanPengolahan || {})
              .filter(([, v]) => v === 'Ya')
              .map(([k]) => k.toUpperCase())}
          />
          <SummaryItem label="Metode Analisis" value={blok7.metodeAnalisis} />
          <SummaryItem label="Unit Analisis" value={blok7.unitAnalisis} />
          <SummaryItem label="Tingkat Penyajian" value={blok7.tingkatPenyajian} />
        </div>

        <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-grey-300 font-bold text-[15px]">
            <CheckCircle2 size={18} className="text-lime-500" />
            <span>VIII. Diseminasi Hasil</span>
          </div>
          <SummaryItem label="Produk Tercetak (Hardcopy)" value={blok8.produkUmum?.tercetak} />
          <SummaryItem label="Produk Digital (Softcopy)" value={blok8.produkUmum?.digital} />
          <SummaryItem label="Data Mikro" value={blok8.produkUmum?.dataMikro} />
        </div>
      </div>

      {/* Confirmation & Submit Actions */}
      <div className="rounded-2xl border border-lime-300 bg-lime-100/50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-[15px] font-bold text-grey-300">Sudah Memastikan Semua Data Sesuai?</h4>
          <p className="text-[13px] text-grey-100 mt-0.5">
            Formulir yang disubmit akan dikirimkan ke antrean verifikasi Walidata dan Pembina Data Statistik BPS Kota Bogor.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onSaveDraft}
            className="rounded-full border border-grey-75 bg-white px-5 py-2.5 text-[13px] font-bold text-grey-300 hover:bg-grey2-75 transition"
          >
            Simpan Draft
          </button>
          <button
            type="button"
            onClick={onSubmitForm}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-grey-300 px-6 py-2.5 text-[13px] font-bold text-lime-300 shadow-md hover:bg-grey-500 transition disabled:opacity-50"
          >
            <Send size={16} />
            {isSubmitting ? 'Mengirim...' : 'Submit Laporan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StepRingkasan
