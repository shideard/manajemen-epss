import { useState } from 'react'
import { useUsers } from '../lib/store'
import { ROLE_LABELS, ROLES } from '../config/menu'
import { Badge, Field, FormError, Input, Memuat, Modal, ModalActions, Notice, PageHeader, PasswordBaru, PasswordInput, Select } from '../components/ui'
import { buttonClass } from '../components/classes'
import { useConfirm } from '../components/useConfirm'
import { CircleCheck, CircleX, KeyRound, MailCheck, MailX, UserCheck, UserX } from 'lucide-react'
import addIcon from '../assets/rencana/add-circle-fill.svg'

// Tombol aksi berupa ikon; keterangannya muncul saat hover lewat title
const ikonClass = 'inline-flex size-8 items-center justify-center rounded-sm border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-500'

const PERAN = [ROLES.OPERATOR, ROLES.VERIFIKATOR]
const TONE = { [ROLES.OPERATOR]: 'blue', [ROLES.VERIFIKATOR]: 'green' }

// Pesan validasi Laravel (422) per field digabung jadi satu baris
const pesanError = (err) => (err.errors ? Object.values(err.errors).flat().join(' ') : err.message)

function AkunForm({ onSave, onClose }) {
  const [error, setError] = useState('')
  const [mengirim, setMengirim] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setMengirim(true)
    setError('')
    try {
      await onSave({ ...data, email: data.email.trim() })
    } catch (err) {
      setError(pesanError(err))
      setMengirim(false)
    }
  }

  return (
    <Modal title="Buat Akun Baru" width={723} onClose={onClose}>
      <form onSubmit={handleSubmit} className="px-9 pt-7 pb-8">
        {/* fieldset disabled = semua input & tombol terkunci selama dikirim */}
        <fieldset disabled={mengirim} aria-busy={mengirim} className="flex flex-col gap-5.5">
          {/* Dua kolom: Nama | Username, lalu Email | Peran; satu kolom di layar kecil */}
          <div className="grid gap-5.5 sm:grid-cols-2">
            <Field label="Nama">
              <Input name="name" required maxLength={255} placeholder="Contoh: Ani Lestari" />
            </Field>
            <Field label="Username">
              <Input
                name="username"
                required
                minLength={3}
                maxLength={50}
                pattern="[a-z0-9._\-]+"
                title="Huruf kecil, angka, titik, garis bawah, atau tanda hubung"
                autoComplete="off"
                placeholder="Contoh: ani.dinsos"
              />
            </Field>
            <Field label="Email">
              <Input type="email" name="email" required placeholder="Contoh: ani@kotabogor.go.id" />
            </Field>
            <Field label="Peran">
              <Select name="role" required defaultValue="">
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
          </div>
          <PasswordBaru label="Password" />
          <Field label="Ulangi password">
            <PasswordInput name="password_confirmation" required minLength={8} autoComplete="new-password" />
          </Field>
          <p className="text-small text-grey-300">
            Pengguna diminta menggantinya saat pertama kali masuk.
          </p>
          <FormError>{error}</FormError>
          <ModalActions onCancel={onClose} submitLabel={mengirim ? 'Menyimpan...' : 'Simpan'} />
        </fieldset>
      </form>
    </Modal>
  )
}

function Users() {
  const muat = [useUsers()]
  const [{ users, tambah, setStatus, resetPassword: resetPasswordApi }] = muat
  const [membuat, setMembuat] = useState(false)
  const [error, setError] = useState('')
  const [resetResult, setResetResult] = useState(null)
  const [konfirmasi, dialogKonfirmasi] = useConfirm()

  async function save(data) {
    await tambah(data)
    setMembuat(false)
  }

  // Menonaktifkan perlu konfirmasi; mengaktifkan kembali langsung
  function ubahStatus(user) {
    setError('')
    if (!user.status_aktif) return setStatus(user.id, true).catch((err) => setError(pesanError(err)))
    konfirmasi({
      title: 'Nonaktifkan Akun',
      message: `Nonaktifkan akun ${user.username}? Pengguna ini tidak bisa masuk sampai akunnya diaktifkan kembali.`,
      confirmLabel: 'Nonaktifkan',
      danger: true,
      onConfirm: () => setStatus(user.id, false),
    })
  }

  function resetPassword(user) {
    setError('')
    setResetResult(null)
    konfirmasi({
      title: 'Reset password pengguna',
      message: `Buat password sementara untuk ${user.username}? Pengguna harus menggantinya saat masuk kembali.`,
      confirmLabel: 'Reset password',
      onConfirm: async () => {
        try {
          const response = await resetPasswordApi(user.id)
          setResetResult({ username: user.username, password: response.temporary_password })
        } catch (err) {
          setError(pesanError(err))
        }
      },
    })
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Memuat dari={muat} bentuk="tabel" />
      <PageHeader title="Kelola Pengguna" subtitle="Kelola peran dan akses pengguna sebagai operator atau verifikator.">
        <button type="button" onClick={() => setMembuat(true)} className={buttonClass()}>
          <img src={addIcon} alt="" width={19} height={19} />
          Buat Akun Baru
        </button>
      </PageHeader>

      {error && (
        <Notice tone="red" role="alert">
          {error}
        </Notice>
      )}
      {resetResult && (
        <Notice tone="green" role="status">
          Password sementara untuk {resetResult.username}: <strong className="select-all">{resetResult.password}</strong>. Salin dan sampaikan lewat kanal aman; password hanya ditampilkan kali ini.
        </Notice>
      )}

      <section className="flex flex-col gap-3 rounded-lg bg-grey-500 px-2 pt-6 pb-2">
        <div className="flex flex-col gap-1 px-3">
          <h2 className="text-h3 text-lime-300">Daftar akun</h2>
          <p className="text-small text-white">Menampilkan akun yang dibuat dari browser ini.</p>
        </div>
        <div className="overflow-x-auto rounded-md bg-white px-2 py-5">
          <table className="w-full min-w-[1080px] text-center text-body text-grey-500">
            <thead>
              <tr className="border-b border-grey-75 font-semibold">
                <th className="pb-3">Nama</th>
                <th className="pb-3">Username</th>
                <th className="pb-3">Email</th>
                <th className="w-[120px] pb-3">Verifikasi Email</th>
                <th className="pb-3">Peran</th>
                <th className="w-[120px] pb-3">Status</th>
                <th className="w-[120px] pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {users.length === 0 && (
                <tr>
                  <td colSpan={7}className="py-10 text-grey-200">
                    Belum ada akun.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b border-grey-75/50 last:border-0">
                  <td className="py-2.5">{u.name}</td>
                  <td className="py-2.5">{u.username}</td>
                  <td className="py-2.5">{u.email ?? '-'}</td>
                  <td className="px-2 py-2.5">
                    {u.email_verified_at ? (
                      <span title="Email terverifikasi" className="inline-flex text-green-500">
                        <MailCheck size={20} aria-hidden="true" />
                        <span className="sr-only">Terverifikasi</span>
                      </span>
                    ) : (
                      <span title="Email belum terverifikasi" className="inline-flex text-red-400">
                        <MailX size={20} aria-hidden="true" />
                        <span className="sr-only">Belum terverifikasi</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <Badge tone={TONE[u.role]} className="w-full font-normal">
                      {ROLE_LABELS[u.role]}
                    </Badge>
                  </td>
                  <td className="px-2 py-2.5">
                    {u.status_aktif ? (
                      <span title="Akun aktif" className="inline-flex text-green-500">
                        <CircleCheck size={20} aria-hidden="true" />
                        <span className="sr-only">Aktif</span>
                      </span>
                    ) : (
                      <span title="Akun nonaktif" className="inline-flex text-red-400">
                        <CircleX size={20} aria-hidden="true" />
                        <span className="sr-only">Nonaktif</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <div className="flex justify-center gap-2">
                      {/* Backend hanya mengizinkan reset untuk operator/verifikator */}
                      {PERAN.includes(u.role) && (
                        <button type="button" onClick={() => resetPassword(u)} title="Reset password" aria-label={`Reset password ${u.username}`} className={`${ikonClass} border-grey-500 text-grey-500 hover:bg-grey-500/5`}>
                          <KeyRound size={16} aria-hidden="true" />
                        </button>
                      )}
                      {/* Akun superadmin tidak bisa dinonaktifkan dari sini */}
                      {u.role !== ROLES.SUPER_ADMIN_BIDANG && (u.status_aktif ? (
                        <button type="button" onClick={() => ubahStatus(u)} title="Nonaktifkan akun" aria-label={`Nonaktifkan akun ${u.username}`} className={`${ikonClass} border-red-400 text-red-400 hover:bg-red-400/10`}>
                          <UserX size={16} aria-hidden="true" />
                        </button>
                      ) : (
                        <button type="button" onClick={() => ubahStatus(u)} title="Aktifkan akun" aria-label={`Aktifkan akun ${u.username}`} className={`${ikonClass} border-green-500 text-green-500 hover:bg-green-500/10`}>
                          <UserCheck size={16} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {membuat && <AkunForm onSave={save} onClose={() => setMembuat(false)} />}
      {dialogKonfirmasi}
    </div>
  )
}

export default Users
