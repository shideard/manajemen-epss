import { useMemo } from 'react'
import SaranPill from '../components/SaranPill'
import PanelRekomendasi from '../components/PanelRekomendasi'
import IstilahTooltip from '../components/IstilahTooltip'
import { getSaranUntukOpsi } from '../lib/saranHelper'
import { cariRekomendasi, rekomendasiUntukBlok } from '../lib/rekomendasiHelper'

// Label wizard -> id entri `kamusIstilah.js` (lihat alasan di Blok V).
const ID_TIPE_PENGUMPULAN = {
  'Longitudinal Panel': 'tipe-longitudinal-panel',
  'Longitudinal Cross Sectional': 'tipe-longitudinal-cross-sectional',
  'Cross Sectional': 'tipe-cross-sectional',
}

const ID_SARANA_PENGUMPULAN = {
  'Paper-assisted Personal Interviewing (PAPI)': 'papi',
  'Computer-assisted Personal Interviewing (CAPI)': 'capi',
  'Computer-assisted Telephones Interviewing (CATI)': 'cati',
  'Computer Aided Web Interviewing (CAWI)': 'cawi',
  Mail: 'mail',
}

// Hanya field yang memang ada di form Blok IV dan masuk cakupan rekomendasi.
const LABEL_REKOMENDASI = {
  frekuensiKegiatan: '4.1. Kegiatan Ini Dilakukan',
  tipePengumpulan: '4.3. Tipe Pengumpulan Data',
  cakupanWilayah: '4.4. Cakupan Wilayah',
  metodePengumpulan: '4.6. Metode Pengumpulan Data',
  saranaPengumpulan: '4.7. Sarana Pengumpulan Data',
  unitPengumpulan: '4.8. Unit Pengumpulan Data',
}

function StepBlok4Desain({ formData, updateBlok4, caraPengumpulan, onTerapkanRekomendasi }) {
  const data = formData.blok4
  const saranUntuk = (field, opsi) => getSaranUntukOpsi(`blok4.${field}`, caraPengumpulan, opsi)

  const rekomendasi = useMemo(
    () => cariRekomendasi(formData.halamanAwal?.judulKegiatan),
    [formData.halamanAwal?.judulKegiatan]
  )

  const items = useMemo(
    () =>
      rekomendasiUntukBlok(
        rekomendasi,
        (predictions) =>
          Object.fromEntries(
            Object.keys(LABEL_REKOMENDASI)
              .filter((key) => predictions[key] !== undefined)
              .map((key) => [key, predictions[key]])
          ),
        (key) => data[key]
      ).map((item) => ({
        ...item,
        label: LABEL_REKOMENDASI[item.fieldKey],
        diterapkan: (formData.rekomendasiDiterapkan || []).includes(`blok4.${item.fieldKey}`),
      })),
    [rekomendasi, data, formData.rekomendasiDiterapkan]
  )

  const handleCheckboxToggle = (field, item) => {
    const list = data[field] || []
    if (list.includes(item)) {
      updateBlok4(field, list.filter((i) => i !== item))
    } else {
      updateBlok4(field, [...list, item])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-grey-50 pb-3">
        <div>
          <h2 className="text-[18px] font-bold text-grey-300">IV. DESAIN KEGIATAN</h2>
          <p className="text-[13px] text-grey-100">Karakteristik pelaksanaan, tipe pendekatan, metode survei, dan unit observasi.</p>
        </div>
      </div>

      <PanelRekomendasi
        judulKegiatan={(formData.halamanAwal?.judulKegiatan || '').trim()}
        rekomendasi={rekomendasi}
        items={items}
        onTerapkan={(fieldKey, nilai) =>
          onTerapkanRekomendasi(fieldKey, nilai, LABEL_REKOMENDASI[fieldKey])
        }
      />

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        {/* 4.1. Kegiatan Ini Dilakukan */}
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.1. Kegiatan Ini Dilakukan:
          </label>
          <div className="flex gap-6">
            {['Hanya Sekali', 'Berulang'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="frekuensiKegiatan"
                  value={opt}
                  checked={data.frekuensiKegiatan === opt}
                  onChange={(e) => updateBlok4('frekuensiKegiatan', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <SaranPill saran={saranUntuk('frekuensiKegiatan', opt)} />
              </label>
            ))}
          </div>
        </div>

        {/* 4.2. Frekuensi Penyelenggaraan (hanya jika 4.1 = Berulang) */}
        {data.frekuensiKegiatan === 'Berulang' && (
          <div className="border-t border-grey-50 pt-5">
            <label className="block text-[14px] font-bold text-grey-300 mb-2">
              4.2. Frekuensi Penyelenggaraan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                'Harian',
                'Minggu',
                'Bulanan',
                'Triwulanan',
                'Empat Bulanan',
                'Semesteran',
                'Tahunan',
                'Lebih Dari Dua Tahunan',
              ].map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                  <input
                    type="radio"
                    name="frekuensiPenyelenggaraan"
                    value={opt}
                    checked={data.frekuensiPenyelenggaraan === opt}
                    onChange={(e) => updateBlok4('frekuensiPenyelenggaraan', e.target.value)}
                    className="size-4 text-grey-300 focus:ring-lime-300"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 4.3. Tipe Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.3. Tipe Pengumpulan Data:
          </label>
          <div className="flex flex-wrap gap-6">
            {['Longitudinal Panel', 'Longitudinal Cross Sectional', 'Cross Sectional'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="tipePengumpulan"
                  value={opt}
                  checked={data.tipePengumpulan === opt}
                  onChange={(e) => updateBlok4('tipePengumpulan', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <IstilahTooltip id={ID_TIPE_PENGUMPULAN[opt]} />
                <SaranPill saran={saranUntuk('tipePengumpulan', opt)} />
              </label>
            ))}
          </div>
        </div>

        {/* 4.4. Cakupan Wilayah Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.4. Cakupan Wilayah Pengumpulan Data:
          </label>
          <p className="text-[12px] text-grey-100 mb-2">
            Cukup 1 kabupaten/kota di Indonesia yang tidak tercakup, cakupan sudah dianggap
            sebagian wilayah Indonesia. Untuk kegiatan yang cakupannya kecamatan atau kelurahan,
            pada 4.5 cukup ditulis nama kabupaten/kota saja.
          </p>
          <div className="flex flex-wrap gap-6">
            {['Seluruh Wilayah Indonesia', 'Sebagian Wilayah Indonesia'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="radio"
                  name="cakupanWilayah"
                  value={opt}
                  checked={data.cakupanWilayah === opt}
                  onChange={(e) => updateBlok4('cakupanWilayah', e.target.value)}
                  className="size-4 text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <SaranPill saran={saranUntuk('cakupanWilayah', opt)} />
              </label>
            ))}
          </div>
        </div>

        {/* 4.6. Metode Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.6. Metode Pengumpulan Data:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Wawancara',
              'Mengisi Kuesioner Sendiri',
              'Pengamatan',
              'Pengumpulan Data Sekunder',
              'Lainnya',
            ].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="checkbox"
                  checked={data.metodePengumpulan?.includes(opt)}
                  onChange={() => handleCheckboxToggle('metodePengumpulan', opt)}
                  className="size-4 rounded text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <SaranPill saran={saranUntuk('metodePengumpulan', opt)} />
              </label>
            ))}
          </div>
        </div>

        {/* 4.7. Sarana Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.7. Sarana Pengumpulan Data:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Paper-assisted Personal Interviewing (PAPI)',
              'Computer-assisted Personal Interviewing (CAPI)',
              'Computer-assisted Telephones Interviewing (CATI)',
              'Computer Aided Web Interviewing (CAWI)',
              'Mail',
              'Lainnya',
            ].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="checkbox"
                  checked={data.saranaPengumpulan?.includes(opt)}
                  onChange={() => handleCheckboxToggle('saranaPengumpulan', opt)}
                  className="size-4 rounded text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                {/* "Lainnya" tidak punya definisi di PDF, jadi tidak diberi ikon. */}
                <IstilahTooltip id={ID_SARANA_PENGUMPULAN[opt]} />
              </label>
            ))}
          </div>
        </div>

        {/* 4.8. Unit Pengumpulan Data */}
        <div className="border-t border-grey-50 pt-5">
          <label className="block text-[14px] font-bold text-grey-300 mb-2">
            4.8. Unit Pengumpulan Data:
            <IstilahTooltip id="unit-pengumpulan" className="ml-1.5" />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {['Individu', 'Rumah Tangga', 'Usaha/Perusahaan', 'Lainnya'].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-[14px] font-medium text-grey-200">
                <input
                  type="checkbox"
                  checked={data.unitPengumpulan?.includes(opt)}
                  onChange={() => handleCheckboxToggle('unitPengumpulan', opt)}
                  className="size-4 rounded text-grey-300 focus:ring-lime-300"
                />
                <span>{opt}</span>
                <SaranPill saran={saranUntuk('unitPengumpulan', opt)} />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok4Desain
