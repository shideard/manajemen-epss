import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { isOnDate, monthCells, WARNA_KALENDER, warnaKalender } from './kegiatan'
import { agendaTerdekat, toISODate } from '../../lib/epss'
import arrowFill from '../../assets/rencana/arrow-down-s-fill.svg'
import arrowRightUp from '../../assets/rencana/arrow-right-up-line.svg'
import calendarHeader from '../../assets/rencana/calendar-2-fill-header.svg'

const MAKS_PER_HARI = 3
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const tanggalPendek = (iso) =>
  new Date(`${iso}T00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

function KalenderKegiatan({ kegiatan, onOpen }) {
  const today = toISODate(new Date())
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const shift = (n) => setCursor(new Date(year, month + n, 1))
  const agenda = agendaTerdekat(kegiatan, today)
  // Satu warna per kegiatan, dipakai sama di kotak kalender dan daftar agenda
  const warna = useMemo(() => warnaKalender(kegiatan), [kegiatan])
  const warnaOf = (k) => WARNA_KALENDER[warna[k.id]]

  return (
    <div className="flex flex-col items-start gap-3.5 lg:flex-row">
      <div className="w-full min-w-0 flex-1 rounded-lg bg-grey-300 px-3 pb-3">
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <div>
            <p className="text-h1 font-semibold text-lime-300">{cursor.toLocaleDateString('id-ID', { month: 'long' })}</p>
            <p className="text-lead text-grey-50">{year}</p>
          </div>
          <div className="mt-3 flex gap-1">
            <button type="button" onClick={() => shift(-1)} aria-label="Bulan sebelumnya" className="rounded-xs bg-white">
              <img src={arrowFill} alt="" width={32} height={32} className="rotate-90" />
            </button>
            <button type="button" onClick={() => shift(1)} aria-label="Bulan berikutnya" className="rounded-xs bg-white">
              <img src={arrowFill} alt="" width={32} height={32} className="-rotate-90" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 rounded-md bg-white p-2.5">
          {HARI.map((hari, i) => (
            <p key={hari} className={`text-center text-small ${i % 6 === 0 ? 'text-grey-200' : 'font-medium text-grey-300'}`}>
              {hari}
            </p>
          ))}
          {monthCells(year, month).map((day, i) => {
            const weekend = i % 7 === 0 || i % 7 === 6
            const kotak = `flex min-h-25 flex-col gap-0.5 overflow-hidden rounded-sm px-1.5 pt-1.5 pb-1.5 ${weekend ? 'bg-grey2-75' : 'bg-white'}`
            if (!day) return <div key={i} className={`${kotak} border border-grey2-300 opacity-60`} />

            const date = toISODate(new Date(year, month, day))
            const hariIni = date === today
            const events = kegiatan.filter((k) => isOnDate(k, date))
            return (
              <div key={i} className={`${kotak} ${hariIni ? 'border-2 border-grey-300' : 'border border-grey2-300'}`}>
                <span className={`self-start rounded-full px-1.5 py-0.5 text-small font-semibold ${hariIni ? 'bg-grey-300 text-lime-300' : 'text-grey-300'}`}>
                  {day}
                </span>
                {hariIni && <span className="text-caption font-semibold text-grey-300">Hari ini</span>}
                {/* Nama kegiatan tampil di bar; nama lengkap + jadwal muncul saat hover */}
                <div className="mt-auto flex flex-col gap-0.5">
                  {events.slice(0, MAKS_PER_HARI).map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => onOpen(k)}
                      title={`${k.nama} (${tanggalPendek(k.mulai)} - ${tanggalPendek(k.selesai)})`}
                      className="w-full truncate rounded-xs px-1.5 py-0.5 text-left text-caption font-medium text-grey-500 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-grey-500"
                      style={{ backgroundColor: warnaOf(k) }}
                    >
                      {k.nama}
                    </button>
                  ))}
                  {events.length > MAKS_PER_HARI && (
                    <span
                      title={events.slice(MAKS_PER_HARI).map((k) => k.nama).join('\n')}
                      className="px-1.5 text-caption font-medium text-grey-300"
                    >
                      +{events.length - MAKS_PER_HARI} lainnya
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 lg:w-[275px] xl:w-[340px]">
        <div className="flex flex-col gap-1.5 rounded-lg bg-grey2-300 px-7 py-4">
          <img src={calendarHeader} alt="" width={39} height={39} className="rounded-xs bg-white" />
          <p className="text-h3">Agenda Terdekat</p>
        </div>
        {agenda.length === 0 && <p className="rounded-lg bg-grey2-300 px-7 py-4 text-grey-200">Belum ada agenda terdekat.</p>}
        {agenda.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => onOpen(k)}
            className="flex flex-col gap-1.5 rounded-lg bg-grey2-300 px-7 py-4 text-left text-grey-200 hover:bg-grey2-200"
          >
            <span className="flex w-full items-center justify-between">
              <span className="grid size-[39px] place-items-center rounded-xs text-grey-500" style={{ backgroundColor: warnaOf(k) }}>
                <CalendarDays size={22} aria-hidden="true" />
              </span>
              <img src={arrowRightUp} alt="" width={39} height={39} />
            </span>
            <span className="font-semibold">
              {tanggalPendek(k.mulai)} - {tanggalPendek(k.selesai)}
            </span>
            <span className="font-medium">{k.nama}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default KalenderKegiatan
