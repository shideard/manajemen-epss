import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/store'
import background from '../assets/login/login-bg.png'
import logoLine from '../assets/login/logo-line.svg'
import logo from '../assets/sidebar/logo-kota-bogor.png'
import { Field, FormError, Input } from '../components/ui'
import { buttonClass } from '../components/classes'

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { login } = useAuth()

  function handleSubmit(event) {
    event.preventDefault()
    const { username, password } = Object.fromEntries(new FormData(event.currentTarget))
    const gagal = login(username, password)
    if (gagal) return setError(gagal)
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
                <Input name="password" type="password" required autoComplete="current-password" placeholder="Masukkan password" />
              </Field>
              <FormError>{error}</FormError>
            </div>
            <button type="submit" className={`w-full font-semibold ${buttonClass()}`}>
              Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
