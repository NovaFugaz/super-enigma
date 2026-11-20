import { useState } from 'react'
import { AuthContext } from './auth-context.js'

const SESSION_KEY = 'sonido-vivo-session'

function readSession() {
  try {
    const serialized =
      window.sessionStorage.getItem(SESSION_KEY) ?? window.localStorage.getItem(SESSION_KEY)
    const session = serialized ? JSON.parse(serialized) : null
    if (
      !session ||
      typeof session.token !== 'string' ||
      !session.token ||
      typeof session.user?.email !== 'string' ||
      !['customer', 'seller', 'admin'].includes(session.user.role)
    ) return null
    return session
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const login = (profile, token, remember) => {
    const serialized = JSON.stringify({ user: profile, token })
    window.localStorage.removeItem(SESSION_KEY)
    window.sessionStorage.removeItem(SESSION_KEY)
    const storage = remember ? window.localStorage : window.sessionStorage
    storage.setItem(SESSION_KEY, serialized)
    setSession({ user: profile, token })
  }

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY)
    window.sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, token: session?.token ?? null, ready: true, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}