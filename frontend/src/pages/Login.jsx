import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/store'
import { api } from '../lib/api'
import background from '../assets/login/login-bg.png'
import logoLine from '../assets/login/logo-line.svg'
import logo from '../assets/sidebar/logo-kota-bogor.png'
import { Field, FormError, Input, PasswordInput, Spinner } from '../components/ui'
import { buttonClass } from '../components/classes'

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [mengirim, setMengirim] = useState(false)
  const { login } = useAuth()
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [captchaLoading, setCaptchaLoading] = useState(true)
  const [captchaError, setCaptchaError] = useState('')
  const turnstileContainer = useRef(null)
  const turnstileWidget = useRef(null)

  const [captchaAttempt, setCaptchaAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    api(`/captcha?_=${Date.now()}`)
      .then((response) => {
        if (!response.siteKey) throw new Error('Cloudflare Turnstile belum dikonfigurasi.')
        if (!cancelled) setTurnstileSiteKey(response.siteKey)
      })
      .catch(() => {
        if (cancelled) return
        setTurnstileSiteKey('')
        setCaptchaError('Verifikasi keamanan gagal dimuat. Periksa konfigurasi Turnstile lalu coba lagi.')
      })
      .finally(() => { if (!cancelled) setCaptchaLoading(false) })
    return () => { cancelled = true }
  }, [captchaAttempt])

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainer.current) return undefined

    let cancelled = false
    const renderWidget = () => {
      if (cancelled || !window.turnstile || !turnstileContainer.current) return
      turnstileWidget.current = window.turnstile.render(turnstileContainer.current, {
        sitekey: turnstileSiteKey,
        action: 'login',
        callback: (token) => {
          setTurnstileToken(token)
          setCaptchaError('')
        },
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => {
          setTurnstileToken('')
          setCaptchaError('Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi.')
        },
      })
    }

    let script = document.querySelector('script[data-turnstile-api]')
    if (window.turnstile) {
      renderWidget()
    } else if (script) {
      script.addEventListener('load', renderWidget, { once: true })
    } else {
      script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.dataset.turnstileApi = 'true'
      script.addEventListener('load', renderWidget, { once: true })
      script.addEventListener('error', () => setCaptchaError('Layanan Cloudflare Turnstile tidak dapat dimuat.'), { once: true })
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      if (turnstileWidget.current !== null && window.turnstile) {
        window.turnstile.remove(turnstileWidget.current)
        turnstileWidget.current = null
      }
    }
  }, [turnstileSiteKey])

  async function handleSubmit(event) {
    event.preventDefault()
    const { username, password } = Object.fromEntries(new FormData(event.currentTarget))
    setMengirim(true)
    setError('')
    const gagal = await login(username, password, turnstileToken)
    setMengirim(false)
    if (gagal) {
      setError(gagal)
      setTurnstileToken('')
      if (turnstileWidget.current !== null && window.turnstile) window.turnstile.reset(turnstileWidget.current)
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
                <PasswordInput name="password" required autoComplete="current-password" placeholder="Masukkan password" />
              </Field>
              <div className="text-end">
                <Link to="/lupa-password" className="text-small text-grey-300 underline hover:text-grey-500">Lupa password?</Link>
              </div>
              <Field label="Verifikasi keamanan">
                <div ref={turnstileContainer} aria-label="Verifikasi Cloudflare Turnstile" />
              </Field>
              {captchaError && (
                <div className="flex items-center justify-between gap-3 text-small text-red-400">
                  <span>{captchaError}</span>
                  <button type="button" onClick={() => { setCaptchaLoading(true); setCaptchaError(''); setCaptchaAttempt((n) => n + 1) }} disabled={captchaLoading} className="shrink-0 underline">
                    Coba lagi
                  </button>
                </div>
              )}
              <FormError>{error}</FormError>
            </div>
            <button type="submit" disabled={mengirim || captchaLoading || !turnstileSiteKey || !turnstileToken} aria-busy={mengirim} className={`w-full font-semibold ${buttonClass()}`}>
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
