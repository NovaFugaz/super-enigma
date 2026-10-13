import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ForgotPasswordPage from '../modules/auth/ForgotPasswordPage.jsx'
import ContactPage from '../modules/contact/ContactPage.jsx'

const { mockNavigate, mockAccountExists, mockResetAccountPassword } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockAccountExists: vi.fn(),
  mockResetAccountPassword: vi.fn(),
}))

vi.mock('../services/mockAuth.js', () => ({
  accountExists: mockAccountExists,
  resetAccountPassword: mockResetAccountPassword,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('secondary forms', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockAccountExists.mockReset()
    mockResetAccountPassword.mockReset()
  })

  it('shows validation errors when the recovery email is invalid or not found', () => {
    mockAccountExists.mockReturnValue(false)

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'no-valid' },
    })
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'missing@example.cl' },
    })
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    expect(screen.getByText('No encontramos una cuenta con ese correo.')).toBeInTheDocument()
  })

  it('allows resetting a password after validating the account', async () => {
    mockAccountExists.mockReturnValue(true)
    mockResetAccountPassword.mockResolvedValue(true)

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'cliente@sonidovivo.cl' },
    })
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i, { selector: 'input' }), {
      target: { value: 'NewPassword123!' },
    })
    fireEvent.change(screen.getByLabelText(/^confirmar contraseña$/i, { selector: 'input' }), {
      target: { value: 'NewPassword123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }))

    await waitFor(() => {
      expect(mockResetAccountPassword).toHaveBeenCalledWith('cliente@sonidovivo.cl', 'NewPassword123!')
      expect(screen.getByText('La contraseña de cliente@sonidovivo.cl se actualizó.')).toBeInTheDocument()
    })
  })

  it('renders available store locations and selects a pickup branch', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Sonido Vivo - Tienda', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Starken Viña Batuco/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Starken Viña Batuco/i }))
    expect(screen.getByText('Retiro de pedidos Starken')).toBeInTheDocument()
  })
})
