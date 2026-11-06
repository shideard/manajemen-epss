import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KOLOM_KANBAN, kartuKanban } from './kegiatan'
import { formatTanggal, INDIKATOR, toISODate } from '../../lib/epss'
import focusIcon from '../../assets/kanban/focus-3-line.svg'
import calendarIcon from '../../assets/kanban/calendar-line.svg'
import attachmentIcon from '../../assets/kanban/attachment-line.svg'
import messageIcon from '../../assets/kanban/message-3-line.svg'

// Judul & warna tiap kolom (titik, angka progres, segmen terisi)
const KOLOM = {
  'Belum dilaksanakan': { judul: 'Belum Dilaksanakan', titik: 'bg-red-500', teks: 'text-red-500', isi: 'bg-red-500' },
  'Sedang dilaksanakan': { judul: 'Sedang Berjalan', titik: 'bg-yellow-500', teks: 'text-yellow-500', isi: 'bg-yellow-500' },
  'Bukti dukung diunggah': { judul: 'Bukti Diunggah', titik: 'bg-blue-500', teks: 'text-blue-500', isi: 'bg-blue-500' },
  Terverifikasi: { judul: 'Terverifikasi', titik: 'bg-green-500', teks: 'text-green-500', isi: 'bg-green-500' },
}

// Kolom panjang dipotong dulu; sisanya dibuka lewat "Lihat semua"
const BATAS_KARTU = 4

const NOMOR = Object.fromEntries(INDIKATOR.map((i) => [i.id, i.nomor]))
const inisial = (nama = '') =>
  nama
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0].toUpperCase())
    .join('')

function KartuKegiatan({ kartu, warna, href }) {
  const { kegiatan: k, indikatorIds, diajukan, lampiran, catatan } = kartu
  const jumlah = indikatorIds.length
  return (
    <Link
      to={href}
      className="flex flex-col gap-2.5 rounded-md border border-grey2-300 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-grey-500"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {k.opd && <span className="rounded-xs bg-grey-200 px-2 py-0.5 text-caption font-medium text-white">{k.opd}</span>}
        {jumlah > 0 && (
          <span className="flex items-center gap-1 rounded-sm border border-grey-300 bg-lime-300 py-0.5 pr-2 pl-1.5 text-caption">
            <img src={focusIcon} alt="" width={12} height={12} />
            Indikator {NOMOR[indikatorIds[0]] ?? '-'}
            {jumlah > 1 && ` +${jumlah - 1}`}
          </span>
        )}
      </div>
      <p className="font-semibold">{k.nama}</p>
      {k.deskripsi && <p className="text-small font-light text-grey-200">{k.deskripsi}</p>}
      <p className="flex items-center gap-1.5 text-small text-grey-200">
        <img src={calendarIcon} alt="" width={14} height={14} />
        {formatTanggal(k.mulai, 'short')} – {formatTanggal(k.selesai, 'short')}
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="flex items-center text-small">
          <span className="flex-1 font-light text-grey-200">Bukti dukung</span>
          <span className={`font-semibold ${jumlah ? warna.teks : 'text-grey-100'}`}>
            {jumlah ? `${diajukan}/${jumlah} indikator` : 'Belum ada indikator'}
          </span>
        </p>
        {jumlah > 0 && (
          <div className="flex gap-1" role="img" aria-label={`${diajukan} dari ${jumlah} indikator sudah diajukan buktinya`}>
            {indikatorIds.map((id, i) => (
              <span key={id} className={`h-1.5 flex-1 rounded-full ${i < diajukan ? warna.isi : 'bg-grey2-300'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-grey2-200 pt-2.5 text-small">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-grey-300 text-caption font-bold text-lime-300">{inisial(k.pic)}</span>
        <span className="min-w-0 flex-1 truncate">{k.pic}</span>
        <img src={attachmentIcon} alt="" width={14} height={14} />
        <span className="text-grey-200" aria-label={`${lampiran} berkas`}>{lampiran}</span>
        <img src={messageIcon} alt="" width={14} height={14} />
        <span className="text-grey-200" aria-label={`${catatan} catatan verifikator`}>{catatan}</span>
      </div>
    </Link>
  )
}

// Kanban otomatis: kegiatan masuk kolom sesuai jadwal & status buktinya, tidak bisa dipindah manual
function KanbanKegiatan({ kegiatan, bukti, berkas, hrefOf }) {
  const kolom = kartuKanban(kegiatan, bukti, berkas, toISODate(new Date()))
  const [terbuka, setTerbuka] = useState([]) // status kolom yang sedang menampilkan semua kartu
  const toggle = (status) => setTerbuka((list) => (list.includes(status) ? list.filter((s) => s !== status) : [...list, status]))
  return (
    <div className="overflow-x-auto rounded-lg bg-white p-4">
      <div className="grid min-w-[920px] grid-cols-4 gap-3">
        {KOLOM_KANBAN.map((status) => {
          const warna = KOLOM[status]
          const list = kolom[status]
          const semua = terbuka.includes(status)
          const tampil = semua ? list : list.slice(0, BATAS_KARTU)
          return (
            <section key={status} aria-label={warna.judul} className="flex flex-col gap-3 rounded-md bg-grey2-100 p-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <span className={`size-2.5 shrink-0 rounded-full ${warna.titik}`} />
                <span className="flex-1">{warna.judul}</span>
                <span className="rounded-sm border border-grey2-300 bg-white px-2 py-0.5 text-small text-grey-200">{list.length}</span>
              </h3>
              {list.length === 0 && <p className="py-6 text-center text-small text-grey-100">Tidak ada kegiatan.</p>}
              {tampil.map((kartu) => (
                <KartuKegiatan key={kartu.kegiatan.id} kartu={kartu} warna={warna} href={hrefOf(kartu.kegiatan)} />
              ))}
              {list.length > BATAS_KARTU && (
                <button
                  type="button"
                  onClick={() => toggle(status)}
                  aria-expanded={semua}
                  className="rounded-sm border border-grey2-300 bg-white py-2 text-small font-semibold text-grey-500 hover:bg-grey2-75 focus-visible:outline-2 focus-visible:outline-grey-500"
                >
                  {semua ? 'Tampilkan lebih sedikit' : `Lihat semua (${list.length})`}
                </button>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default KanbanKegiatan
