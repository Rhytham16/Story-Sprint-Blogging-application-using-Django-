import { apiRequest } from './client'

export function getDashboardSummary() {
  return apiRequest('/api/dashboard/summary/')
}

export function getDashboardOptions() {
  return apiRequest('/api/dashboard/options/')
}

export function getCategories() {
  return apiRequest('/api/categories/')
}

export function getCategory(id) {
  return apiRequest(`/api/categories/${id}/`)
}

export function createCategory(payload) {
  return apiRequest('/api/categories/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCategory(id, payload) {
  return apiRequest(`/api/categories/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteCategory(id) {
  return apiRequest(`/api/categories/${id}/`, {
    method: 'DELETE',
  })
}

export function getDashboardPosts() {
  return apiRequest('/api/posts/')
}

export function getDashboardPost(slug) {
  return apiRequest(`/api/posts/${slug}/`)
}

export function createPost(formData) {
  return apiRequest('/api/posts/', {
    method: 'POST',
    body: formData,
  })
}

export function updatePost(slug, formData) {
  return apiRequest(`/api/posts/${slug}/`, {
    method: 'PATCH',
    body: formData,
  })
}

export function deletePost(slug) {
  return apiRequest(`/api/posts/${slug}/`, {
    method: 'DELETE',
  })
}

export function getUsers() {
  return apiRequest('/api/users/')
}

export function getUser(id) {
  return apiRequest(`/api/users/${id}/`)
}

export function createUser(payload) {
  return apiRequest('/api/users/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateUser(id, payload) {
  return apiRequest(`/api/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteUser(id) {
  return apiRequest(`/api/users/${id}/`, {
    method: 'DELETE',
  })
}
