import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  window.localStorage.clear()
  window.localStorage.setItem('sonido-vivo-users', JSON.stringify([
    { id: 'demo-customer', name: 'Cliente Demo', email: 'cliente@sonidovivo.cl', role: 'customer' },
  ]))
})

describe('mock order data', () => {
  it('seeds sample orders across supported workflow states', async () => {
    const { ORDER_STATUSES, seedDemoOrders } = await import('../services/mockOrders.js')
    seedDemoOrders()
    const orders = JSON.parse(window.localStorage.getItem('sonido-vivo-orders'))

    expect(orders).toHaveLength(6)
    expect(new Set(orders.map((order) => order.status))).toEqual(new Set(ORDER_STATUSES))
    expect(orders.every((order) => order.customerId === 'demo-customer')).toBe(true)
    expect(orders.every((order) => order.items.length > 0 && order.trackingNumber)).toBe(true)
  })

  it('seeds orders only once and preserves existing orders', async () => {
    const { seedDemoOrders } = await import('../services/mockOrders.js')
    window.localStorage.setItem('sonido-vivo-orders', JSON.stringify([{ id: 'SV-REAL-1', status: 'pendiente' }]))
    seedDemoOrders()
    seedDemoOrders()
    const orders = JSON.parse(window.localStorage.getItem('sonido-vivo-orders'))

    expect(orders).toHaveLength(7)
    expect(orders.at(-1)).toMatchObject({ id: 'SV-REAL-1' })
  })

  it('waits until the demo customer exists', async () => {
    window.localStorage.removeItem('sonido-vivo-users')
    const { seedDemoOrders } = await import('../services/mockOrders.js')

    expect(seedDemoOrders()).toBe(false)
    expect(window.localStorage.getItem('sonido-vivo-orders')).toBeNull()
  })
})