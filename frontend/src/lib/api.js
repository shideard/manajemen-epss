// Laravel menaruh token CSRF di cookie XSRF-TOKEN; dikirim balik lewat header X-XSRF-TOKEN
function xsrfToken() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function send(path, method, body) {
  return fetch(path, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
    body: body && JSON.stringify(body),
  })
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
