import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/auth-context.js'
import LoginPage from '../modules/auth/LoginPage.jsx'
import RegisterPage from '../modules/auth/RegisterPage.jsx'
import {
  CART_STORAGE_KEY,
  calcTotals,
  loadCart,
  saveCart,
} from '../utils/cart.js'

const { mockNavigate, mockLogin, mockAuthenticateAccount, mockRegisterAccount } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockLogin: vi.fn(),
  mockAuthenticateAccount: vi.fn(),
  mockRegisterAccount: vi.fn(),
}))

vi.mock('../services/mockAuth.js', () => ({
  authenticateAccount: mockAuthenticateAccount,
  registerAccount: mockRegisterAccount,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
  }
})

describe('cart utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads a valid cart and ignores malformed items', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items: [
        { codigo: 'GA001', qty: 2 },
        { codigo: 'GA002', qty: 0 },
        { codigo: null, qty: 1 },
        { codigo: 'PE001', qty: '3' },
      ],
      shipping: 'retiro',
      pickupId: 'pickup-1',
    }))

    expect(loadCart()).toEqual({
      items: [{ codigo: 'GA001', qty: 2 }],
      shipping: 'retiro',
      pickupId: 'pickup-1',
    })
  })

  it('stores the cart and calculates pricing with IVA and threshold logic', () => {
    const lines = [{ product: { precio: 50000 }, qty: 3 }]

    saveCart({ items: [{ codigo: 'GA001', qty: 3 }], shipping: 'domicilio' })
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY))).toEqual({
      items: [{ codigo: 'GA001', qty: 3 }],
      shipping: 'domicilio',
    })

    const totals = calcTotals(lines, 'domicilio')
    expect(totals).toMatchObject({
      subtotal: 150000,
      shippingCost: 0,
      hasFreeShipping: true,
      total: 150000,
      ivaIncluded: true,
    })

    const totalsWithShipping = calcTotals([{ product: { precio: 50000 }, qty: 2 }], 'domicilio')
    expect(totalsWithShipping).toMatchObject({
      subtotal: 100000,
      shippingCost: 4990,
      missingForFreeShipping: 50000,
      hasFreeShipping: false,
    })
  })
})

describe('auth form behavior', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockLogin.mockReset()
    mockAuthenticateAccount.mockReset()
    mockRegisterAccount.mockReset()
  })

  it('shows validation errors when the login form is incomplete', () => {
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
  })

  it('logs in successfully with an existing account', async () => {
    mockAuthenticateAccount.mockResolvedValue({
      email: 'cliente@sonidovivo.cl',
      role: 'customer',
      name: 'Cliente Demo',
    })

    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'cliente@sonidovivo.cl' },
    })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i, { selector: 'input' }), {
      target: { value: 'Cliente123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockAuthenticateAccount).toHaveBeenCalledWith('cliente@sonidovivo.cl', 'Cliente123!')
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'cliente@sonidovivo.cl',
        role: 'customer',
        name: 'Cliente Demo',
      }, false)
      expect(mockNavigate).toHaveBeenCalledWith('/pedidos', { replace: true })
    })
  })

  it('validates the registration form before calling the service', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'user@example.cl' } })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i, { selector: 'input' }), {
      target: { value: 'pass123' },
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'pass456' } })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText('Ingresa tu nombre completo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un teléfono válido.')).toBeInTheDocument()
    expect(screen.getByText('Usa al menos 8 caracteres.')).toBeInTheDocument()
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(mockRegisterAccount).not.toHaveBeenCalled()
  })

  it('shows the success state after a valid registration', async () => {
    mockRegisterAccount.mockResolvedValue({
      profile: { email: 'nuevo@ejemplo.cl' },
    })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Nuevo Usuario' } })
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '+56 9 1234 5678' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'nuevo@ejemplo.cl' } })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i, { selector: 'input' }), {
      target: { value: 'Password123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText('Cuenta creada para nuevo@ejemplo.cl.')).toBeInTheDocument()
    expect(mockRegisterAccount).toHaveBeenCalledWith({
      name: 'Nuevo Usuario',
      phone: '+56 9 1234 5678',
      email: 'nuevo@ejemplo.cl',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    })
  })
})
