import { useState } from 'react'
import { AuthContext } from './auth-context.js'

const SESSION_KEY = 'sonido-vivo-session'

function readSession() {
  try {
    const serialized =
      window.sessionStorage.getItem(SESSION_KEY) ?? window.localStorage.getItem(SESSION_KEY)
    const user = serialized ? JSON.parse(serialized) : null
    return user && typeof user.email === 'string' ? user : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const login = (profile, remember) => {
    try {
      window.localStorage.removeItem(SESSION_KEY)
      window.sessionStorage.removeItem(SESSION_KEY)
      const storage = remember ? window.localStorage : window.sessionStorage
      storage.setItem(SESSION_KEY, JSON.stringify(profile))
    } catch {
      // Keep the session active for this page when storage is unavailable.
    }
    setUser(profile)
  }

  const logout = () => {
    try {
      window.localStorage.removeItem(SESSION_KEY)
      window.sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // The in-memory session is still cleared below.
    }
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}