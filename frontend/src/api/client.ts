/// <reference types="vite/client" />
const BASE_URL = import.meta.env.VITE_API_URL as string

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 204) return undefined as T

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? res.statusText)
  }

  return data as T
}

export const api = {
  get:    <T>(path: string)                  => request<T>(path),
  post:   <T>(path: string, body: unknown)   => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)   => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path: string)                     => request<void>(path, { method: 'DELETE' }),
}
