import { clearStoredAuth, getStoredAuth, setStoredAuth } from './auth'

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const error = new Error(data?.detail ?? 'Request failed.')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

async function refreshAccessToken() {
  const auth = getStoredAuth()
  if (!auth?.refresh) {
    throw new Error('No refresh token available.')
  }

  const response = await fetch('/api/auth/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: auth.refresh }),
  })

  const data = await parseResponse(response)
  const nextAuth = {
    ...auth,
    access: data.access,
    refresh: data.refresh ?? auth.refresh,
  }

  setStoredAuth(nextAuth)
  return nextAuth.access
}

export async function apiRequest(path, options = {}) {
  const auth = getStoredAuth()
  const headers = {
    ...(options.headers ?? {}),
  }

  if (!headers['Content-Type'] && options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth?.access && !headers.Authorization) {
    headers.Authorization = `Bearer ${auth.access}`
  }

  const response = await fetch(path, {
    headers,
    ...options,
  })

  if (
    response.status === 401 &&
    !options.skipRefresh &&
    auth?.refresh &&
    !path.includes('/api/auth/login/') &&
    !path.includes('/api/auth/token/refresh/')
  ) {
    try {
      const access = await refreshAccessToken()
      return apiRequest(path, {
        ...options,
        skipRefresh: true,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${access}`,
        },
      })
    } catch {
      clearStoredAuth()
    }
  }

  return parseResponse(response)
}
