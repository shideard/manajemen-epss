import { useState } from 'react'
import { agendaTerdekat, isOnDate, monthCells, toISODate, WARNA } from './kegiatan'
import arrowFill from '../../assets/rencana/arrow-down-s-fill.svg'
import arrowRightUp from '../../assets/rencana/arrow-right-up-line.svg'
import calendarHeader from '../../assets/rencana/calendar-2-fill-header.svg'
import calendar1 from '../../assets/rencana/calendar-2-fill-1.svg'
import calendar2 from '../../assets/rencana/calendar-2-fill-2.svg'
import calendar3 from '../../assets/rencana/calendar-2-fill-3.svg'
import calendar4 from '../../assets/rencana/calendar-2-fill-4.svg'

const IKON_WARNA = [calendar1, calendar2, calendar3, calendar4]
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

  return (
    <div className="flex flex-wrap items-start justify-center gap-[14px]">
      <div className="w-full max-w-[800px] rounded-[14px] bg-grey-300 px-[10.5px] pb-[10.5px]">
        <div className="flex items-start justify-between px-4 pt-[17px] pb-[9px]">
          <div className="leading-[1.2]">
            <p className="text-[31px] font-semibold text-lime-300">{cursor.toLocaleDateString('id-ID', { month: 'long' })}</p>
            <p className="text-[20px] text-green-50">{year}</p>
          </div>
          <div className="mt-[13px] flex gap-[5px]">
            <button type="button" onClick={() => shift(-1)} aria-label="Bulan sebelumnya" className="rounded-[5px] bg-white">
              <img src={arrowFill} alt="" width={32} height={32} className="rotate-90" />
            </button>
            <button type="button" onClick={() => shift(1)} aria-label="Bulan berikutnya" className="rounded-[5px] bg-white">
              <img src={arrowFill} alt="" width={32} height={32} className="-rotate-90" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-[5px] rounded-[14px] bg-white p-[15px]">
          {HARI.map((hari) => (
            <p key={hari} className="text-center text-[13px] leading-[1.2] font-semibold text-heading">
              {hari}
            </p>
          ))}
          {monthCells(year, month).map((day, i) => {
            if (!day) return <div key={i} className="aspect-square rounded-[14px] border-2 border-grey-200/10 bg-[#c2c2c2]/10" />

            const date = toISODate(new Date(year, month, day))
            const weekend = i % 7 === 0 || i % 7 === 6
            const events = kegiatan.filter((k) => isOnDate(k, date))
            return (
              <div
                key={i}
                className={`relative aspect-square overflow-hidden rounded-[10px] border-2 border-grey-200 ${
                  date === today ? 'bg-lime-300' : weekend ? 'bg-grey-50' : 'bg-green-50'
                }`}
              >
                <span className="absolute top-[3px] left-[3px] grid h-4 min-w-4 place-items-center rounded-[5px] bg-white px-0.5 text-[13px] leading-[1.2] font-bold text-grey-200">
                  {day}
                </span>
                {/* ponytail: maksimal 3 bar per hari; tambahkan penanda "+N" jika kegiatan sering bertumpuk */}
                <div className="absolute inset-x-0 bottom-[14px] flex flex-col-reverse gap-[2px]">
                  {events.slice(0, 3).map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => onOpen(k)}
                      title={k.nama}
                      aria-label={k.nama}
                      className="h-[14px] w-full"
                      style={{ backgroundColor: WARNA[k.warna] }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex w-[275px] flex-col gap-[7px]">
        <div className="flex flex-col gap-[6px] rounded-[14px] bg-agenda px-7 py-4">
          <img src={calendarHeader} alt="" width={39} height={39} className="rounded-[5px] bg-white" />
          <p className="text-[25px] leading-[1.2] font-semibold text-grey-200">Agenda Terdekat</p>
        </div>
        {agenda.length === 0 && <p className="rounded-[14px] bg-agenda px-7 py-4 text-grey-200">Belum ada agenda terdekat.</p>}
        {agenda.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => onOpen(k)}
            className="flex flex-col gap-[6px] rounded-[14px] bg-agenda px-7 py-4 text-left text-base leading-[1.2] text-grey-200 hover:brightness-95"
          >
            <span className="flex w-full items-center justify-between">
              <img src={IKON_WARNA[k.warna]} alt="" width={39} height={39} />
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
