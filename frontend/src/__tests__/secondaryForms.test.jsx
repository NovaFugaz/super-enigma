import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ForgotPasswordPage from '../modules/auth/ForgotPasswordPage.jsx'
import ContactPage from '../modules/contact/ContactPage.jsx'

const { mockRequestPasswordReset, mockConfirmPasswordReset } = vi.hoisted(() => ({
  mockRequestPasswordReset: vi.fn(),
  mockConfirmPasswordReset: vi.fn(),
}))

vi.mock('../services/passwordResetApi.js', () => ({
  requestPasswordReset: mockRequestPasswordReset,
  confirmPasswordReset: mockConfirmPasswordReset,
}))

describe('secondary forms', () => {
  it('requests a password reset and shows the local Mailpit inbox', async () => {
    mockRequestPasswordReset.mockResolvedValue({ message: 'Si la cuenta existe, recibirás un correo.' })
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'cliente@sonidovivo.cl' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace de recuperación/i }))

    expect(await screen.findByText(/recibirás un enlace válido por 15 minutos/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /mailpit/i })).toHaveAttribute('href', 'http://localhost:8025')
    expect(mockRequestPasswordReset).toHaveBeenCalledWith('cliente@sonidovivo.cl')
  })

  it('confirms a new password using the token from the email link', async () => {
    mockConfirmPasswordReset.mockResolvedValue({ message: 'La contraseña se restableció correctamente.' })
    render(
      <MemoryRouter initialEntries={['/recuperar?token=reset-token-from-mail']}>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i, { selector: 'input' }), {
      target: { value: 'NewPassword123!' },
    })
    fireEvent.change(screen.getByLabelText(/^confirmar contraseña$/i, { selector: 'input' }), {
      target: { value: 'NewPassword123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }))

    expect(await screen.findByText(/tu contraseña se actualizó/i)).toBeInTheDocument()
    expect(mockConfirmPasswordReset).toHaveBeenCalledWith('reset-token-from-mail', 'NewPassword123!')
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
