import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/auth-context.js'
import { CartProvider } from '../context/CartContext.jsx'
import { CatalogProvider } from '../context/CatalogContext.jsx'
import ProductDetailPage from '../modules/catalog/ProductDetailPage.jsx'
import OrdersPage from '../modules/cart/OrdersPage.jsx'
import OrderTrackingPage from '../modules/cart/OrderTrackingPage.jsx'
import { PRODUCTS } from '../data/catalog.js'
import { fetchProducts } from '../services/catalogApi.js'

const orderApiMocks = vi.hoisted(() => ({
  createPaidOrder: vi.fn(),
  fetchMyOrders: vi.fn(),
  trackOrder: vi.fn(),
}))

vi.mock('../services/catalogApi.js', () => ({
  fetchProducts: vi.fn(),
}))

vi.mock('../services/orderApi.js', () => ({
  ORDER_STATUSES: ['pendiente', 'en_proceso', 'validado', 'enviado', 'entregado', 'rechazado'],
  createPaidOrder: orderApiMocks.createPaidOrder,
  fetchMyOrders: orderApiMocks.fetchMyOrders,
  trackOrder: orderApiMocks.trackOrder,
}))

function renderCatalogAndDetail() {
  localStorage.clear()
  localStorage.setItem('sonido-vivo-cart', JSON.stringify([]))
  render(
    <MemoryRouter initialEntries={['/producto/GA001']}>
      <AuthContext.Provider value={{ user: null, login: () => {}, logout: () => {} }}>
        <CatalogProvider>
          <CartProvider>
            <Routes>
              <Route path="/producto/:codigo" element={<ProductDetailPage />} />
            </Routes>
          </CartProvider>
        </CatalogProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('purchase flow', () => {
  beforeEach(() => {
    localStorage.clear()
    fetchProducts.mockResolvedValue(PRODUCTS)
    orderApiMocks.fetchMyOrders.mockReset()
    orderApiMocks.trackOrder.mockReset()
  })

  it('adds a product to cart from detail view and updates the cart summary', async () => {
    renderCatalogAndDetail()

    fireEvent.click(await screen.findByRole('button', { name: /aumentar cantidad/i }))
    const addToCartButtons = screen.getAllByRole('button', { name: /agregar al carrito/i })
    fireEvent.click(addToCartButtons[0])

    expect(screen.getByText(/2 unidades agregadas/i)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('sonido-vivo-cart')).length).toBe(1)
  })

  it('tracks a real order by its identifier and renders its timeline', async () => {
    orderApiMocks.trackOrder.mockResolvedValue({
      id: 'SV-DEMO-1001',
      trackingNumber: 'TRK-DEMO-1001',
      status: 'en_proceso',
      createdAt: '2026-10-13T00:00:00.000Z',
      statusHistory: [
        { status: 'pendiente', createdAt: '2026-10-12T00:00:00.000Z' },
        { status: 'en_proceso', createdAt: '2026-10-13T00:00:00.000Z' },
      ],
      items: [{ code: 'GA001', name: 'Guitarra Acústica Folk', quantity: 1 }],
      total: 129990,
    })

    render(
      <MemoryRouter initialEntries={['/seguimiento?tracking=TRK-DEMO-1001']}>
        <Routes>
          <Route path="/seguimiento" element={<OrderTrackingPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Pedido SV-DEMO-1001/i)).toBeInTheDocument()
    expect(screen.getAllByText(/En proceso/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Guitarra Acústica Folk/i)).toBeInTheDocument()
    expect(orderApiMocks.trackOrder).toHaveBeenCalledWith('TRK-DEMO-1001')
  })

  it('returns an empty state when the tracking order does not exist', async () => {
    orderApiMocks.trackOrder.mockRejectedValue({ status: 404 })
    render(
      <MemoryRouter initialEntries={['/seguimiento?tracking=INVALIDO']}>
        <Routes>
          <Route path="/seguimiento" element={<OrderTrackingPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/No encontramos ese pedido/i)).toBeInTheDocument()
  })

  it('loads the authenticated customer order history from the backend', async () => {
    orderApiMocks.fetchMyOrders.mockResolvedValue([{
      id: 'SV-DEMO-1001',
      trackingNumber: 'TRK-DEMO-1001',
      status: 'en_proceso',
      createdAt: '2026-10-13T00:00:00.000Z',
      items: [{ code: 'GA001', name: 'Guitarra Acústica Folk', quantity: 1 }],
      total: 129990,
    }])

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{
          user: { id: 'customer-1', email: 'cliente@example.cl', role: 'customer' },
          login: () => {},
          logout: () => {},
        }}>
          <OrdersPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Pedido SV-DEMO-1001/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Seguimiento · TRK-DEMO-1001/i })).toHaveAttribute(
      'href',
      '/seguimiento?tracking=TRK-DEMO-1001',
    )
    expect(orderApiMocks.fetchMyOrders).toHaveBeenCalledOnce()
  })
})
