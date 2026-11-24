import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { Field, FormError, Notice, PasswordInput, Spinner, SyaratPassword } from '../components/ui'
import { buttonClass } from '../components/classes'

function ResetPassword() {
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const [selesai, setSelesai] = useState(false)
  const [mengirim, setMengirim] = useState(false)
  const [password, setPassword] = useState('')
  const token = params.get('token')
  const email = params.get('email')

  if (!token || !email) return <Navigate to="/lupa-password" replace />

  async function submit(event) {
    event.preventDefault()
    const body = Object.fromEntries(new FormData(event.currentTarget))
    setMengirim(true)
    setError('')
    try {
      await api('/api/password/reset', { method: 'POST', body: { ...body, token, email } })
      setSelesai(true)
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).flat().join(' ') : err.message)
    } finally {
      setMengirim(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey2-100 p-4 font-sans">
      <div className="flex w-full max-w-[694px] justify-center rounded-xl bg-white px-6 py-16 motion-safe:animate-rise">
        <form onSubmit={submit} className="flex w-full max-w-[414px] flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <h1 className="text-h1">Buat Password Baru</h1>
            <p className="text-grey-300">Untuk akun {email}</p>
          </div>
          {selesai ? (
            <>
              <Notice tone="green">Password berhasil direset. Silakan masuk kembali.</Notice>
              <Link to="/login" className={`w-full font-semibold ${buttonClass()}`}>Ke Halaman Masuk</Link>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3.5">
                <Field label="Password baru">
                  <PasswordInput name="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Field>
                <SyaratPassword password={password} />
                <Field label="Ulangi password baru">
                  <PasswordInput name="password_confirmation" required minLength={8} autoComplete="new-password" />
                </Field>
                <FormError>{error}</FormError>
              </div>
              <div className="flex flex-col gap-3">
                <button type="submit" disabled={mengirim} aria-busy={mengirim} className={`w-full font-semibold ${buttonClass()}`}>
                  {mengirim && <Spinner />}
                  {mengirim ? 'Menyimpan...' : 'Simpan Password Baru'}
                </button>
                <Link to="/login" className={`w-full ${buttonClass('outline')}`}>Kembali ke Halaman Masuk</Link>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
