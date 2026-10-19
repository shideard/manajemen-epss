import { useState } from 'react'
import { useNotifikasi } from '../lib/store'
import { formatTanggal, SEED_PENGINGAT } from '../lib/epss'
import { Modal, ModalActions } from '../components/ui'
import settingsIcon from '../assets/icons/settings-3-line.svg'
import checkDouble from '../assets/icons/check-double-fill.svg'

const LABEL_PENGINGAT = { 1: '1 hari', 7: '7 hari', 14: '14 hari', 30: 'satu bulan' }

function PengaturanNotifikasi({ hariPengingat, onSave, onClose }) {
  function handleSubmit(event) {
    event.preventDefault()
    onSave(new FormData(event.currentTarget).getAll('hari').map(Number))
  }

  return (
    <Modal title="Pengaturan Notifikasi" titleClass="text-[14px] text-lime-300" width={623} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-[30px] pt-[38px] pb-[30px]">
        {SEED_PENGINGAT.map((hari) => (
          <label key={hari} className="flex items-center gap-3 text-base leading-[1.2] text-grey-500">
            <input type="checkbox" name="hari" value={hari} defaultChecked={hariPengingat.includes(hari)} className="size-[18px] shrink-0 accent-grey-500" />
            Kirim notifikasi pengingat {LABEL_PENGINGAT[hari]} sebelum kegiatan dimulai
          </label>
        ))}
        <ModalActions onCancel={onClose} />
      </form>
    </Modal>
  )
}

function Notifikasi() {
  const { list, dibaca, tandaiDibaca, tandaiSemuaDibaca, belumDibaca, hariPengingat, setHariPengingat } = useNotifikasi()
  const [pengaturan, setPengaturan] = useState(false)
  const perTanggal = Object.groupBy(list, (n) => n.tanggal)

  return (
    <div className="flex w-full flex-col gap-[30px]">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-grey-500 px-6 py-5">
        <div className="flex flex-col gap-[7px] leading-[1.2] text-lime-300">
          <h1 className="text-[20px] font-semibold">Semua Notifikasi</h1>
          <p className="text-[13px] font-light">Daftar notifikasi pengingat untuk kegiatan Anda</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {belumDibaca > 0 && (
            <button
              type="button"
              onClick={tandaiSemuaDibaca}
              className="flex items-center gap-[10px] rounded-[16px] border border-lime-300 px-5 py-[10px] text-base leading-[1.2] text-lime-300"
            >
              <img src={checkDouble} alt="" width={20} height={20} className="brightness-0 invert" />
              Tandai semua dibaca
            </button>
          )}
          <button
            type="button"
            onClick={() => setPengaturan(true)}
            className="flex w-[233px] items-center justify-center gap-[10px] rounded-[16px] bg-lime-300 py-[10px] text-base leading-[1.2] text-grey-500"
          >
            <img src={settingsIcon} alt="" width={24} height={24} />
            Pengaturan Notifikasi
          </button>
        </div>
      </div>
      <hr className="border-grey-75" />

      {list.length === 0 && <p className="py-10 text-center text-grey-100">Belum ada notifikasi. Pengingat muncul menjelang tanggal mulai rencana kegiatan.</p>}

      {Object.entries(perTanggal).map(([tanggal, items]) => (
        <section key={tanggal} className="flex flex-col gap-5">
          <h2 className="text-base leading-[1.2] text-grey-500">{formatTanggal(tanggal)}</h2>
          <div className="flex flex-col gap-3">
            {items.map((n) => {
              const sudahDibaca = dibaca.includes(n.id)
              return (
                <article key={n.id} className={`flex flex-col gap-4 rounded-[20px] px-6 py-5 ${sudahDibaca ? 'bg-lime-50' : 'bg-white'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-[20px] leading-[1.2] font-semibold text-grey-500">Pengingat Pelaksanaan Kegiatan</h3>
                    {sudahDibaca ? (
                      <span className="flex items-center gap-3 rounded-[16px] bg-lime-75 px-5 py-[10px] text-[13px] leading-[1.2] text-grey-500">
                        <img src={checkDouble} alt="" width={20} height={20} />
                        Dibaca
                      </span>
                    ) : (
                      <button type="button" onClick={() => tandaiDibaca(n.id)} className="rounded-[16px] bg-lime-300 px-5 py-[10px] text-[13px] leading-[1.2] text-grey-500">
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>
                  <p className="text-base leading-[1.2] text-heading">
                    Kegiatan {n.kegiatan.nama} dijadwalkan untuk dilaksanakan pada {formatTanggal(n.kegiatan.mulai)} sampai {formatTanggal(n.kegiatan.selesai)}.
                    Harap pastikan kegiatan dilaksanakan sesuai jadwal.
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      ))}

      {pengaturan && (
        <PengaturanNotifikasi
          hariPengingat={hariPengingat}
          onSave={(hari) => {
            setHariPengingat(hari)
            setPengaturan(false)
          }}
          onClose={() => setPengaturan(false)}
        />
      )}
    </div>
  )
}

export default Notifikasi
