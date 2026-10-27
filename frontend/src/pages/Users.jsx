import { useState } from 'react'
import { useUsers } from '../lib/store'
import { ROLE_LABELS, ROLES } from '../config/menu'
import { Badge, Field, FormError, Input, Memuat, Modal, ModalActions, PageHeader, Select } from '../components/ui'
import { buttonClass } from '../components/classes'
import { useConfirm } from '../components/useConfirm'
import addIcon from '../assets/rencana/add-circle-fill.svg'
import editIcon from '../assets/rencana/edit-2-fill.svg'
import deleteIcon from '../assets/icons/delete-bin-2-fill.svg'

const PERAN = [ROLES.OPERATOR, ROLES.VERIFIKATOR]
const TONE = { [ROLES.OPERATOR]: 'blue', [ROLES.VERIFIKATOR]: 'green' }

function AkunForm({ akun, users, onSave, onClose }) {
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    // ponytail: password tidak disimpan di browser; kirim ke API Laravel saat endpoint kelola user siap
    const { username, email, role } = Object.fromEntries(new FormData(event.currentTarget))
    if (users.some((u) => u.id !== akun.id && u.username === username.trim())) return setError('Username sudah dipakai.')
    onSave({ username: username.trim(), email: email.trim(), role })
  }

  return (
    <Modal title={akun.id ? 'Edit Akun' : 'Buat Akun Baru'} width={723} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5.5 px-9 pt-7 pb-8">
        <Field label="Username">
          <Input name="username" required pattern="[A-Za-z0-9_.]+" title="Huruf, angka, titik, atau garis bawah" defaultValue={akun.username} placeholder="Contoh: ani1234" />
        </Field>
        <Field label="Email">
          <Input type="email" name="email" required defaultValue={akun.email} placeholder="Contoh: ani1234@gmail.com" />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            name="password"
            required={!akun.id}
            minLength={8}
            autoComplete="new-password"
            placeholder={akun.id ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}
          />
        </Field>
        <Field label="Peran" className="w-[245px]">
          <Select name="role" required defaultValue={akun.role ?? ''}>
            <option value="" disabled>
              Pilih peran
            </option>
            {PERAN.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </Select>
        </Field>
        <FormError>{error}</FormError>
        <ModalActions onCancel={onClose} />
      </form>
    </Modal>
  )
}

function Users() {
  const muat = [useUsers()]
  const [{ users, simpan, hapus: hapusAkun, setStatus: setStatusAkun }] = muat
  const [editing, setEditing] = useState(null) // null = tertutup, {} = akun baru
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  function save(data) {
    simpan(editing.id, data)
    setEditing(null)
  }

  function hapus(user) {
    konfirmasi({
      title: 'Hapus Akun',
      message: `Hapus akun ${user.username}? Pengguna ini tidak bisa masuk lagi. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Hapus',
      danger: true,
      onConfirm: () => hapusAkun(user.id),
    })
  }

  // Akun lama tanpa field status_aktif dianggap aktif
  const aktif = (u) => u.status_aktif !== false
  const setStatus = (user, status_aktif) => setStatusAkun(user.id, status_aktif)

  // Menonaktifkan perlu konfirmasi; mengaktifkan kembali langsung
  function ubahStatus(user) {
    if (!aktif(user)) return setStatus(user, true)
    konfirmasi({
      title: 'Nonaktifkan Akun',
      message: `Nonaktifkan akun ${user.username}? Pengguna ini tidak bisa masuk sampai akunnya diaktifkan kembali.`,
      confirmLabel: 'Nonaktifkan',
      danger: true,
      onConfirm: () => setStatus(user, false),
    })
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} />
      <PageHeader title="Kelola Pengguna" subtitle="Kelola peran dan akses pengguna sebagai operator atau verifikator.">
        <button type="button" onClick={() => setEditing({})} className={buttonClass()}>
          <img src={addIcon} alt="" width={19} height={19} />
          Buat Akun Baru
        </button>
      </PageHeader>

      <section className="flex flex-col gap-3 rounded-lg bg-grey-500 px-2 pt-6 pb-2">
        <h2 className="px-3 text-h3 text-lime-300">Daftar akun</h2>
        <div className="overflow-x-auto rounded-md bg-white px-2 py-5">
          <table className="w-full min-w-[640px] text-center text-body text-grey-500">
            <thead>
              <tr className="border-b border-grey-75 font-semibold">
                <th className="w-[223px] pb-3">Username</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Peran</th>
                <th className="pb-3">Status</th>
                <th className="w-[207px] pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-grey-200">
                    Belum ada akun.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-grey-75/50 last:border-0">
                  <td className="py-2.5">{u.username}</td>
                  <td className="py-2.5">{u.email}</td>
                  <td className="py-2.5">
                    <Badge tone={TONE[u.role]} className="w-full font-normal">
                      {ROLE_LABELS[u.role]}
                    </Badge>
                  </td>
                  <td className="px-2 py-2.5">
                    <Badge tone={aktif(u) ? 'green' : 'red'} className="w-full font-normal">
                      {aktif(u) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="py-2.5">
                    <span className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => ubahStatus(u)}
                        aria-pressed={!aktif(u)}
                        className={buttonClass('outline', 'sm')}
                      >
                        {aktif(u) ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button type="button" onClick={() => setEditing(u)} aria-label={`Edit ${u.username}`} className="rounded-xs bg-lime-300">
                        <img src={editIcon} alt="" width={24} height={24} />
                      </button>
                      <button type="button" onClick={() => hapus(u)} aria-label={`Hapus ${u.username}`} className="grid size-6 place-items-center rounded-xs bg-red-200">
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

      {editing && <AkunForm akun={editing} users={users} onSave={save} onClose={() => setEditing(null)} />}
      {dialogKonfirmasi}
    </div>
  )
}

export default Users
