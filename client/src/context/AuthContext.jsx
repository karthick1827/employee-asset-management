import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('eams_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('eams_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((freshUser) => {
        setUser(freshUser)
        localStorage.setItem('eams_user', JSON.stringify(freshUser))
      })
      .catch(() => {
        localStorage.removeItem('eams_token')
        localStorage.removeItem('eams_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const { token, user: loggedInUser } = await authApi.login(email, password)
    localStorage.setItem('eams_token', token)
    localStorage.setItem('eams_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return loggedInUser
  }

  function logout() {
    localStorage.removeItem('eams_token')
    localStorage.removeItem('eams_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
