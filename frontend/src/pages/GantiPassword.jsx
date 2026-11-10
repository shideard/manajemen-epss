import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/store'
import { wajibGantiPassword } from '../lib/epss'
import { Field, FormError, Input, Memuat, Spinner } from '../components/ui'
import { buttonClass } from '../components/classes'

// Akun baru, akun yang direset, atau password berumur 1 tahun diarahkan ke sini oleh AppLayout:
// backend menolak semua menu (403 PASSWORD_CHANGE_REQUIRED) sampai password diganti
function GantiPassword() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [error, setError] = useState('')
  const [mengirim, setMengirim] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMengirim(true)
    setError('')
    try {
      await auth.gantiPassword(Object.fromEntries(new FormData(event.currentTarget)))
      navigate('/pilih-periode', { replace: true })
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).flat().join(' ') : err.message)
      setMengirim(false)
    }
  }

  async function keluar() {
    await auth.logout()
    navigate('/login', { replace: true })
  }

  if (!auth.user) return auth.loading || auth.error ? <Memuat dari={[auth]} layar /> : <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey2-100 p-4 font-sans">
      <div className="flex w-full max-w-[694px] justify-center rounded-xl bg-white px-6 py-16 motion-safe:animate-rise">
        <form onSubmit={handleSubmit} className="flex w-full max-w-[414px] flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <h1 className="text-h1">Ganti Password</h1>
            {wajibGantiPassword(auth.user) && (
              <p className="text-grey-300">Password Anda harus diganti sebelum melanjutkan.</p>
            )}
          </div>
          <div className="flex flex-col gap-3.5">
            <Field label="Password saat ini">
              <Input name="current_password" type="password" required autoComplete="current-password" />
            </Field>
            <Field label="Password baru">
              <Input name="password" type="password" required autoComplete="new-password" />
            </Field>
            <Field label="Ulangi password baru">
              <Input name="password_confirmation" type="password" required autoComplete="new-password" />
            </Field>
            <p className="text-small text-grey-300">Minimal 8 karakter, berisi huruf besar, huruf kecil, angka, dan simbol.</p>
            <FormError>{error}</FormError>
          </div>
          <div className="flex flex-col gap-3">
            <button type="submit" disabled={mengirim} aria-busy={mengirim} className={`w-full font-semibold ${buttonClass()}`}>
              {mengirim && <Spinner />}
              {mengirim ? 'Memproses...' : 'Simpan Password'}
            </button>
            <button type="button" onClick={keluar} disabled={mengirim} className={`w-full ${buttonClass('outline')}`}>
              Keluar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GantiPassword
