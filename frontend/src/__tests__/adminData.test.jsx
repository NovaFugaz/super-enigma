import { act, renderHook } from '@testing-library/react'
import { webcrypto } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CatalogProvider } from '../context/CatalogContext.jsx'
import { useCatalog } from '../hooks/useCatalog.js'

beforeEach(() => {
  vi.resetModules()
  window.localStorage.clear()
  Object.defineProperty(window, 'crypto', { configurable: true, value: webcrypto })
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
  it('creates a product that immediately appears in the customer catalog', () => {
    const { result } = renderHook(() => useCatalog(), { wrapper: CatalogProvider })

    act(() => {
      expect(result.current.createProduct({
        codigo: 'ADM001',
        categoria: 'guitarras-acusticas',
        nombre: 'Guitarra Admin',
        marca: 'Demo',
        modelo: 'ADM-1',
        precio: 50000,
        stock: 4,
      }).product.codigo).toBe('ADM001')
    })

    expect(result.current.products.some((product) => product.codigo === 'ADM001')).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('sonido-vivo-product-overrides')).ADM001.active).toBe(true)
  })

  it('edits product details and deactivates it from the storefront', () => {
    const { result } = renderHook(() => useCatalog(), { wrapper: CatalogProvider })

    act(() => {
      expect(result.current.updateProduct('GA001', { nombre: 'Guitarra Renombrada', precio: 131000 }).product.nombre)
        .toBe('Guitarra Renombrada')
    })
    expect(result.current.products.find((product) => product.codigo === 'GA001').precio).toBe(131000)

    act(() => {
      result.current.deactivateProduct('GA001')
    })
    expect(result.current.products.some((product) => product.codigo === 'GA001')).toBe(false)
    expect(result.current.adminProducts.find((product) => product.codigo === 'GA001').active).toBe(false)
  })

  it('persists stock changes and rejects negative inventory', () => {
    const { result } = renderHook(() => useCatalog(), { wrapper: CatalogProvider })

    act(() => {
      expect(result.current.updateStock('GA001', 2)).toEqual({ stock: 2 })
    })
    expect(result.current.products.find((product) => product.codigo === 'GA001').stock).toBe(2)
    expect(JSON.parse(window.localStorage.getItem('sonido-vivo-stock')).GA001).toBe(2)

    act(() => {
      expect(result.current.updateStock('GA001', -1).error).toMatch(/entero mayor o igual a cero/)
    })
  })
})