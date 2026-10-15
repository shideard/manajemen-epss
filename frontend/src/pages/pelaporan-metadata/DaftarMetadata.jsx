import { useState } from 'react'
import {
  Plus,
  Search,
  FileSpreadsheet,
  Layers,
  Database,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { STATUS_BADGE_STYLE } from './metadataData'

function MetricCard({ title, value, subtitle, icon: Icon, colorClass }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-grey-50 bg-white p-6 shadow-xs">
      <div>
        <p className="text-[13px] font-medium text-grey-100">{title}</p>
        <p className="mt-1 text-[32px] font-bold text-grey-300 leading-none">{value}</p>
        <p className="mt-2 text-[12px] text-grey-75">{subtitle}</p>
      </div>
      <div className={`flex size-13 items-center justify-center rounded-2xl ${colorClass}`}>
        <Icon size={26} />
      </div>
    </div>
  )
}

function DaftarMetadata({ submissions, onOpenCreate, onOpenEdit }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')

  const filtered = submissions.filter((item) => {
    const matchQuery =
      item.judulKegiatan?.toLowerCase().includes(query.toLowerCase()) ||
      item.instansi?.toLowerCase().includes(query.toLowerCase()) ||
      item.id?.toLowerCase().includes(query.toLowerCase())
    const matchStatus = statusFilter === 'Semua' || item.status === statusFilter
    return matchQuery && matchStatus
  })

  // Status counters for summary
  const statusCounts = {
    Draft: submissions.filter((s) => s.status === 'Draft').length,
    Submit: submissions.filter((s) => s.status === 'Submit').length,
    'Sedang diperiksa': submissions.filter((s) => s.status === 'Sedang diperiksa').length,
    'Perlu perbaikan': submissions.filter((s) => s.status === 'Perlu perbaikan').length,
    'Sudah diperbaiki': submissions.filter((s) => s.status === 'Sudah diperbaiki').length,
    Ditolak: submissions.filter((s) => s.status === 'Ditolak').length,
    Diterima: submissions.filter((s) => s.status === 'Diterima').length,
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Metadata Statistik Kegiatan"
          value={submissions.length}
          subtitle="Kegiatan terdaftar di Kota Bogor"
          icon={FileSpreadsheet}
          colorClass="bg-lime-100 text-grey-300"
        />
        <MetricCard
          title="Metadata Statistik Variabel"
          value={submissions.length * 6}
          subtitle="Karakteristik data terstandar"
          icon={Database}
          colorClass="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          title="Metadata Statistik Indikator"
          value={submissions.length * 3}
          subtitle="Output capaian statistik"
          icon={Layers}
          colorClass="bg-blue-50 text-blue-700"
        />
        <MetricCard
          title="Efisiensi Prediksi AI"
          value="~80%"
          subtitle="Pangkas waktu pengisian staf"
          icon={Sparkles}
          colorClass="bg-grey-300 text-lime-300"
        />
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-5">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-75"
            />
            <input
              type="text"
              placeholder="Cari judul kegiatan, instansi, atau ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-grey-75/60 py-2.5 pl-10 pr-4 text-[13px] text-grey-300 placeholder:text-grey-75 focus:border-grey-300 focus:ring-1 focus:ring-grey-300 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-grey-100" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-grey-75/60 bg-white px-3 py-2 text-[13px] text-grey-300 focus:border-grey-300 outline-none transition"
              >
                <option value="Semua">Semua Status</option>
                <option value="Draft">Draft</option>
                <option value="Sedang diperiksa">Sedang Diperiksa</option>
                <option value="Perlu perbaikan">Perlu Perbaikan</option>
                <option value="Diterima">Diterima</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenCreate}
              className="flex shrink-0 items-center gap-2 rounded-full bg-grey-300 px-5 py-2.5 text-[13px] font-bold text-lime-300 shadow hover:bg-grey-500 transition"
            >
              <Plus size={16} />
              Lapor Metadata Baru
            </button>
          </div>
        </div>

        {/* Table of Submissions */}
        <div className="overflow-x-auto rounded-xl border border-grey-50">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-grey2-75 text-grey-300 font-semibold border-b border-grey-50">
              <tr>
                <th className="py-3 px-4">ID & Judul Kegiatan</th>
                <th className="py-3 px-4">Instansi Penyelenggara</th>
                <th className="py-3 px-4">Tahun</th>
                <th className="py-3 px-4">Cara Pengumpulan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Fitur AI</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-grey-100">
                    Tidak ada pelaporan metadata yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-grey2-75/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-mono text-grey-100 block">{item.id}</span>
                      <strong className="text-[14px] text-grey-300 block font-semibold leading-snug">
                        {item.judulKegiatan}
                      </strong>
                    </td>
                    <td className="py-3.5 px-4 text-grey-200">{item.instansi}</td>
                    <td className="py-3.5 px-4 font-medium text-grey-300">{item.tahun}</td>
                    <td className="py-3.5 px-4 text-grey-200">{item.caraPengumpulan}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          STATUS_BADGE_STYLE[item.status] || 'bg-grey-50 text-grey-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.aiAssisted ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-grey-300 border border-lime-300">
                          <Sparkles size={11} className="text-lime-500" />
                          AI Assisted
                        </span>
                      ) : (
                        <span className="text-[11px] text-grey-75">Manual</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenEdit(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-grey-75/60 px-3 py-1 text-[12px] font-semibold text-grey-300 hover:border-grey-300 hover:bg-white transition"
                      >
                        <span>Buka Form</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ringkasan Status Progres ala INDAH BPS */}
        <div className="mt-2 rounded-xl border border-grey-50 bg-grey2-75/50 p-4">
          <p className="text-[12px] font-bold text-grey-300 mb-2">
            Status Ringkasan Pelaporan (Monitoring Walidata):
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 border border-grey-50 text-[12px]"
              >
                <span className="text-grey-100 font-medium">{status}:</span>
                <span className="font-bold text-grey-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DaftarMetadata
