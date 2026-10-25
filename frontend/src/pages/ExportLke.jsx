import { useState } from 'react'
import { useBerkas, useBukti, useKegiatan, usePeriode, useSkor } from '../lib/store'
import { lkeCsv } from '../lib/epss'
import { Memuat, PageHeader } from '../components/ui'
import { buttonClass } from '../components/classes'

function unduh(nama, isi) {
  // BOM agar Excel membaca UTF-8 dengan benar
  const url = URL.createObjectURL(new Blob(['﻿', isi], { type: 'text/csv;charset=utf-8' }))
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
  const muat = [useKegiatan(), useSkor(), useBukti(), useBerkas()]
  const [{ kegiatan }, { levels }, { bukti }, { berkas }] = muat
  const [pesan, setPesan] = useState('')

  function unduhLke() {
    const namaKegiatan = Object.fromEntries(kegiatan.map((k) => [k.id, k.nama]))
    unduh(`LKE-EPSS-${aktif.tahun1}-${aktif.tahun2}.csv`, lkeCsv(levels, bukti, berkas, namaKegiatan))
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
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
        {/* ponytail: paket ZIP butuh berkas asli di server; sambungkan ke endpoint ekspor backend */}
        <ExportCard
          title="Ekspor Paket Arsip Berkas Bukti Terstruktur"
          description="Mengompres seluruh berkas di database secara asinkron ke dalam struktur folder resmi BPS: Domain/Aspek/Indikator/Level."
          button="Unduh Paket ZIP"
          onClick={() => setPesan('Paket ZIP dibuat oleh server dan belum tersedia: berkas bukti saat ini belum tersimpan di backend.')}
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
