import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { FormError, Memuat, PageHeader } from '../components/ui'
import { buttonClass } from '../components/classes'

const fmtTanggal = (value) => new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value))

const fmtAksi = (log) => {
  const labels = {
    'auth.login': 'Masuk',
    'auth.logout': 'Keluar',
    'password.email': 'Meminta tautan reset password',
    'password.update': 'Mereset password',
  }
  if (labels[log.action]) return labels[log.action]
  return `${log.method} ${log.route_uri}`
}

function LogAktivitas() {
  const [page, setPage] = useState(1)
  const [state, setState] = useState({ loading: true, error: '', logs: [], meta: null })

  useEffect(() => {
    let hidup = true
    api(`/api/audit-logs?page=${page}`).then(
      (result) => hidup && setState({ loading: false, error: '', logs: result.data ?? [], meta: result.meta }),
      (error) => hidup && setState({ loading: false, error: error.message, logs: [], meta: null }),
    )
    return () => { hidup = false }
  }, [page])

  // Status memuat diset saat pindah halaman, bukan di dalam effect
  function pindah(halaman) {
    setState((current) => ({ ...current, loading: true, error: '' }))
    setPage(halaman)
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader title="Log Aktivitas" subtitle="Riwayat aktivitas akun dan permintaan pada aplikasi." />
      {state.loading && <Memuat dari={[{ loading: true }]} bentuk="tabel" />}
      {state.error && <FormError>{state.error}</FormError>}
      {!state.loading && !state.error && (
        <section className="rounded-lg bg-white p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-body text-grey-500">
              <thead><tr className="border-b border-grey-75 text-small font-semibold">
                <th className="px-3 py-3">Waktu</th><th className="px-3 py-3">Pengguna</th><th className="px-3 py-3">Aktivitas</th><th className="px-3 py-3">Target</th><th className="px-3 py-3">Hasil</th><th className="px-3 py-3">IP</th>
              </tr></thead>
              <tbody>
                {state.logs.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-grey-200">Belum ada aktivitas tercatat.</td></tr>}
                {state.logs.map((log) => (
                  <tr key={log.id} className="border-b border-grey-75/60 last:border-0">
                    <td className="whitespace-nowrap px-3 py-3">{fmtTanggal(log.created_at)}</td>
                    <td className="px-3 py-3">{log.actor_name}<span className="block text-small text-grey-200">{log.actor_username ?? 'tanpa akun'}{log.actor_role ? ` · ${log.actor_role}` : ''}</span></td>
                    <td className="px-3 py-3">{fmtAksi(log)}</td>
                    <td className="max-w-[220px] truncate px-3 py-3 text-small">{log.target ? Object.entries(log.target).map(([key, value]) => `${key}: ${typeof value === 'object' ? value.id : value}`).join(', ') : '—'}</td>
                    <td className="px-3 py-3">{log.response_status ?? '—'}</td>
                    <td className="px-3 py-3">{log.ip_address ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-small text-grey-200">Total {state.meta?.total ?? 0} aktivitas</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => pindah(page - 1)} className={buttonClass('outline', 'sm')}>Sebelumnya</button>
              <span className="self-center text-small">{page} / {state.meta?.last_page ?? 1}</span>
              <button type="button" disabled={page >= (state.meta?.last_page ?? 1)} onClick={() => pindah(page + 1)} className={buttonClass('outline', 'sm')}>Berikutnya</button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default LogAktivitas
