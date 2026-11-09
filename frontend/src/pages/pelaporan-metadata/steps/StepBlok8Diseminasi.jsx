import { useMemo } from 'react'
import SaranPill from '../components/SaranPill'
import PanelRekomendasi from '../components/PanelRekomendasi'
import { getSaranUntukOpsi } from '../lib/saranHelper'
import { cariRekomendasi, rekomendasiUntukBlok } from '../lib/rekomendasiHelper'

const LABEL_REKOMENDASI = {
  produkUmum: '8.1. Produk Kegiatan untuk Umum',
}

const LABEL_PRODUK = {
  tercetak: 'Tercetak',
  digital: 'Digital',
  dataMikro: 'Data Mikro',
}

function StepBlok8Diseminasi({ formData, updateBlok8, caraPengumpulan, onTerapkanRekomendasi }) {
  const data = formData.blok8
  const saranUntuk = (field, opsi) => getSaranUntukOpsi(`blok8.produkUmum.${field}`, caraPengumpulan, opsi)

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
        diterapkan: (formData.rekomendasiDiterapkan || []).includes(`blok8.${item.fieldKey}`),
      })),
    [rekomendasi, data, formData.rekomendasiDiterapkan]
  )

  const handleProdukToggle = (key, value) => {
    updateBlok8('produkUmum', {
      ...data.produkUmum,
      [key]: value,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-grey-50 pb-3">
        <div>
          <h2 className="text-[18px] font-bold text-grey-300">VIII. DISEMINASI HASIL</h2>
          <p className="text-[13px] text-grey-100">Bentuk produk penyebarluasan publikasi atau output statistik untuk umum.</p>
        </div>
      </div>

      <PanelRekomendasi
        judulKegiatan={(formData.halamanAwal?.judulKegiatan || '').trim()}
        rekomendasi={rekomendasi}
        items={items}
        labelNilai={LABEL_PRODUK}
        onTerapkan={(fieldKey, nilai) =>
          onTerapkanRekomendasi(fieldKey, nilai, LABEL_REKOMENDASI[fieldKey])
        }
      />

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-3">
            8.1. Produk Kegiatan yang Tersedia untuk Umum:
          </label>
          <div className="flex flex-col gap-3.5 max-w-md">
            {[
              { key: 'tercetak', label: 'Tercetak (Hardcopy)' },
              { key: 'digital', label: 'Digital (Softcopy)' },
              { key: 'dataMikro', label: 'Data Mikro' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4 py-1 border-b border-grey-50/70 last:border-0">
                <span className="text-[14px] text-grey-300">{label}</span>
                <div className="flex gap-4">
                  {['Ya', 'Tidak'].map((val) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer text-[13px] font-medium text-grey-200">
                      <input
                        type="radio"
                        name={`produk_${key}`}
                        value={val}
                        checked={data.produkUmum?.[key] === val}
                        onChange={() => handleProdukToggle(key, val)}
                        className="size-4 text-grey-300 focus:ring-lime-300"
                      />
                      <span>{val}</span>
                      <SaranPill saran={saranUntuk(key, val)} />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok8Diseminasi
