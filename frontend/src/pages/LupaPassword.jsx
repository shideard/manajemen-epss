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
    <div className="flex min-h-screen items-center justify-center bg-grey2-100 p-4 font-sans">
      <div className="flex w-full max-w-[694px] justify-center rounded-xl bg-white px-6 py-16 motion-safe:animate-rise">
        <form onSubmit={submit} className="flex w-full max-w-[414px] flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <h1 className="text-h1">Lupa Password</h1>
            <p className="text-grey-300">Masukkan email terverifikasi pada akun Anda. Jika cocok, kami akan mengirim tautan reset yang berlaku 60 menit.</p>
          </div>
          <div className="flex flex-col gap-3.5">
            <Field label="Email">
              <Input type="email" name="email" required autoComplete="email" placeholder="nama@contoh.com" />
            </Field>
            {pesan && <Notice tone="green">{pesan}</Notice>}
            <FormError>{error}</FormError>
          </div>
          <div className="flex flex-col gap-3">
            <button type="submit" disabled={mengirim} aria-busy={mengirim} className={`w-full font-semibold ${buttonClass()}`}>
              {mengirim && <Spinner />}
              {mengirim ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>
            <Link to="/login" className={`w-full ${buttonClass('outline')}`}>Kembali ke Halaman Masuk</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LupaPassword
