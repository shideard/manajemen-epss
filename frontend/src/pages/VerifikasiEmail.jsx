import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/store'
import { wajibGantiPassword } from '../lib/epss'
import { Field, FormError, Input, Memuat, Notice, Spinner } from '../components/ui'
import { buttonClass } from '../components/classes'

// AppLayout mengarahkan ke sini selama email pemulihan belum terverifikasi, sebelum alur Ganti Password.
// Tautan di email dibuka di backend; setelah itu pengguna kembali ke sini dan menekan "Saya sudah verifikasi".
// ponytail: status berhasil/kedaluwarsa tautan belum tampil di sini, tunggu backend mengarahkan tautan ke frontend
function VerifikasiEmail() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [terkirim, setTerkirim] = useState('')
  const [error, setError] = useState('')
  const [proses, setProses] = useState('')

  async function kirim(event) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email').trim()
    setProses('kirim')
    setError('')
    try {
      await auth.kirimVerifikasi(email)
      setTerkirim(email)
    } catch (err) {
      setError(
        err.status === 429
          ? 'Terlalu banyak permintaan. Tunggu beberapa menit sebelum mengirim ulang.'
          : err.errors ? Object.values(err.errors).flat().join(' ') : err.message,
      )
    }
    setProses('')
  }

  async function cekStatus() {
    setProses('cek')
    setError('')
    await auth.refresh()
    setProses('')
    // Jika sudah terverifikasi, render ulang mengarahkan ke langkah berikutnya
    setError('Email belum terverifikasi. Buka tautan di email Anda (berlaku 60 menit) atau kirim ulang.')
  }

  async function keluar() {
    await auth.logout()
    navigate('/login', { replace: true })
  }

  const { user } = auth
  if (!user) return auth.loading || auth.error ? <Memuat dari={[auth]} layar /> : <Navigate to="/login" replace />
  if (user.email_verified_at) return <Navigate to={wajibGantiPassword(user) ? '/ganti-password' : '/pilih-periode'} replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey2-100 p-4 font-sans">
      <div className="flex w-full max-w-[694px] justify-center rounded-xl bg-white px-6 py-16 motion-safe:animate-rise">
        <form onSubmit={kirim} className="flex w-full max-w-[414px] flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <h1 className="text-h1">Verifikasi Email</h1>
            <p className="text-grey-300">
              Akun Anda memerlukan email pemulihan yang terverifikasi sebelum melanjutkan.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            <Field label="Email">
              <Input name="email" type="email" required autoComplete="email" defaultValue={user.email ?? ''} placeholder="Contoh: ani@kotabogor.go.id" />
            </Field>
            {terkirim && (
              <Notice tone="green">
                Tautan verifikasi dikirim ke <strong>{terkirim}</strong>. Buka email Anda dan klik tautannya, lalu kembali ke
                sini dan tekan "Saya sudah verifikasi" atau masuk kembali.
              </Notice>
            )}
            <FormError>{error}</FormError>
          </div>
          <div className="flex flex-col gap-3">
            <button type="submit" disabled={!!proses} aria-busy={proses === 'kirim'} className={`w-full font-semibold ${buttonClass()}`}>
              {proses === 'kirim' && <Spinner />}
              {proses === 'kirim' ? 'Mengirim...' : terkirim ? 'Kirim Ulang Tautan' : 'Kirim Tautan Verifikasi'}
            </button>
            <button type="button" onClick={cekStatus} disabled={!!proses} aria-busy={proses === 'cek'} className={`w-full ${buttonClass('outline')}`}>
              {proses === 'cek' && <Spinner />}
              Saya sudah verifikasi
            </button>
            <button type="button" onClick={keluar} disabled={!!proses} className={`w-full ${buttonClass('outline')}`}>
              Keluar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifikasiEmail
