import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { apiRequest, ApiError } from '../services/api.js'
import { loginAccount, registerAccount } from '../services/authApi.js'
import { fetchProducts, toCatalogProduct } from '../services/catalogApi.js'
import {
  createStaffProduct,
  deactivateStaffProduct,
  fetchStaffProducts,
  updateProductStock,
  updateStaffProduct,
} from '../services/productApi.js'
import {
  createManagedUser,
  fetchManagedUsers,
  updateManagedUser,
} from '../services/userApi.js'
import {
  createPaidOrder,
  fetchMyOrders,
  fetchStaffOrders,
  trackOrder,
  updateStaffOrderStatus,
} from '../services/orderApi.js'
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

  it('creates an order using only the delivery choice and product quantities', async () => {
    const response = {
      id: 'SV-123',
      trackingNumber: 'TRK-123',
      status: 'EN_PROCESO',
      createdAt: '2026-10-13T00:00:00.000Z',
      customerId: 8,
      customerName: 'Cliente Demo',
      customerEmail: 'cliente@example.cl',
      shipping: { method: 'DOMICILIO', address: 'Calle 123', pickup: null },
      items: [{
        code: 'GA001',
        name: 'Guitarra demo',
        brand: 'Yamaha',
        model: 'F310',
        unitPrice: 129990,
        quantity: 1,
        lineTotal: 129990,
      }],
      subtotal: 129990,
      tax: 20713,
      shippingCost: 4990,
      total: 134980,
      payment: { status: 'aprobado', transactionId: 'PAY-123', authorizationCode: 'AUTH-123' },
      receipt: { number: 'BOL-SV-123', issuedAt: '2026-10-13T00:00:00.000Z' },
      statusHistory: [{
        from: 'PENDIENTE',
        status: 'EN_PROCESO',
        actorName: null,
        createdAt: '2026-10-13T00:00:00.000Z',
      }],
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 201 })))

    const order = await createPaidOrder({
      shipping: { method: 'DOMICILIO', address: 'Calle 123', pickupId: null },
      items: [{ code: 'GA001', quantity: 1 }],
      paymentApproved: true,
    })

    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({
      shipping: { method: 'DOMICILIO', address: 'Calle 123', pickupId: null },
      items: [{ code: 'GA001', quantity: 1 }],
      paymentApproved: true,
    }))
    expect(order).toMatchObject({
      id: 'SV-123',
      status: 'en_proceso',
      customerId: '8',
      total: 134980,
      shipping: { method: 'domicilio', address: 'Calle 123' },
      statusHistory: [{ from: 'pendiente', status: 'en_proceso' }],
    })
  })

  it('loads customer orders and tracks by order ID with normalized backend statuses', async () => {
    const summary = {
      id: 'SV-123',
      trackingNumber: 'TRK-123',
      status: 'EN_PROCESO',
      createdAt: '2026-10-13T00:00:00.000Z',
      items: [{ code: 'GA001', name: 'Guitarra demo', quantity: 1 }],
      total: 134980,
      statusHistory: [{ status: 'EN_PROCESO', createdAt: '2026-10-13T00:00:00.000Z' }],
    }
    const tracking = {
      id: 'SV-123',
      trackingNumber: 'TRK-123',
      status: 'EN_PROCESO',
      createdAt: '2026-10-13T00:00:00.000Z',
      shippingMethod: 'DOMICILIO',
      total: 134980,
      items: [{ name: 'Guitarra demo', quantity: 1 }],
      statusHistory: [{ status: 'EN_PROCESO', createdAt: '2026-10-13T00:00:00.000Z' }],
    }
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([summary]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(tracking), { status: 200 })))

    await expect(fetchMyOrders()).resolves.toMatchObject([{ id: 'SV-123', status: 'en_proceso' }])
    await expect(trackOrder('SV-123')).resolves.toMatchObject({
      id: 'SV-123',
      trackingNumber: 'TRK-123',
      status: 'en_proceso',
      shipping: { method: 'domicilio' },
      total: 134980,
    })
    expect(fetch.mock.calls[1][0]).toBe('http://localhost:8080/api/orders/tracking/SV-123')
  })

  it('loads staff orders and patches a status using the backend enum', async () => {
    const makeOrder = (status) => ({
      id: 'SV-STAFF-1',
      trackingNumber: 'TRK-STAFF-1',
      status,
      createdAt: '2026-10-13T00:00:00.000Z',
      customerId: 8,
      customerName: 'Cliente Demo',
      customerEmail: 'cliente@example.cl',
      shipping: { method: 'DOMICILIO', address: 'Calle 123', pickup: null },
      items: [],
      subtotal: 0,
      tax: 0,
      shippingCost: 0,
      total: 0,
      payment: { status: 'aprobado', transactionId: 'PAY-123', authorizationCode: 'AUTH-123' },
      receipt: { number: 'BOL-SV-STAFF-1', issuedAt: '2026-10-13T00:00:00.000Z' },
      statusHistory: [{ from: 'EN_PROCESO', status, actorName: 'Vendedor', createdAt: '2026-10-13T00:00:00.000Z' }],
    })
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([makeOrder('EN_PROCESO')]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(makeOrder('VALIDADO')), { status: 200 })))

    await expect(fetchStaffOrders()).resolves.toMatchObject([{ id: 'SV-STAFF-1', status: 'en_proceso' }])
    await expect(updateStaffOrderStatus('SV-STAFF-1', 'validado')).resolves.toMatchObject({
      id: 'SV-STAFF-1',
      status: 'validado',
    })

    expect(fetch.mock.calls[0][0]).toBe('http://localhost:8080/api/staff/orders')
    expect(fetch.mock.calls[1][0]).toBe('http://localhost:8080/api/staff/orders/SV-STAFF-1/status')
    expect(fetch.mock.calls[1][1]).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({ status: 'VALIDADO' }),
    })
  })

  it('uses staff product endpoints for listing, CRUD and inventory updates', async () => {
    const backendProduct = {
      code: 'ADM-001',
      category: 'guitarras-acusticas',
      name: 'Guitarra Admin',
      brand: 'Demo',
      model: 'ADM-1',
      price: 50000,
      stock: 4,
      description: 'Producto de prueba',
      image: '',
      active: true,
    }
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([backendProduct]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(backendProduct), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...backendProduct, stock: 8 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...backendProduct, name: 'Guitarra Editada' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 })))

    await expect(fetchStaffProducts()).resolves.toMatchObject([{ codigo: 'ADM-001', stock: 4 }])
    await createStaffProduct({
      codigo: 'ADM-001',
      categoria: 'guitarras-acusticas',
      nombre: 'Guitarra Admin',
      marca: 'Demo',
      modelo: 'ADM-1',
      precio: 50000,
      stock: 4,
      descripcion: 'Producto de prueba',
      image: '',
      active: true,
    })
    await expect(updateProductStock('ADM-001', 8)).resolves.toMatchObject({ stock: 8 })
    await expect(updateStaffProduct('ADM-001', {
      ...toCatalogProduct(backendProduct),
      nombre: 'Guitarra Editada',
    })).resolves.toMatchObject({ nombre: 'Guitarra Editada' })
    await deactivateStaffProduct('ADM-001')

    expect(fetch.mock.calls.map(([url, options]) => [url, options.method ?? 'GET'])).toEqual([
      ['http://localhost:8080/api/staff/products?includeInactive=true', 'GET'],
      ['http://localhost:8080/api/staff/products', 'POST'],
      ['http://localhost:8080/api/staff/products/ADM-001/stock', 'PATCH'],
      ['http://localhost:8080/api/staff/products/ADM-001', 'PUT'],
      ['http://localhost:8080/api/staff/products/ADM-001', 'DELETE'],
    ])
    expect(fetch.mock.calls[1][1].body).toContain('"code":"ADM-001"')
    expect(fetch.mock.calls[2][1].body).toBe(JSON.stringify({ stock: 8 }))
  })

  it('lists, creates and updates admin-managed users with mapped roles', async () => {
    const backendUser = (role, active = true) => ({
      id: 8,
      name: 'Usuario Demo',
      phone: '+56 9 1111 1111',
      email: 'usuario@example.cl',
      role,
      active,
    })
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([backendUser('SELLER')]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(backendUser('CUSTOMER')), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(backendUser('CUSTOMER', false)), { status: 200 })))

    await expect(fetchManagedUsers()).resolves.toMatchObject([
      { id: '8', role: 'seller', active: true },
    ])
    await expect(createManagedUser({
      name: 'Usuario Demo',
      phone: '+56 9 1111 1111',
      email: 'usuario@example.cl',
      password: 'Password123!',
      role: 'customer',
    })).resolves.toMatchObject({ id: '8', role: 'customer', active: true })
    await expect(updateManagedUser('8', {
      name: 'Usuario Demo',
      phone: '+56 9 1111 1111',
      email: 'usuario@example.cl',
      role: 'customer',
      active: false,
    })).resolves.toMatchObject({ id: '8', role: 'customer', active: false })

    expect(fetch.mock.calls.map(([url, options]) => [url, options.method ?? 'GET'])).toEqual([
      ['http://localhost:8080/api/admin', 'GET'],
      ['http://localhost:8080/api/admin', 'POST'],
      ['http://localhost:8080/api/admin/8', 'PUT'],
    ])
    expect(fetch.mock.calls[1][1].body).toBe(JSON.stringify({
      name: 'Usuario Demo',
      phone: '+56 9 1111 1111',
      email: 'usuario@example.cl',
      password: 'Password123!',
      role: 'CUSTOMER',
    }))
    expect(fetch.mock.calls[2][1].body).toBe(JSON.stringify({
      name: 'Usuario Demo',
      phone: '+56 9 1111 1111',
      email: 'usuario@example.cl',
      role: 'CUSTOMER',
      active: false,
    }))
  })
})
