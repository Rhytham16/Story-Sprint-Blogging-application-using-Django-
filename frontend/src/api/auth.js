const AUTH_STORAGE_KEY = 'blog_app_auth'

export function getStoredAuth() {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setStoredAuth(payload) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
