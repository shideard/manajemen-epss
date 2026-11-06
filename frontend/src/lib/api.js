// Laravel menaruh token CSRF di cookie XSRF-TOKEN; dikirim balik lewat header X-XSRF-TOKEN
function xsrfToken() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

// FormData (unggah berkas) dikirim apa adanya; browser yang mengisi Content-Type multipart beserta boundary-nya
async function send(path, method, body) {
  const form = body instanceof FormData
  return fetch(path, {
    method,
    headers: { Accept: 'application/json', ...(!form && { 'Content-Type': 'application/json' }), 'X-XSRF-TOKEN': xsrfToken() },
    body: form ? body : body && JSON.stringify(body),
  })
}

// Unduh berkas dari endpoint terlindungi (cookie sesi ikut terkirim) → Blob
export async function unduh(path) {
  const res = await fetch(path)
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw Object.assign(new Error(data?.message ?? 'Gagal mengunduh berkas.'), { status: res.status })
  }
  return res.blob()
}

export async function api(path, { method = 'GET', body } = {}) {
  if (method !== 'GET' && !xsrfToken()) await fetch('/sanctum/csrf-cookie')

  let res = await send(path, method, body)
  // 419 = token CSRF kedaluwarsa; ambil token baru lalu coba sekali lagi
  if (res.status === 419) {
    await fetch('/sanctum/csrf-cookie')
    res = await send(path, method, body)
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(data?.message ?? 'Terjadi kesalahan, coba lagi.')
    error.status = res.status
    error.errors = data?.errors
    throw error
  }
  return data
}
