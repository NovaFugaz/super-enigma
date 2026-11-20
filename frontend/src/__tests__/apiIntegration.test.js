import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { apiRequest, ApiError } from '../services/api.js'
import { loginAccount, registerAccount } from '../services/authApi.js'
import { fetchProducts, toCatalogProduct } from '../services/catalogApi.js'
import { confirmPasswordReset, requestPasswordReset } from '../services/passwordResetApi.js'

describe('backend API integration services', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('sends the persisted JWT to protected API requests', async () => {
    sessionStorage.setItem('sonido-vivo-session', JSON.stringify({
      user: { email: 'cliente@example.cl' },
      token: 'jwt-test-token',
    }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]', { status: 200 })))

    await apiRequest('/api/staff/orders')

    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/staff/orders', expect.any(Object))
    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer jwt-test-token')
  })

  it('surfaces backend errors with their HTTP status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ message: 'Correo o contraseña incorrectos' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )))

    await expect(apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'wrong@example.cl', password: 'bad-password' },
    })).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Correo o contraseña incorrectos',
    })
    expect(ApiError).toBeTypeOf('function')
  })

  it.each([
    ['CUSTOMER', 'customer'],
    ['SELLER', 'seller'],
    ['ADMIN', 'admin'],
  ])('maps backend role %s to frontend role %s', async (backendRole, frontendRole) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      token: 'jwt-customer',
      user: {
        id: 8,
        name: 'Cliente Demo',
        phone: '+56 9 1111 1111',
        email: 'cliente@example.cl',
        role: backendRole,
        active: true,
      },
    }), { status: 200 })))

    const result = await loginAccount('cliente@example.cl', 'password123')

    expect(result).toEqual({
      token: 'jwt-customer',
      profile: {
        id: '8',
        name: 'Cliente Demo',
        phone: '+56 9 1111 1111',
        email: 'cliente@example.cl',
        role: frontendRole,
        active: true,
      },
    })
  })

  it('uses the backend registration response and maps its role', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      token: 'jwt-new-user',
      user: {
        id: 9,
        name: 'Nuevo Cliente',
        phone: '+56 9 2222 2222',
        email: 'nuevo@example.cl',
        role: 'CUSTOMER',
        active: true,
      },
    }), { status: 201 })))

    await registerAccount({
      name: 'Nuevo Cliente',
      phone: '+56 9 2222 2222',
      email: 'nuevo@example.cl',
      password: 'password123',
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Nuevo Cliente',
          phone: '+56 9 2222 2222',
          email: 'nuevo@example.cl',
          password: 'password123',
        }),
      }),
    )
  })

  it('maps backend catalog fields to the existing storefront model', async () => {
    const product = {
      code: 'GA001',
      category: 'guitarras-acusticas',
      name: 'Guitarra demo',
      brand: 'Yamaha',
      model: 'F310',
      price: 129990,
      stock: 4,
      description: 'Descripción',
      image: '',
      active: true,
    }

    expect(toCatalogProduct(product)).toEqual({
      codigo: 'GA001',
      categoria: 'guitarras-acusticas',
      nombre: 'Guitarra demo',
      marca: 'Yamaha',
      modelo: 'F310',
      precio: 129990,
      stock: 4,
      descripcion: 'Descripción',
      image: '',
      active: true,
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([product]), { status: 200 })))
    await expect(fetchProducts()).resolves.toEqual([toCatalogProduct(product)])
  })

  it('persists and restores the authenticated user with the JWT in the selected storage', () => {
    const profile = {
      id: '8',
      name: 'Cliente Demo',
      phone: '+56 9 1111 1111',
      email: 'cliente@example.cl',
      role: 'customer',
      active: true,
    }
    const { result, unmount } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    act(() => result.current.login(profile, 'jwt-persisted', true))
    expect(JSON.parse(localStorage.getItem('sonido-vivo-session'))).toEqual({
      user: profile,
      token: 'jwt-persisted',
    })
    expect(sessionStorage.getItem('sonido-vivo-session')).toBeNull()
    unmount()

    const restored = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(restored.result.current.user).toEqual(profile)
    expect(restored.result.current.token).toBe('jwt-persisted')
  })

  it('calls the password reset endpoints with their expected payloads', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'accepted' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'updated' }), { status: 200 })))

    await requestPasswordReset('cliente@example.cl')
    await confirmPasswordReset('one-time-token', 'NewPassword123!')

    expect(fetch.mock.calls.map(([url, options]) => [url, options.body])).toEqual([
      [
        'http://localhost:8080/api/auth/password-reset/request',
        JSON.stringify({ email: 'cliente@example.cl' }),
      ],
      [
        'http://localhost:8080/api/auth/password-reset/confirm',
        JSON.stringify({ token: 'one-time-token', newPassword: 'NewPassword123!' }),
      ],
    ])
  })
})
