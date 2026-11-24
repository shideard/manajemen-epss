import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Field, FormError, Input, Notice, Spinner } from '../components/ui'
import { buttonClass } from '../components/classes'

function LupaPassword() {
  const [pesan, setPesan] = useState('')
  const [error, setError] = useState('')
  const [mengirim, setMengirim] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email').trim()
    setMengirim(true)
    setError('')
    setPesan('')
    try {
      const result = await api('/api/password/forgot', { method: 'POST', body: { email } })
      setPesan(result.message)
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).flat().join(' ') : err.message)
    } finally {
      setMengirim(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-grey2-100 p-4 font-sans">
      <form onSubmit={submit} className="flex w-full max-w-[480px] flex-col gap-6 rounded-xl bg-white p-8">
        <h1 className="text-center text-h1">Lupa Password</h1>
        <p className="text-grey-300">Masukkan email terverifikasi pada akun Anda. Jika cocok, kami akan mengirim tautan reset yang berlaku 60 menit.</p>
        <Field label="Email"><Input type="email" name="email" required autoComplete="email" /></Field>
        {pesan && <Notice tone="green" role="status">{pesan}</Notice>}
        <FormError>{error}</FormError>
        <button type="submit" disabled={mengirim} className={`w-full ${buttonClass()}`}>
          {mengirim && <Spinner />}{mengirim ? 'Mengirim...' : 'Kirim Tautan Reset'}
        </button>
        <Link to="/login" className="text-center text-small underline">Kembali ke halaman masuk</Link>
      </form>
    </main>
  )
}

export default LupaPassword
