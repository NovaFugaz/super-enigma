import { act, renderHook, waitFor } from '@testing-library/react'
import { webcrypto } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CatalogProvider } from '../context/CatalogContext.jsx'
import { useCatalog } from '../hooks/useCatalog.js'
import { PRODUCTS } from '../data/catalog.js'
import { fetchProducts } from '../services/catalogApi.js'

vi.mock('../services/catalogApi.js', () => ({
  fetchCategories: vi.fn().mockResolvedValue([{
    slug: 'guitarras-acusticas',
    nombre: 'Guitarras Acústicas',
    descripcion: '',
    image: '',
  }]),
  fetchProducts: vi.fn(),
}))

const productApiMocks = vi.hoisted(() => ({
  createStaffProduct: vi.fn(),
  deactivateStaffProduct: vi.fn(),
  fetchStaffProducts: vi.fn(),
  updateProductStock: vi.fn(),
  updateStaffProduct: vi.fn(),
}))

vi.mock('../services/productApi.js', () => productApiMocks)

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  window.localStorage.clear()
  Object.defineProperty(window, 'crypto', { configurable: true, value: webcrypto })
  fetchProducts.mockResolvedValue(PRODUCTS)
  productApiMocks.fetchStaffProducts.mockResolvedValue(PRODUCTS)
  productApiMocks.createStaffProduct.mockImplementation(async (product) => product)
  productApiMocks.deactivateStaffProduct.mockResolvedValue(undefined)
  productApiMocks.updateProductStock.mockImplementation(async (code, stock) => ({
    ...PRODUCTS.find((product) => product.codigo === code),
    stock,
  }))
  productApiMocks.updateStaffProduct.mockImplementation(async (_code, product) => product)
})

describe('admin user and role management', () => {
  it('creates, edits and deactivates a user with a role', async () => {
    const { authenticateAccount, createManagedUser, updateManagedUser } = await import('../services/mockAuth.js')
    const created = await createManagedUser({
      name: 'Seller One',
      phone: '+56 9 4567 8901',
      email: 'seller.one@example.cl',
      password: 'Seller123!',
      role: 'seller',
    })

    expect(created.user).toMatchObject({ role: 'seller', active: true })
    const updated = updateManagedUser(created.user.id, { name: 'Seller Updated', role: 'admin' })
    expect(updated.user).toMatchObject({ name: 'Seller Updated', role: 'admin' })

    updateManagedUser(created.user.id, { active: false })
    await expect(authenticateAccount('seller.one@example.cl', 'Seller123!')).resolves.toBeNull()
  })

  it('rejects duplicate emails and unsupported roles', async () => {
    const { createManagedUser } = await import('../services/mockAuth.js')
    const account = {
      name: 'Staff',
      email: 'staff@example.cl',
      password: 'Staff123!',
      role: 'seller',
    }
    await createManagedUser(account)

    await expect(createManagedUser({ ...account, email: 'STAFF@example.cl' })).resolves.toMatchObject({
      error: expect.stringMatching(/Ya existe una cuenta/),
    })
    await expect(createManagedUser({ ...account, email: 'other@example.cl', role: 'root' })).resolves.toMatchObject({
      error: expect.stringMatching(/rol seleccionado/),
    })
  })
})

describe('admin catalog and inventory management', () => {
  it('creates a product through the backend and updates the customer catalog', async () => {
    const { result } = renderHook(() => useCatalog(), { wrapper: CatalogProvider })

    await waitFor(() => expect(result.current.adminProducts.length).toBeGreaterThan(0))
    expect(result.current.categories).toEqual([{
      slug: 'guitarras-acusticas',
      nombre: 'Guitarras Acústicas',
      descripcion: '',
      image: '',
    }])

    await act(async () => {
      const response = await result.current.createProduct({
        codigo: 'ADM002',
        categoria: 'categoria-inexistente',
        nombre: 'Producto inválido',
        precio: 50000,
        stock: 4,
      })
      expect(response.error).toMatch(/categoría válida/)
    })

    await act(async () => {
      const response = await result.current.createProduct({
        codigo: 'ADM001',
        categoria: 'guitarras-acusticas',
        nombre: 'Guitarra Admin',
        marca: 'Demo',
        modelo: 'ADM-1',
        precio: 50000,
        stock: 4,
      })
      expect(response.product.codigo).toBe('ADM001')
    })

    expect(productApiMocks.createStaffProduct).toHaveBeenCalledWith(expect.objectContaining({
      codigo: 'ADM001',
      nombre: 'Guitarra Admin',
    }))
    expect(result.current.products.some((product) => product.codigo === 'ADM001')).toBe(true)
    expect(window.localStorage.getItem('sonido-vivo-product-overrides')).toBeNull()
  })

  it('edits and deactivates products through the backend', async () => {
    const { result } = renderHook(() => useCatalog(), { wrapper: CatalogProvider })
    await waitFor(() => expect(result.current.adminProducts.length).toBeGreaterThan(0))

    await act(async () => {
      const response = await result.current.updateProduct('GA001', {
        nombre: 'Guitarra Renombrada',
        precio: 131000,
      })
      expect(response.product.nombre).toBe('Guitarra Renombrada')
    })
    expect(productApiMocks.updateStaffProduct).toHaveBeenCalledWith(
      'GA001',
      expect.objectContaining({ nombre: 'Guitarra Renombrada', precio: 131000 }),
    )
    expect(result.current.products.find((product) => product.codigo === 'GA001').precio).toBe(131000)

    await act(async () => {
      await result.current.deactivateProduct('GA001')
    })
    expect(productApiMocks.deactivateStaffProduct).toHaveBeenCalledWith('GA001')
    expect(result.current.products.some((product) => product.codigo === 'GA001')).toBe(false)
    expect(result.current.adminProducts.find((product) => product.codigo === 'GA001').active).toBe(false)
  })

  it('updates stock through the backend and rejects negative inventory', async () => {
    const { result } = renderHook(() => useCatalog(), { wrapper: CatalogProvider })
    await waitFor(() => expect(result.current.adminProducts.length).toBeGreaterThan(0))

    await act(async () => {
      expect(await result.current.updateStock('GA001', 2)).toEqual({ stock: 2 })
    })
    expect(productApiMocks.updateProductStock).toHaveBeenCalledWith('GA001', 2)
    expect(result.current.products.find((product) => product.codigo === 'GA001').stock).toBe(2)
    expect(window.localStorage.getItem('sonido-vivo-stock')).toBeNull()

    await expect(result.current.updateStock('GA001', -1)).resolves.toMatchObject({
      error: expect.stringMatching(/entero mayor o igual a cero/),
    })
    expect(productApiMocks.updateProductStock).toHaveBeenCalledTimes(1)
  })
})