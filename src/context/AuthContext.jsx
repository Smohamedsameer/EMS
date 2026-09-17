import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../services/api.js'

const AuthContext = createContext(null)

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('ems_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser())
  const [token, setToken] = useState(localStorage.getItem('ems_token'))

  const login = useCallback(async (usernameOrEmail, password) => {
    const data = await authApi.login(usernameOrEmail, password)
    const loggedInUser = {
      userId: data.userId,
      username: data.username,
      email: data.email,
      role: data.role,
      employeeDbId: data.employeeDbId,
      employeeId: data.employeeId,
      name: data.name
    }
    localStorage.setItem('ems_token', data.token)
    localStorage.setItem('ems_user', JSON.stringify(loggedInUser))
    setToken(data.token)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ems_token')
    localStorage.removeItem('ems_user')
    setToken(null)
    setUser(null)
  }, [])

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
