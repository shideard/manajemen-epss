import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/store'
import { api } from '../lib/api'
import background from '../assets/login/login-bg.png'
import logoLine from '../assets/login/logo-line.svg'
import logo from '../assets/sidebar/logo-kota-bogor.png'
import { Field, FormError, Input, Spinner } from '../components/ui'
import { buttonClass } from '../components/classes'

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mengirim, setMengirim] = useState(false)
  const { login } = useAuth()
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaLoading, setCaptchaLoading] = useState(true)
  const [captchaError, setCaptchaError] = useState('')
  const captchaLoadStarted = useRef(false)

  async function loadCaptcha() {
    setCaptchaLoading(true)
    setCaptchaError('')
    try {
      const response = await api(`/captcha?_=${Date.now()}`)
      setCaptchaQuestion(response.question)
    } catch {
      setCaptchaQuestion('')
      setCaptchaError('Soal verifikasi gagal dimuat.')
    } finally {
      setCaptchaLoading(false)
    }
  }

  useEffect(() => {
    if (captchaLoadStarted.current) return

    captchaLoadStarted.current = true
    loadCaptcha()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const { username, password, captcha } = Object.fromEntries(new FormData(event.currentTarget))
    setMengirim(true)
    setError('')
    const gagal = await login(username, password, captcha)
    setMengirim(false)
    if (gagal) {
      setError(gagal)
      await loadCaptcha()
      return
    }
    // Akun yang wajib ganti password dialihkan AppLayout ke halaman Ganti Password
    navigate('/pilih-periode', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-4 bg-grey2-100 p-4 font-sans">
      {/* Panel foto; disembunyikan di layar kecil */}
      <div className="relative hidden h-[774px] w-[688px] shrink-0 overflow-hidden rounded-xl bg-grey-500 motion-safe:animate-rise lg:block">
        <img src={background} alt="" className="absolute top-0 -left-[53px] size-[806px] max-w-none object-cover opacity-21 motion-safe:animate-settle" />
        <div className="absolute inset-x-0 bottom-[50px] flex items-center justify-center gap-2">
          <img src={logo} alt="Logo Kota Bogor" className="size-[45px] object-cover" />
          <span className="flex h-[42px] w-0 items-center justify-center">
            <img src={logoLine} alt="" className="max-w-none rotate-90" />
          </span>
          <div className="flex w-[198px] flex-col gap-2 text-white">
            <p className="text-body font-bold">Sistem Manajemen EPSS</p>
            <p className="text-small font-light">Diskominfo Kota Bogor</p>
          </div>
        </div>
      </div>

      <div className="flex h-[774px] w-full max-w-[694px] items-center justify-center rounded-xl bg-white px-6 motion-safe:animate-rise motion-safe:[animation-delay:120ms]">
        <form onSubmit={handleSubmit} className="flex w-full max-w-[414px] flex-col items-center gap-18">
          <h1 className="text-h1">Masuk</h1>
          <div className="flex w-full flex-col gap-12.5">
            <div className="flex flex-col gap-3.5">
              <Field label="Username">
                <Input name="username" required autoComplete="username" placeholder="Contoh: operator.dinsos" />
              </Field>
              <Field label="Password">
                <span className="relative block">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-grey-300 hover:text-grey-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-500"
                  >
                    {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </button>
                </span>
              </Field>
              <Field label={`Verifikasi: ${captchaLoading ? 'Memuat soal…' : captchaQuestion || 'Belum tersedia'}`}>
                <Input name="captcha" type="number" inputMode="numeric" required disabled={captchaLoading} placeholder="Masukkan hasil hitung" />
              </Field>
              {captchaError && (
                <div className="flex items-center justify-between gap-3 text-small text-red-400">
                  <span>{captchaError}</span>
                  <button type="button" onClick={loadCaptcha} disabled={captchaLoading} className="shrink-0 underline">
                    Coba lagi
                  </button>
                </div>
              )}
              <FormError>{error}</FormError>
            </div>
            <button type="submit" disabled={mengirim || captchaLoading || !captchaQuestion} aria-busy={mengirim} className={`w-full font-semibold ${buttonClass()}`}>
              {mengirim && <Spinner />}
              {mengirim ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
