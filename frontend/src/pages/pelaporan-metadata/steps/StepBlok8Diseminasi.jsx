import { useMemo, useState } from 'react'
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

// Urutan baris tabel 8.2, mengikuti urutan 8.1 di atasnya.
const BARIS_PENERBITAN = [
  { key: 'tercetak', label: 'Tercetak (Hardcopy)' },
  { key: 'digital', label: 'Digital (Softcopy)' },
  { key: 'dataMikro', label: 'Data Mikro' },
]

function StepBlok8Diseminasi({ formData, updateBlok8, caraPengumpulan, onTerapkanRekomendasi }) {
  const data = formData.blok8
  const saranUntuk = (field, opsi) => getSaranUntukOpsi(`blok8.produkUmum.${field}`, caraPengumpulan, opsi)
  // Penanda "sudah disentuh" supaya border merah tidak muncul sebelum pengguna
  // sempat mengisi apa pun (pola yang sama dengan `jadwalTouched` di 3.3).
  const [penerbitanTouched, setPenerbitanTouched] = useState({})

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
    // 8.2 hanya berlaku untuk produk yang tersedia untuk umum. Saat jawaban
    // diubah menjadi "Tidak", tanggal rencananya ikut dikosongkan agar tidak
    // terbawa ke ringkasan maupun saat disimpan. `produkUmum` dan
    // `penerbitan` ditulis lewat satu pemanggilan supaya tidak saling timpa.
    const penerbitanLama = data.penerbitan || {}
    updateBlok8('produkUmum', { ...data.produkUmum, [key]: value }, {
      penerbitan: value === 'Ya' ? penerbitanLama : { ...penerbitanLama, [key]: '' },
    })

    if (value !== 'Ya') {
      setPenerbitanTouched((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handlePenerbitanChange = (key, value) => {
    updateBlok8('penerbitan', { ...(data.penerbitan || {}), [key]: value })
    setPenerbitanTouched((prev) => ({ ...prev, [key]: true }))
  }

  const adaProdukUmum = useMemo(
    () => BARIS_PENERBITAN.some(({ key }) => data.produkUmum?.[key] === 'Ya'),
    [data.produkUmum]
  )

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

        {adaProdukUmum && (
          <div>
            <label className="block text-[14px] font-bold text-grey-300">
              8.2. Rencana Penerbitan Publikasi:
            </label>
            <p className="text-[12px] text-grey-100 mt-1 mb-3">
              Tuliskan waktu rencana penerbitan publikasi sesuai kode produk yang dipilih pada 8.1.
            </p>
            <div className="overflow-x-auto rounded-xl border border-grey-50">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-grey2-75 text-grey-300 font-semibold border-b border-grey-50">
                  <tr>
                    <th className="py-2.5 px-3">Produk Publikasi</th>
                    <th className="py-2.5 px-3 w-28 text-center">Status 8.1</th>
                    <th className="py-2.5 px-3 w-56">Tanggal Rencana Terbit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-50">
                  {BARIS_PENERBITAN.map(({ key, label }) => {
                    const status = data.produkUmum?.[key]
                    const dipilih = status === 'Ya'
                    const tanggal = data.penerbitan?.[key] || ''
                    const wajibTanggal = dipilih && Boolean(penerbitanTouched[key]) && !tanggal

                    return (
                      <tr key={key} className={dipilih ? 'hover:bg-grey2-75/40' : 'bg-grey2-75/20'}>
                        <td className={`py-2 px-3 ${dipilih ? 'font-medium text-grey-300' : 'text-grey-100'}`}>
                          {label}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              dipilih
                                ? 'bg-lime-100 text-lime-700'
                                : status === 'Tidak'
                                  ? 'bg-grey2-100 text-grey-100'
                                  : 'bg-grey2-100 text-grey-75'
                            }`}
                          >
                            {status || '–'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {dipilih ? (
                            <>
                              <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => handlePenerbitanChange(key, e.target.value)}
                                aria-label={`Tanggal rencana terbit ${label}`}
                                className={`w-full rounded-lg border px-2 py-1.5 text-[13px] text-grey-300 outline-none ${
                                  wajibTanggal ? 'border-red-400' : 'border-grey-75/50 focus:border-grey-300'
                                }`}
                              />
                              {wajibTanggal && (
                                <p className="text-[10px] text-red-500 mt-0.5">Tanggal rencana terbit belum diisi</p>
                              )}
                            </>
                          ) : (
                            <span className="text-grey-75">–</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StepBlok8Diseminasi
