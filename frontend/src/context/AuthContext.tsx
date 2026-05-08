import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthResponse, LoginPayload, RegisterPayload } from '../types'
import { authService } from '../services/authService'
import { setAuth, clearAuth, getUser, getToken } from '../utils/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  setAuthFromResponse: (response: AuthResponse) => void
  logout: () => void
  updateUser: (user: User) => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getUser)
  const [token, setToken] = useState<string | null>(getToken)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const storedUser = getUser()
    const storedToken = getToken()
    if (storedUser && storedToken) {
      setUser(storedUser)
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    const t = getToken()
    if (!t) return
    authService
      .getProfile()
      .then((fresh) => {
        setUser(fresh)
        setAuth(t, fresh)
      })
      .catch(() => {
        clearAuth()
        setUser(null)
        setToken(null)
      })
  }, [])

  const setAuthFromResponse = ({ token: t, user: u }: AuthResponse) => {
    setAuth(t, u)
    setToken(t)
    setUser(u)
  }

  const login = async (payload: LoginPayload) => {
    setIsLoading(true)
    try {
      const response = await authService.login(payload)
      setAuthFromResponse(response)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true)
    try {
      const result = await authService.registerInitiate(payload)
      // Registration now requires OTP verification — caller handles the result
      return result as any
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAuth()
    setUser(null)
    setToken(null)
  }

  const updateUser = (next: User) => {
    const t = getToken()
    if (t) setAuth(t, next)
    setUser(next)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        setAuthFromResponse,
        logout,
        updateUser,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
