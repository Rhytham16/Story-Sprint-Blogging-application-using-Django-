import { clearStoredAuth, setStoredAuth } from './auth'
import { apiRequest } from './client'

export function getSiteMeta() {
  return apiRequest('/api/site/')
}

export function getCurrentUser() {
  return apiRequest('/api/auth/me/')
}

export function getPosts(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const queryString = searchParams.toString()
  const path = queryString ? `/api/posts/?${queryString}` : '/api/posts/'
  return apiRequest(path)
}

export function searchPosts(keyword) {
  const searchParams = new URLSearchParams()
  if (keyword?.trim()) {
    searchParams.set('keyword', keyword.trim())
  }

  return apiRequest(`/api/posts/search/?${searchParams.toString()}`)
}

export function getPostDetail(slug) {
  return apiRequest(`/api/posts/${slug}/`)
}

export function createComment(slug, comment) {
  return apiRequest(`/api/posts/${slug}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  })
}

export function logoutUser() {
  const refresh = JSON.parse(window.localStorage.getItem('blog_app_auth') ?? 'null')?.refresh
  return apiRequest('/api/auth/logout/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  }).finally(() => {
    clearStoredAuth()
  })
}

export async function loginUser(credentials) {
  const data = await apiRequest('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipRefresh: true,
  })

  setStoredAuth({
    access: data.access,
    refresh: data.refresh,
    user: data.user,
  })

  return data
}

export function registerUser(payload) {
  return apiRequest('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipRefresh: true,
  })
}
