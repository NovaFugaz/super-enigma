import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthContext } from '../context/auth-context.js'
import ProtectedRoute from '../routes/ProtectedRoute.jsx'

function renderProtectedRoute({ user, allowedRoles, ready = true }) {
  return render(
    <AuthContext.Provider value={{ user, ready, login: () => {}, logout: () => {} }}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<p>Login destination</p>} />
          <Route path="/403" element={<p>Access denied destination</p>} />
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path="/protected" element={<p>Protected content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects an anonymous visitor to login', () => {
    renderProtectedRoute({ user: null, allowedRoles: ['seller'] })

    expect(screen.getByText('Login destination')).toBeInTheDocument()
  })

  it('redirects an authenticated user with the wrong role to 403', () => {
    renderProtectedRoute({ user: { role: 'customer' }, allowedRoles: ['seller'] })

    expect(screen.getByText('Access denied destination')).toBeInTheDocument()
  })

  it('renders protected content for an allowed seller', () => {
    renderProtectedRoute({ user: { role: 'seller' }, allowedRoles: ['seller'] })

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('renders protected content for an allowed administrator', () => {
    renderProtectedRoute({ user: { role: 'admin' }, allowedRoles: ['admin'] })

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('waits for demo account initialization before deciding access', () => {
    renderProtectedRoute({ user: null, allowedRoles: ['seller'], ready: false })

    expect(screen.getByRole('status')).toHaveTextContent('Preparando cuentas de demostración')
  })
})