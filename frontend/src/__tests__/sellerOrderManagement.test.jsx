import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/auth-context.js'
import { CatalogProvider } from '../context/CatalogContext.jsx'
import SellerPanelPage from '../modules/seller/SellerPanelPage.jsx'
import { PRODUCTS } from '../data/catalog.js'
import { fetchProducts } from '../services/catalogApi.js'

const orderApiMocks = vi.hoisted(() => ({
  fetchStaffOrders: vi.fn(),
  updateStaffOrderStatus: vi.fn(),
}))

vi.mock('../services/catalogApi.js', () => ({
  fetchCategories: vi.fn().mockResolvedValue([{
    slug: 'guitarras-acusticas',
    nombre: 'Guitarras Acústicas',
    descripcion: '',
    image: '',
  }]),
  fetchProducts: vi.fn(),
}))

vi.mock('../services/orderApi.js', () => ({
  ORDER_STATUSES: ['pendiente', 'en_proceso', 'validado', 'enviado', 'entregado', 'rechazado'],
  ORDER_STATUS_TRANSITIONS: {
    pendiente: ['en_proceso', 'rechazado'],
    en_proceso: ['validado', 'rechazado'],
    validado: ['enviado', 'rechazado'],
    enviado: ['entregado'],
    entregado: [],
    rechazado: [],
  },
  fetchStaffOrders: orderApiMocks.fetchStaffOrders,
  updateStaffOrderStatus: orderApiMocks.updateStaffOrderStatus,
}))

function staffOrder(status = 'en_proceso', statusHistory) {
  return {
    id: 'SV-STAFF-1',
    trackingNumber: 'TRK-STAFF-1',
    status,
    createdAt: '2026-10-13T00:00:00.000Z',
    customerName: 'Cliente Demo',
    customerEmail: 'cliente@example.cl',
    shipping: { method: 'domicilio', address: 'Calle 123', pickup: null },
    items: [{ code: 'GA001', name: 'Guitarra demo', quantity: 1, lineTotal: 129990 }],
    total: 134980,
    statusHistory: statusHistory ?? [
      { from: null, status: 'pendiente', actorName: null, createdAt: '2026-10-13T00:00:00.000Z' },
      { from: 'pendiente', status: 'en_proceso', actorName: null, createdAt: '2026-10-13T00:00:00.000Z' },
    ],
  }
}

function renderSellerPanel() {
  return render(
    <AuthContext.Provider value={{
      user: { id: 'seller-1', name: 'Vendedor Demo', email: 'seller@example.cl', role: 'seller' },
      login: () => {},
      logout: () => {},
    }}>
      <CatalogProvider>
        <SellerPanelPage />
      </CatalogProvider>
    </AuthContext.Provider>,
  )
}

describe('seller order management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchProducts.mockResolvedValue(PRODUCTS)
    orderApiMocks.fetchStaffOrders.mockResolvedValue([staffOrder()])
  })

  it('updates order status through the backend and renders the returned history', async () => {
    orderApiMocks.updateStaffOrderStatus.mockResolvedValue(staffOrder('validado', [
      { from: null, status: 'pendiente', actorName: null, createdAt: '2026-10-13T00:00:00.000Z' },
      { from: 'pendiente', status: 'en_proceso', actorName: null, createdAt: '2026-10-13T00:00:00.000Z' },
      { from: 'en_proceso', status: 'validado', actorName: 'Vendedor Demo', createdAt: '2026-10-13T01:00:00.000Z' },
    ]))
    renderSellerPanel()

    fireEvent.click(screen.getByRole('tab', { name: 'Pedidos' }))
    fireEvent.click(await screen.findByRole('button', { name: /SV-STAFF-1/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar estado' }))

    expect(await screen.findByText(/Pedido SV-STAFF-1: Validado/)).toBeInTheDocument()
    expect(screen.getByText('Vendedor Demo')).toBeInTheDocument()
    expect(orderApiMocks.updateStaffOrderStatus).toHaveBeenCalledWith('SV-STAFF-1', 'validado')
  })

  it('offers retry when staff orders cannot be loaded', async () => {
    orderApiMocks.fetchStaffOrders
      .mockRejectedValueOnce(new Error('API no disponible'))
      .mockResolvedValueOnce([staffOrder()])
    renderSellerPanel()

    fireEvent.click(screen.getByRole('tab', { name: 'Pedidos' }))
    expect(await screen.findByText('API no disponible')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('button', { name: /SV-STAFF-1/ })).toBeInTheDocument()
    expect(orderApiMocks.fetchStaffOrders).toHaveBeenCalledTimes(2)
  })
})
