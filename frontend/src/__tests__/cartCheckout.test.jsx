import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthContext } from '../context/auth-context.js'
import { CartProvider } from '../context/CartContext.jsx'
import { CatalogProvider } from '../context/CatalogContext.jsx'
import CartPage from '../modules/cart/CartPage.jsx'

function renderCartPage(user, items = [{ productCode: 'GA001', quantity: 2 }]) {
  localStorage.clear()
  localStorage.setItem('sonido-vivo-cart', JSON.stringify(items))
  localStorage.removeItem('sonido-vivo-orders')
  localStorage.removeItem('sonido-vivo-stock')

  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user, login: () => {}, logout: () => {} }}>
        <CatalogProvider>
          <CartProvider>
            <CartPage />
          </CartProvider>
        </CatalogProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('cart checkout flows', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('requires a customer account before paying', () => {
    renderCartPage(null)

    expect(screen.getByText(/Inicia sesión como cliente para pagar/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login')
  })

  it('creates an order with approved payment and delivery address', () => {
    renderCartPage({
      id: 'customer-1',
      name: 'Cliente Demo',
      email: 'cliente@sonidovivo.cl',
      role: 'customer',
    })

    fireEvent.change(screen.getByLabelText(/dirección de despacho/i), {
      target: { value: 'Av. Valparaíso 581, Viña del Mar' },
    })
    fireEvent.click(screen.getByRole('button', { name: /pagar con tarjeta/i }))

    const orders = JSON.parse(localStorage.getItem('sonido-vivo-orders'))
    expect(orders).toHaveLength(1)
    expect(orders[0]).toMatchObject({
      customerEmail: 'cliente@sonidovivo.cl',
      customerName: 'Cliente Demo',
      status: 'en_proceso',
    })
    expect(screen.getByText(/Pedido confirmado/i)).toBeInTheDocument()
    expect(screen.getByText(/Número de pedido/i)).toBeInTheDocument()
  })

  it('shows a rejected payment message without creating the order', () => {
    renderCartPage({
      id: 'customer-1',
      name: 'Cliente Demo',
      email: 'cliente@sonidovivo.cl',
      role: 'customer',
    })

    fireEvent.change(screen.getByLabelText(/dirección de despacho/i), {
      target: { value: 'Calle Falsa 123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /simular pago rechazado/i }))

    expect(screen.getByText(/El pago fue rechazado/i)).toBeInTheDocument()
    expect(localStorage.getItem('sonido-vivo-orders')).toBeNull()
  })
})
