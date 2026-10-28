import { useState } from 'react'
import { useNotifikasi } from '../lib/store'
import { formatTanggal, SEED_PENGINGAT } from '../lib/epss'
import { Modal, ModalActions, PageHeader } from '../components/ui'
import { buttonClass } from '../components/classes'
import settingsIcon from '../assets/icons/settings-3-line.svg'
import checkDouble from '../assets/icons/check-double-fill.svg'

const LABEL_PENGINGAT = { 1: '1 hari', 7: '7 hari', 14: '14 hari', 30: 'satu bulan' }

function PengaturanNotifikasi({ hariPengingat, onSave, onClose }) {
  function handleSubmit(event) {
    event.preventDefault()
    onSave(new FormData(event.currentTarget).getAll('hari').map(Number))
  }

  return (
    <Modal title="Pengaturan Notifikasi" width={623} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-7.5 pt-9.5 pb-7.5">
        {SEED_PENGINGAT.map((hari) => (
          <label key={hari} className="flex items-center gap-3">
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
    <div className="flex w-full flex-col gap-8">
      <PageHeader title="Semua Notifikasi" subtitle="Daftar notifikasi pengingat untuk kegiatan Anda.">
        <div className="flex flex-wrap gap-3">
          {belumDibaca > 0 && (
            <button type="button" onClick={tandaiSemuaDibaca} className={buttonClass('outline')}>
              <img src={checkDouble} alt="" width={20} height={20} />
              Tandai semua dibaca
            </button>
          )}
          <button type="button" onClick={() => setPengaturan(true)} className={buttonClass('secondary')}>
            <img src={settingsIcon} alt="" width={24} height={24} />
            Pengaturan Notifikasi
          </button>
        </div>
      </PageHeader>
      <hr className="border-grey-75" />

      {list.length === 0 && <p className="py-10 text-center text-grey-200">Belum ada notifikasi. Pengingat muncul menjelang tanggal mulai rencana kegiatan.</p>}

      {Object.entries(perTanggal).map(([tanggal, items]) => (
        <section key={tanggal} className="flex flex-col gap-5">
          <h2 className="font-semibold text-grey-200">{formatTanggal(tanggal)}</h2>
          <div className="flex flex-col gap-3">
            {items.map((n) => {
              const sudahDibaca = dibaca.includes(n.id)
              return (
                <article key={n.id} className={`flex flex-col gap-4 rounded-lg px-6 py-5 ${sudahDibaca ? 'bg-lime-50' : 'bg-white'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-h3">Pengingat Pelaksanaan Kegiatan</h3>
                    {sudahDibaca ? (
                      <span className="inline-flex items-center gap-2.5 rounded-md bg-lime-75 px-5 py-2.5">
                        <img src={checkDouble} alt="" width={20} height={20} />
                        Dibaca
                      </span>
                    ) : (
                      <button type="button" onClick={() => tandaiDibaca(n.id)} className={buttonClass('secondary')}>
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>
                  <p className="leading-snug text-grey-200">
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
