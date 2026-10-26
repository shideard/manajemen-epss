import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useNotifikasi, usePeriode } from '../../lib/store'
import { formatTanggal, periodeLabel } from '../../lib/epss'
import dotIcon from '../../assets/icons/dot-active.svg'
import arrowDown from '../../assets/rencana/arrow-down-s-line.svg'
import bellIcon from '../../assets/icons/notification-badge.svg'
import bellLime from '../../assets/icons/notification-3-fill.svg'
import closeLime from '../../assets/icons/close-line-lime.svg'

function Topbar() {
  const { periode, aktif, setAktifId } = usePeriode()
  const { list, belumDibaca } = useNotifikasi()
  const popoverRef = useRef(null)

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {/* <select> transparan di atas tampilan desain: dropdown native, tetap bisa dipakai keyboard */}
      <label className="relative flex h-[45px] w-[333px] max-w-full items-center justify-between gap-3 rounded-sm bg-white px-4.5">
        <img src={dotIcon} alt="" width={13} height={13} className={aktif?.terkunci ? 'grayscale' : ''} />
        <span className="truncate text-body font-semibold text-grey-500">Periode : {aktif ? periodeLabel(aktif) : '-'}</span>
        <img src={arrowDown} alt="" width={19} height={19} className="rounded-xs bg-grey-200" />
        <select
          value={aktif?.id}
          onChange={(e) => setAktifId(e.target.value)}
          aria-label="Pilih periode"
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {periode.map((p) => (
            <option key={p.id} value={p.id}>
              {periodeLabel(p)}
            </option>
          ))}
        </select>
      </label>

      {/* Popover API bawaan browser: klik di luar / Esc otomatis menutup */}
      <button
        type="button"
        popoverTarget="notif-popover"
        aria-label={`Notifikasi (${belumDibaca} belum dibaca)`}
        className="grid h-[45px] w-[52px] place-items-center rounded-sm bg-white"
      >
        <span className="relative size-[25px]">
          <img src={bellIcon} alt="" width={25} height={25} />
          {belumDibaca === 0 && <span className="absolute top-[1.5px] left-[15.5px] size-[9px] rounded-full bg-white" />}
        </span>
      </button>

      <div
        ref={popoverRef}
        id="notif-popover"
        popover="auto"
        className="fixed inset-auto top-[86px] lg:top-[76px] origin-top-right right-4 lg:right-10 m-0 max-h-[661px] w-[min(395px,calc(100vw-2rem))] overflow-y-auto rounded-lg bg-white font-sans shadow-lg"
      >
        <div className="sticky top-0 flex h-16 items-center justify-between bg-grey-500 px-6.5">
          <p className="flex items-center gap-2.5 text-body font-semibold text-lime-300">
            <img src={bellLime} alt="" width={19} height={19} />
            Notifikasi
          </p>
          <button type="button" popoverTarget="notif-popover" popoverTargetAction="hide" aria-label="Tutup notifikasi">
            <img src={closeLime} alt="" width={24} height={24} />
          </button>
        </div>
        <ul className="px-6.5">
          {list.length === 0 && <li className="py-8 text-center text-small text-grey-200">Belum ada notifikasi.</li>}
          {list.slice(0, 4).map((n) => (
            <li key={n.id} className="border-b border-grey-75/50 last:border-0">
              <Link to="/notifikasi" onClick={() => popoverRef.current.hidePopover()} className="flex flex-col gap-3.5 py-5 text-small">
                <span className="font-semibold">Pengingat Pelaksanaan Kegiatan</span>
                <span className="text-grey-200">
                  Kegiatan {n.kegiatan.nama} dijadwalkan untuk dilaksanakan pada {formatTanggal(n.kegiatan.mulai)} sampai{' '}
                  {formatTanggal(n.kegiatan.selesai)}. Harap pastikan kegiatan dilaksanakan sesuai jadwal.
                </span>
                <span className="text-right text-grey-200">{formatTanggal(n.tanggal, 'short')}</span>
              </Link>
            </li>
          ))}
        </ul>
        {list.length > 4 && (
          <Link to="/notifikasi" onClick={() => popoverRef.current.hidePopover()} className="block pb-5 text-center text-small font-semibold text-grey-500 underline">
            Lihat semua notifikasi
          </Link>
        )}
      </div>
    </div>
  )
}

export default Topbar
