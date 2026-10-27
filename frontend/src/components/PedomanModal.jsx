import { useState } from 'react'
import { LEVELS } from '../lib/epss'
import { Modal } from './ui'
import { buttonClass } from './classes'

// Kriteria & syarat tiap level satu indikator (dipakai di Pedoman, Repositori, Verifikasi)
function PedomanModal({ indikator, level: levelAwal = 1, onClose }) {
  const [level, setLevel] = useState(levelAwal)
  const { kriteria, pemenuhan, syarat } = indikator.levels[level - 1]

  return (
    <Modal title={`Indikator ${indikator.nomor}: ${indikator.nama}`} onClose={onClose}>
      <div className="flex flex-col gap-13 px-8.5 pt-8 pb-8">
        <div role="tablist" aria-label="Level" className="flex justify-between gap-1 overflow-x-auto rounded-md bg-lime-75 px-2.5 py-1">
          {LEVELS.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={level === i + 1}
              onClick={() => setLevel(i + 1)}
              className={`h-[45px] w-[126px] shrink-0 rounded-md text-body font-semibold ${level === i + 1 ? 'bg-grey-500 text-lime-300' : 'text-grey-500'}`}
            >
              Level {i + 1}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="flex flex-col gap-4">
          <h3 className="text-center text-h3 text-grey-500">
            Level {level}: {LEVELS[level - 1]}
          </h3>
          <div className="flex flex-col gap-6 rounded-md bg-lime-50 p-6 text-body text-grey-500">
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Kriteria Level</p>
              <p className="font-light">{kriteria}</p>
            </div>
            <hr className="border-grey-75" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Kriteria Pemenuhan</p>
              <ul className="list-disc pl-6 font-light">
                {pemenuhan.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <hr className="border-grey-75" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Contoh Bukti Dukung</p>
              <ul className="list-disc pl-6 font-light">
                {syarat.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={onClose} className={buttonClass()}>
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default PedomanModal
