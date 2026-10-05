import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import background from '../assets/login/login-bg.png'
import logoLine from '../assets/login/logo-line.svg'
import logo from '../assets/sidebar/logo-kota-bogor.png'

const inputClass =
  'h-[45px] w-full rounded-[15px] border border-lime-200 bg-lime-100 px-5 text-base text-grey-500 placeholder:font-light placeholder:text-[#a0a0a0] focus:outline-2 focus:outline-grey-500'

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api('/login', { method: 'POST', body: Object.fromEntries(new FormData(event.currentTarget)) })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.errors ? Object.values(err.errors)[0][0] : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-4 bg-grey-50 p-4 font-sans">
      {/* Panel foto; disembunyikan di layar kecil */}
      <div className="relative hidden h-[774px] w-[688px] shrink-0 overflow-hidden rounded-[40px] bg-grey-500 lg:block">
        <img src={background} alt="" className="absolute top-0 -left-[53px] size-[806px] max-w-none object-cover opacity-21" />
        <div className="absolute inset-x-0 bottom-[50px] flex items-center justify-center gap-[9px]">
          <img src={logo} alt="Logo Kota Bogor" className="size-[45px] object-cover" />
          <span className="flex h-[42px] w-0 items-center justify-center">
            <img src={logoLine} alt="" className="max-w-none rotate-90" />
          </span>
          <div className="flex w-[198px] flex-col gap-[9px] leading-[1.2] text-white">
            <p className="text-[16.6px] font-bold">Sistem Manajemen EPSS</p>
            <p className="text-[12.8px] font-light">Diskominfo Kota Bogor</p>
          </div>
        </div>
      </div>

      <div className="flex h-[774px] w-full max-w-[694px] items-center justify-center rounded-[40px] bg-white px-6">
        <form onSubmit={handleSubmit} className="flex w-full max-w-[414px] flex-col items-center gap-[72px]">
          <h1 className="text-[31px] leading-[1.2] font-bold text-grey-500">Masuk</h1>
          <div className="flex w-full flex-col gap-[50px]">
            <div className="flex flex-col gap-[14px]">
              <label className="flex flex-col gap-[7px] text-base leading-[1.2] font-semibold text-grey-500">
                Username
                <input name="username" required autoComplete="username" placeholder="Contoh: operator.dinsos" className={inputClass} />
              </label>
              <label className="flex flex-col gap-[7px] text-base leading-[1.2] font-semibold text-grey-500">
                Password
                <input name="password" type="password" required autoComplete="current-password" placeholder="Masukkan password" className={inputClass} />
              </label>
              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[16px] bg-grey-500 px-5 py-[10px] text-base leading-[1.2] font-semibold text-lime-300 disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
