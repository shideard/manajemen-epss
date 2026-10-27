import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePeriode } from '../../lib/store'
import { formatTanggal, includesText, paginate, validasiPeriode } from '../../lib/epss'
import { Field, FormError, Input, Memuat, Modal, ModalActions, PageHeader, Pagination, SearchBox, Select } from '../../components/ui'
import { buttonClass } from '../../components/classes'
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
      <div className="grid gap-6 sm:grid-cols-2">
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
          <Input type="date" name="batas" required disabled={disabled} defaultValue={periode.batas} />
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-8.5 pt-7 pb-8">
        <PeriodeFields />
        <FormError>{error}</FormError>
        <ModalActions onCancel={onClose} />
      </form>
    </Modal>
  )
}

function PengaturanPeriode() {
  const muat = [usePeriode()]
  const [{ periode, tambah: tambahPeriode, hapus: hapusPeriode }] = muat
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [tambah, setTambah] = useState(false)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  // Periode terkunci = arsip skor resmi, jadi hanya periode yang belum dikunci yang bisa dihapus
  function hapus(p) {
    konfirmasi({
      title: 'Hapus Periode',
      message: `Hapus periode "${p.nama}"? Riwayat snapshot skor periode ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Hapus',
      danger: true,
      onConfirm: () => hapusPeriode(p.id),
    })
  }

  const filtered = periode.filter((p) => includesText([p.nama, p.tahun1, p.tahun2], query))
  const { rows, page: currentPage, pageCount } = paginate(filtered, page, PAGE_SIZE)

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader title="Pengaturan Periode EPSS Biennial" subtitle="Konfigurasi siklus 2 tahunan year-agnostic dan penetapan target IPS.">
        <button type="button" onClick={() => setTambah(true)} className={buttonClass()}>
          <img src={addIcon} alt="" width={19} height={19} />
          Tambah Periode
        </button>
      </PageHeader>

      <section className="rounded-lg border-5 border-dashed border-lime-500 bg-lime-300 px-2.5 pt-6 pb-2.5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-5">
          <h2 className="flex items-center gap-2 text-h3">
            <img src={listIcon} alt="" width={32} height={32} className="rounded-xs bg-white" />
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

        <div className="overflow-x-auto rounded-lg border border-lime-500 bg-grey2-50 px-3 py-3">
          <table className="w-full min-w-[760px] text-center text-body text-grey-500">
            <thead>
              <tr className="border-b border-grey-75 font-semibold">
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
                  <td colSpan={6} className="py-16 text-grey-200">
                    Tidak ada periode yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-grey-75/50 last:border-0">
                  <td className="py-3.5">
                    {p.tahun1}/{p.tahun2}
                  </td>
                  <td className="px-4 py-3.5">{p.nama}</td>
                  <td className="py-3.5">{formatTanggal(p.batas)}</td>
                  <td className="py-3.5">{p.target.toFixed(2)}</td>
                  <td className="py-3.5">{p.actual?.toFixed(2) ?? '-'}</td>
                  <td className="py-3.5">
                    <span className="flex justify-center gap-2">
                      <Link to={`/pengaturan-periode/${p.id}`} aria-label={`Konfigurasi ${p.nama}`} className="rounded-xs bg-lime-300">
                        <img src={editIcon} alt="" width={24} height={24} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => hapus(p)}
                        disabled={p.terkunci || periode.length === 1}
                        title={p.terkunci ? 'Periode terkunci tidak bisa dihapus' : periode.length === 1 ? 'Minimal harus ada satu periode' : undefined}
                        aria-label={`Hapus ${p.nama}`}
                        className="grid size-6 place-items-center rounded-xs bg-red-200 disabled:opacity-40"
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
            tambahPeriode(data)
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
