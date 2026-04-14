import { User } from '../types'

export const getToken = (): string | null => localStorage.getItem('token')

export const getUser = (): User | null => {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export const setAuth = (token: string, user: User) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const isAuthenticated = (): boolean => !!getToken()

export const isAdmin = (): boolean => getUser()?.role === 'admin'
