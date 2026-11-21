import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/auth-context.js'
import { CatalogProvider } from '../context/CatalogContext.jsx'
import AdminPanelPage from '../modules/admin/AdminPanelPage.jsx'
import { PRODUCTS } from '../data/catalog.js'
import { fetchProducts } from '../services/catalogApi.js'

const reportMocks = vi.hoisted(() => ({
  fetchSalesReport: vi.fn(),
  downloadSalesReport: vi.fn(),
}))

const userApiMocks = vi.hoisted(() => ({
  fetchManagedUsers: vi.fn(),
}))

const productApiMocks = vi.hoisted(() => ({
  createStaffProduct: vi.fn(),
  deactivateStaffProduct: vi.fn(),
  fetchStaffProducts: vi.fn(),
  updateProductStock: vi.fn(),
  updateStaffProduct: vi.fn(),
}))

vi.mock('../services/catalogApi.js', () => ({
  fetchProducts: vi.fn(),
}))

vi.mock('../services/productApi.js', () => productApiMocks)

vi.mock('../services/userApi.js', () => ({
  ...userApiMocks,
  USER_ROLES: ['customer', 'seller', 'admin'],
}))

vi.mock('../services/salesReport.js', () => reportMocks)

function salesReport(days) {
  return {
    days,
    orderCount: 2,
    totalSales: 250000,
    unitsSold: 3,
    salesByDate: [{ date: '2026-11-20', orders: 2, total: 250000 }],
    topProducts: [{ code: 'GA001', name: 'Guitarra demo', units: 3, revenue: 250000 }],
  }
}

function renderAdminPanel() {
  render(
    <AuthContext.Provider value={{
      user: { id: 'admin-1', name: 'Admin Demo', email: 'admin@example.cl', role: 'admin' },
      login: () => {},
      logout: () => {},
    }}>
      <CatalogProvider>
        <AdminPanelPage />
      </CatalogProvider>
    </AuthContext.Provider>,
  )
}

describe('admin sales dashboard integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    fetchProducts.mockResolvedValue(PRODUCTS)
    productApiMocks.fetchStaffProducts.mockResolvedValue(PRODUCTS)
    userApiMocks.fetchManagedUsers.mockResolvedValue([])
    reportMocks.fetchSalesReport.mockImplementation(async (days) => salesReport(days ?? null))
    reportMocks.downloadSalesReport.mockResolvedValue(undefined)
  })

  it('loads dashboard data and exports the selected period from the backend', async () => {
    renderAdminPanel()

    await waitFor(() => expect(screen.getAllByText(/250\.000/)).toHaveLength(2))
    expect(screen.getByText('Ventas del período').parentElement).toHaveTextContent('$250.000')
    expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText(/20\/11\/2026/)).toBeInTheDocument()
    expect(reportMocks.fetchSalesReport).toHaveBeenCalledWith(30)

    fireEvent.change(screen.getByLabelText('Período de ventas'), { target: { value: '7' } })
    await waitFor(() => expect(reportMocks.fetchSalesReport).toHaveBeenLastCalledWith(7))
    fireEvent.click(await screen.findByRole('button', { name: 'Exportar reporte CSV' }))

    await waitFor(() => expect(reportMocks.downloadSalesReport).toHaveBeenCalledWith(7))
  })
})
