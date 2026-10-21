import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePeriode, useStore } from '../../lib/store'
import { EMPTY_LIST, formatTanggal, includesText, KEYS, paginate, validasiPeriode } from '../../lib/epss'
import { Field, Input, Modal, ModalActions, Pagination, SearchBox, Select } from '../../components/ui'
import { useConfirm } from '../../components/useConfirm'
import addIcon from '../../assets/rencana/add-circle-fill.svg'
import listIcon from '../../assets/icons/list-unordered.svg'
import editIcon from '../../assets/rencana/edit-2-fill.svg'
import deleteIcon from '../../assets/icons/delete-bin-2-fill.svg'

const PAGE_SIZE = 7
const tahunIni = new Date().getFullYear()
const OPSI_TAHUN = Array.from({ length: 7 }, (_, i) => String(tahunIni - 3 + i))

// Field form periode, dipakai modal Tambah Periode & halaman Konfigurasi
export function PeriodeFields({ periode = {}, disabled, namaAside }) {
  return (
    <>
      <Field label="Nama Periode" aside={namaAside}>
        <Input name="nama" required disabled={disabled} defaultValue={periode.nama} placeholder="Contoh: Evaluasi EPSS Kota Bogor Siklus 2027–2028" />
      </Field>
      <div className="grid gap-[22px] sm:grid-cols-2 sm:gap-[30px]">
        <Field label="Tahun Pertama">
          <Select name="tahun1" disabled={disabled} defaultValue={periode.tahun1 ?? String(tahunIni)}>
            {OPSI_TAHUN.map((tahun) => (
              <option key={tahun}>{tahun}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tahun Kedua">
          <Select name="tahun2" disabled={disabled} defaultValue={periode.tahun2 ?? String(tahunIni + 1)}>
            {OPSI_TAHUN.map((tahun) => (
              <option key={tahun}>{tahun}</option>
            ))}
          </Select>
        </Field>
        <Field label="Batas Akhir Unggah Bukti">
          <Input type="date" name="batas" required disabled={disabled} defaultValue={periode.batas} className="border-[#b4b4b4]" />
        </Field>
        <Field label="Target Skor">
          <Input
            type="number"
            name="target"
            required
            min={1}
            max={5}
            step={0.01}
            disabled={disabled}
            defaultValue={periode.target}
            placeholder="Isi Target (1.00-5.00)"
            className="border-[#b4b4b4]"
          />
        </Field>
      </div>
    </>
  )
}

function TambahPeriode({ periode, onSave, onClose }) {
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const { data, error } = validasiPeriode(Object.fromEntries(new FormData(event.currentTarget)), periode)
    if (error) return setError(error)
    onSave(data)
  }

  return (
    <Modal title="Tambah Periode Penilaian EPSS" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-[22px] px-[34px] pt-7 pb-8">
        <PeriodeFields />
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <ModalActions onCancel={onClose} />
      </form>
    </Modal>
  )
}

function PengaturanPeriode() {
  const { periode, setPeriode } = usePeriode()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [tambah, setTambah] = useState(false)
  const [, setSnapshot] = useStore(KEYS.snapshot, EMPTY_LIST)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  // Periode terkunci = arsip skor resmi, jadi hanya periode yang belum dikunci yang bisa dihapus
  function hapus(p) {
    konfirmasi({
      title: 'Hapus Periode',
      message: `Hapus periode "${p.nama}"? Riwayat snapshot skor periode ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Hapus',
      danger: true,
      onConfirm: () => {
        setPeriode((list) => list.filter((x) => x.id !== p.id))
        setSnapshot((list) => list.filter((s) => s.periodeId !== p.id))
      },
    })
  }

  const filtered = periode.filter((p) => includesText([p.nama, p.tahun1, p.tahun2], query))
  const { rows, page: currentPage, pageCount } = paginate(filtered, page, PAGE_SIZE)

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <div className="flex flex-col gap-1 text-grey-500">
          <h1 className="text-2xl font-bold">Pengaturan Periode EPSS Biennial</h1>
          <p className="text-lg font-regular">Konfigurasi siklus 2 tahunan year-agnostic dan penetapan target IPS.</p>
        </div>
        <button type="button" onClick={() => setTambah(true)} className="flex items-center gap-[10px] rounded-[16px] bg-grey-300 px-5 py-[10px] text-sm leading-[1.2] text-lime-300 transform transition-transform duration-300 ease-out-quint hover:scale-102">
          <img src={addIcon} alt="" width={19} height={19} />
          Tambah Periode
        </button>
      </div>

      <section className="rounded-[20px] border-5 border-dashed border-lime-500 bg-lime-300 px-[10px] pt-[23px] pb-[10px]">
        <div className="mb-[29px] flex flex-wrap items-center justify-between gap-3 px-5">
          <h2 className="flex items-center gap-2 text-[25px] leading-[1.2] font-semibold text-grey-300">
            <img src={listIcon} alt="" width={32} height={32} className="rounded-[5px] bg-white" />
            List Periode
          </h2>
          <SearchBox
            variant="grey"
            value={query}
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            placeholder="Cari Periode..."
          />
        </div>

        <div className="overflow-x-auto rounded-[20px] border border-lime-500 bg-[#fdfdfd] px-[13px] py-3">
          <table className="w-full min-w-[760px] text-center text-base leading-[1.2] text-black">
            <thead>
              <tr className="border-b border-grey-100 font-bold">
                <th className="w-[123px] py-4">Periode Penilaian</th>
                <th className="py-4">Nama Siklus</th>
                <th className="py-4">Batas Akhir Unggah Bukti</th>
                <th className="py-4">Target IPS</th>
                <th className="py-4">Actual IPS</th>
                <th className="py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-grey-100">
                    Tidak ada periode yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-grey-100/50 last:border-0">
                  <td className="py-[14px]">
                    {p.tahun1}/{p.tahun2}
                  </td>
                  <td className="px-4 py-[14px]">{p.nama}</td>
                  <td className="py-[14px]">{formatTanggal(p.batas)}</td>
                  <td className="py-[14px]">{p.target.toFixed(2)}</td>
                  <td className="py-[14px]">{p.actual?.toFixed(2) ?? '-'}</td>
                  <td className="py-[14px]">
                    <span className="flex justify-center gap-[7px]">
                      <Link to={`/pengaturan-periode/${p.id}`} aria-label={`Konfigurasi ${p.nama}`} className="rounded-[5px] bg-lime-300">
                        <img src={editIcon} alt="" width={24} height={24} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => hapus(p)}
                        disabled={p.terkunci || periode.length === 1}
                        title={p.terkunci ? 'Periode terkunci tidak bisa dihapus' : periode.length === 1 ? 'Minimal harus ada satu periode' : undefined}
                        aria-label={`Hapus ${p.nama}`}
                        className="grid size-6 place-items-center rounded-[5px] bg-red-200 disabled:opacity-40"
                      >
                        <img src={deleteIcon} alt="" width={18} height={18} />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {filtered.length > 0 && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}

      {tambah && (
        <TambahPeriode
          periode={periode}
          onSave={(data) => {
            setPeriode((list) => [{ ...data, id: crypto.randomUUID(), actual: null, terkunci: false }, ...list])
            setTambah(false)
          }}
          onClose={() => setTambah(false)}
        />
      )}
      {dialogKonfirmasi}
    </div>
  )
}

export default PengaturanPeriode
