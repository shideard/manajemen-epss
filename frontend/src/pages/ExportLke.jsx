import { useState } from 'react'
import { useBukti, usePeriode, useSemuaKegiatan, useSkor } from '../lib/store'
import { unduh } from '../lib/api'
import { berkasKegiatan, lkeCsv, pemetaanBukti } from '../lib/epss'
import { Memuat, PageHeader } from '../components/ui'
import { buttonClass } from '../components/classes'

function simpan(nama, blob) {
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: nama })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url))
}

function ExportCard({ title, description, button, onClick }) {
  return (
    <section className="flex flex-col items-center gap-6 rounded-lg bg-white px-6 py-8">
      <div className="flex w-full flex-col gap-2">
        <h2 className="text-h3">{title}</h2>
        <p className="text-grey-200">{description}</p>
      </div>
      <button type="button" onClick={onClick} className={`w-full ${buttonClass('secondary')}`}>
        {button}
      </button>
    </section>
  )
}

function ExportLke() {
  const { aktif } = usePeriode()
  const muat = [useSemuaKegiatan(aktif?.id), useSkor(), useBukti()]
  const [{ kegiatan }, { levels }, { bukti }] = muat
  const [pesan, setPesan] = useState('')
  const [menyiapkan, setMenyiapkan] = useState(false)

  function unduhLke() {
    const namaKegiatan = Object.fromEntries(kegiatan.map((k) => [k.id, k.nama]))
    // BOM agar Excel membaca UTF-8 dengan benar
    simpan(`LKE-EPSS-${aktif.tahun1}-${aktif.tahun2}.csv`, new Blob(['﻿', lkeCsv(levels, pemetaanBukti(kegiatan, bukti), berkasKegiatan(kegiatan, aktif.id), namaKegiatan)], { type: 'text/csv;charset=utf-8' }))
  }

  // Server menyusun ZIP Domain/Indikator/Kegiatan/berkas dari berkas bukti terbaru periode aktif
  async function unduhZip() {
    setPesan('')
    setMenyiapkan(true)
    try {
      simpan(`Bukti-EPSS-${aktif.tahun1}-${aktif.tahun2}.zip`, await unduh(`/api/periode-evaluasi/${aktif.id}/ekspor-bukti`))
    } catch (error) {
      setPesan(error.message || 'Paket ZIP gagal diunduh.')
    } finally {
      setMenyiapkan(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} bentuk="daftar" />
      <PageHeader
        title="Ekspor Lembar Kerja Evaluasi dan Bukti Dukung yang Terstruktur"
        subtitle="Hasilkan format resmi pelaporan BPS untuk keperluan penilaian Tim Penilai Internal (TPI) dan Tim Penilai Evaluasi Penyelenggaraan Statistik Sektoral (TPSS)."
      />

      <div className="flex flex-col gap-5">
        <ExportCard
          title="Ekspor Format Lembar Kerja Evaluasi"
          description="Merekap nilai indikator, tingkat kematangan, uraian bukti dukung, dan catatan verifikator sesuai format LKE BPS."
          button="Unduh LKE Resmi"
          onClick={unduhLke}
        />
        <ExportCard
          title="Ekspor Paket Arsip Berkas Bukti Terstruktur"
          description="Mengompres berkas bukti dukung terbaru periode aktif ke dalam struktur folder Domain/Indikator/Kegiatan."
          button={menyiapkan ? 'Menyiapkan Paket ZIP…' : 'Unduh Paket ZIP'}
          onClick={unduhZip}
        />
        {pesan && (
          <p role="status" className="text-small text-grey-200">
            {pesan}
          </p>
        )}
      </div>
    </div>
  )
}

export default ExportLke
