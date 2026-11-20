import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/auth-context.js'
import { CartProvider } from '../context/CartContext.jsx'
import { CatalogProvider } from '../context/CatalogContext.jsx'
import CartPage from '../modules/cart/CartPage.jsx'
import { PRODUCTS } from '../data/catalog.js'
import { fetchProducts } from '../services/catalogApi.js'

const orderApiMocks = vi.hoisted(() => ({
  createPaidOrder: vi.fn(),
}))

vi.mock('../services/catalogApi.js', () => ({
  fetchProducts: vi.fn(),
}))

vi.mock('../services/orderApi.js', () => ({
  createPaidOrder: orderApiMocks.createPaidOrder,
}))

function createOrderResponse() {
  return {
    id: 'SV-123',
    trackingNumber: 'TRK-123',
    status: 'en_proceso',
    createdAt: '2026-10-13T00:00:00.000Z',
    shipping: {
      method: 'domicilio',
      address: 'Av. Valparaíso 581, Viña del Mar',
      pickup: null,
    },
    items: [{ code: 'GA001', name: 'Guitarra Acústica Folk', quantity: 2 }],
    total: 259980,
    payment: { transactionId: 'PAY-123', authorizationCode: 'AUTH-123' },
    receipt: { number: 'BOL-SV-123', type: 'Boleta electrónica simulada' },
  }
}

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
    fetchProducts.mockResolvedValue(PRODUCTS)
    orderApiMocks.createPaidOrder.mockResolvedValue(createOrderResponse())
  })

  it('requires a customer account before paying', async () => {
    renderCartPage(null)

    expect(await screen.findByText(/Inicia sesión como cliente para pagar/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login')
  })

  it('creates an order with the backend using product codes and quantities', async () => {
    renderCartPage({
      id: 'customer-1',
      name: 'Cliente Demo',
      email: 'cliente@sonidovivo.cl',
      role: 'customer',
    })

    fireEvent.change(await screen.findByLabelText(/dirección de despacho/i), {
      target: { value: 'Av. Valparaíso 581, Viña del Mar' },
    })
    fireEvent.click(screen.getByRole('button', { name: /pagar con tarjeta/i }))

    expect(await screen.findByText(/Pedido confirmado/i)).toBeInTheDocument()
    expect(orderApiMocks.createPaidOrder).toHaveBeenCalledWith({
      shipping: {
        method: 'DOMICILIO',
        address: 'Av. Valparaíso 581, Viña del Mar',
        pickupId: null,
      },
      items: [{ code: 'GA001', quantity: 2 }],
      paymentApproved: true,
    })
    expect(localStorage.getItem('sonido-vivo-orders')).toBeNull()
    expect(JSON.parse(localStorage.getItem('sonido-vivo-cart'))).toEqual([])
  })

  it('shows a rejected payment message without creating the order', async () => {
    renderCartPage({
      id: 'customer-1',
      name: 'Cliente Demo',
      email: 'cliente@sonidovivo.cl',
      role: 'customer',
    })

    fireEvent.change(await screen.findByLabelText(/dirección de despacho/i), {
      target: { value: 'Calle Falsa 123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /simular pago rechazado/i }))

    expect(screen.getByText(/El pago fue rechazado/i)).toBeInTheDocument()
    expect(orderApiMocks.createPaidOrder).not.toHaveBeenCalled()
    expect(localStorage.getItem('sonido-vivo-orders')).toBeNull()
  })

  it('keeps the cart and displays backend errors when order creation fails', async () => {
    orderApiMocks.createPaidOrder.mockRejectedValueOnce(new Error('Stock insuficiente para GA001'))
    renderCartPage({
      id: 'customer-1',
      name: 'Cliente Demo',
      email: 'cliente@sonidovivo.cl',
      role: 'customer',
    })

    fireEvent.change(await screen.findByLabelText(/dirección de despacho/i), {
      target: { value: 'Av. Valparaíso 581, Viña del Mar' },
    })
    fireEvent.click(screen.getByRole('button', { name: /pagar con tarjeta/i }))

    expect(await screen.findByText(/Stock insuficiente para GA001/i)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('sonido-vivo-cart'))).toEqual([{ productCode: 'GA001', quantity: 2 }])
    expect(screen.queryByText(/Pedido confirmado/i)).not.toBeInTheDocument()
  })
})
