import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/auth-context.js'
import { CatalogProvider } from '../context/CatalogContext.jsx'
import AdminPanelPage from '../modules/admin/AdminPanelPage.jsx'
import { PRODUCTS } from '../data/catalog.js'
import { fetchProducts } from '../services/catalogApi.js'

const userApiMocks = vi.hoisted(() => ({
  createManagedUser: vi.fn(),
  fetchManagedUsers: vi.fn(),
  updateManagedUser: vi.fn(),
}))

const productApiMocks = vi.hoisted(() => ({
  createStaffProduct: vi.fn(),
  deactivateStaffProduct: vi.fn(),
  fetchStaffProducts: vi.fn(),
  updateProductStock: vi.fn(),
  updateStaffProduct: vi.fn(),
}))

const reportApiMocks = vi.hoisted(() => ({
  downloadSalesReport: vi.fn(),
  fetchSalesReport: vi.fn(),
}))

vi.mock('../services/catalogApi.js', () => ({
  fetchProducts: vi.fn(),
}))

vi.mock('../services/productApi.js', () => productApiMocks)

vi.mock('../services/userApi.js', () => ({
  ...userApiMocks,
  USER_ROLES: ['customer', 'seller', 'admin'],
}))

vi.mock('../services/salesReport.js', () => reportApiMocks)

const existingUser = {
  id: '8',
  name: 'Vendedor Uno',
  phone: '+56 9 1111 1111',
  email: 'vendedor@example.cl',
  role: 'seller',
  active: true,
}

function renderAdminPanel() {
  render(
    <AuthContext.Provider value={{
      user: { id: '1', name: 'Admin Demo', email: 'admin@example.cl', role: 'admin' },
      login: () => {},
      logout: () => {},
    }}>
      <CatalogProvider>
        <AdminPanelPage />
      </CatalogProvider>
    </AuthContext.Provider>,
  )
}

describe('admin user management integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    fetchProducts.mockResolvedValue(PRODUCTS)
    productApiMocks.fetchStaffProducts.mockResolvedValue(PRODUCTS)
    userApiMocks.fetchManagedUsers.mockResolvedValue([existingUser])
    reportApiMocks.fetchSalesReport.mockResolvedValue({
      days: 30,
      orderCount: 0,
      totalSales: 0,
      unitsSold: 0,
      salesByDate: [],
      topProducts: [],
    })
  })

  it('creates users through the API and refreshes the displayed list', async () => {
    const newUser = {
      id: '9',
      name: 'Nuevo Vendedor',
      phone: '+56 9 2222 2222',
      email: 'nuevo@example.cl',
      role: 'seller',
      active: true,
    }
    userApiMocks.createManagedUser.mockResolvedValue(newUser)
    renderAdminPanel()
    fireEvent.click(screen.getByRole('tab', { name: 'Usuarios y roles' }))

    fireEvent.change(await screen.findByLabelText('Nombre'), { target: { value: newUser.name } })
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: newUser.phone } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: newUser.email } })
    fireEvent.change(screen.getByLabelText('Contraseña inicial'), { target: { value: 'Password123!' } })
    fireEvent.change(screen.getByLabelText('Rol del usuario'), { target: { value: 'seller' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }))

    expect(await screen.findByText('nuevo@example.cl')).toBeInTheDocument()
    expect(userApiMocks.createManagedUser).toHaveBeenCalledWith({
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      password: 'Password123!',
      role: 'seller',
    })
  })

  it('updates and deactivates users using the backend response', async () => {
    const updatedUser = { ...existingUser, name: 'Vendedor Actualizado' }
    const deactivatedUser = { ...updatedUser, active: false }
    userApiMocks.updateManagedUser
      .mockResolvedValueOnce(updatedUser)
      .mockResolvedValueOnce(deactivatedUser)
    renderAdminPanel()
    fireEvent.click(screen.getByRole('tab', { name: 'Usuarios y roles' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: updatedUser.name } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Vendedor Actualizado')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }))

    await waitFor(() => expect(userApiMocks.updateManagedUser).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Inactivo')).toBeInTheDocument()
    expect(userApiMocks.updateManagedUser).toHaveBeenNthCalledWith(2, '8', {
      ...updatedUser,
      active: false,
    })
  })
})
