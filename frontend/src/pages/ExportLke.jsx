import { useState } from 'react'
import { usePeriode, useStore } from '../lib/store'
import { STORAGE_KEY as KEGIATAN_KEY } from './rencana-kegiatan/kegiatan'
import { EMPTY_LIST, EMPTY_OBJECT, KEYS, lkeCsv } from '../lib/epss'

function unduh(nama, isi) {
  // BOM agar Excel membaca UTF-8 dengan benar
  const url = URL.createObjectURL(new Blob(['﻿', isi], { type: 'text/csv;charset=utf-8' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: nama })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url))
}

function ExportCard({ title, description, button, onClick }) {
  return (
    <section className="flex flex-col items-center gap-[26px] rounded-[20px] bg-white px-5 py-[30px]">
      <div className="flex w-full flex-col gap-[7px] leading-[1.2] text-grey-500">
        <h2 className="text-[20px] font-bold">{title}</h2>
        <p className="text-base font-light">{description}</p>
      </div>
      <button type="button" onClick={onClick} className="w-full rounded-[16px] bg-lime-300 px-5 py-[10px] text-base leading-[1.2] font-medium text-grey-500">
        {button}
      </button>
    </section>
  )
}

function ExportLke() {
  const { aktif } = usePeriode()
  const [kegiatan] = useStore(KEGIATAN_KEY, EMPTY_LIST)
  const [levels] = useStore(KEYS.levelIndikator, EMPTY_OBJECT)
  const [bukti] = useStore(KEYS.bukti, EMPTY_OBJECT)
  const [berkas] = useStore(KEYS.berkas, EMPTY_OBJECT)
  const [pesan, setPesan] = useState('')

  function unduhLke() {
    const namaKegiatan = Object.fromEntries(kegiatan.map((k) => [k.id, k.nama]))
    unduh(`LKE-EPSS-${aktif.tahun1}-${aktif.tahun2}.csv`, lkeCsv(levels, bukti, berkas, namaKegiatan))
  }

  return (
    <div className="flex w-full flex-col gap-[33px]">
      <div className="flex flex-col gap-[7px] leading-[1.2] text-grey-500">
        <h1 className="text-[25px] font-bold">Ekspor Lembar Kerja Evaluasi dan Bukti Dukung yang Terstruktur</h1>
        <p className="text-base font-light">
          Hasilkan format resmi pelaporan BPS untuk keperluan penilaian Tim Penilai Internal (TPI) dan Tim Penilai Evaluasi Penyelenggaraan Statistik Sektoral
          (TPSS).
        </p>
      </div>

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
          <p role="status" className="text-sm text-grey-200">
            {pesan}
          </p>
        )}
      </div>
    </div>
  )
}

export default ExportLke
