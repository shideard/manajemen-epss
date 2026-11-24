import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { Field, FormError, Input, Notice, Spinner } from '../components/ui'
import { buttonClass } from '../components/classes'

function ResetPassword() {
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const [selesai, setSelesai] = useState(false)
  const [mengirim, setMengirim] = useState(false)
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
    <main className="flex min-h-screen items-center justify-center bg-grey2-100 p-4 font-sans">
      <form onSubmit={submit} className="flex w-full max-w-[480px] flex-col gap-6 rounded-xl bg-white p-8">
        <h1 className="text-center text-h1">Buat Password Baru</h1>
        {selesai ? (
          <><Notice tone="green">Password berhasil direset. Silakan masuk kembali.</Notice><Link to="/login" className={`text-center ${buttonClass()}`}>Ke halaman masuk</Link></>
        ) : (
          <>
            <Field label="Password baru"><Input type="password" name="password" required minLength={8} autoComplete="new-password" /></Field>
            <Field label="Ulangi password baru"><Input type="password" name="password_confirmation" required minLength={8} autoComplete="new-password" /></Field>
            <p className="text-small text-grey-300">Minimal 8 karakter, berisi huruf besar, huruf kecil, angka, dan simbol.</p>
            <FormError>{error}</FormError>
            <button type="submit" disabled={mengirim} className={`w-full ${buttonClass()}`}>
              {mengirim && <Spinner />}{mengirim ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </>
        )}
      </form>
    </main>
  )
}

export default ResetPassword
