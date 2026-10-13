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

  it('simulates approved and rejected payment without persisting a rejected order', async () => {
    const { simulatePayment } = await import('../services/mockOrders.js')
    const rejection = simulatePayment(false)

    expect(rejection).toMatchObject({ approved: false, status: 'rechazado' })
    expect(window.localStorage.getItem('sonido-vivo-orders')).toBeNull()
    expect(window.localStorage.getItem('sonido-vivo-stock')).toBeNull()
    expect(simulatePayment(true)).toMatchObject({ approved: true, status: 'aprobado' })
  })

  it('persists an approved order and decrements stock exactly once', async () => {
    const { PRODUCTS } = await import('../data/catalog.js')
    const { savePaidOrder } = await import('../services/mockOrders.js')
    const order = {
      id: 'SV-TEST-1',
      status: 'en_proceso',
      trackingNumber: 'TRK-TEST-1',
      statusHistory: [{ status: 'pendiente', createdAt: '2026-10-13T00:00:00.000Z' }],
      items: [{ code: 'GA001', name: 'Guitarra demo', quantity: 2 }],
    }

    const result = savePaidOrder(order, PRODUCTS)

    expect(result.order.id).toBe('SV-TEST-1')
    expect(result.stockOverrides.GA001).toBe(6)
    expect(JSON.parse(window.localStorage.getItem('sonido-vivo-orders'))[0].id).toBe('SV-TEST-1')
    expect(JSON.parse(window.localStorage.getItem('sonido-vivo-stock')).GA001).toBe(6)
  })

  it('does not persist an order when stock is insufficient', async () => {
    const { PRODUCTS } = await import('../data/catalog.js')
    const { savePaidOrder } = await import('../services/mockOrders.js')
    const result = savePaidOrder({
      id: 'SV-TEST-2',
      items: [{ code: 'GA001', name: 'Guitarra demo', quantity: 9 }],
    }, PRODUCTS)

    expect(result.error).toMatch(/Stock insuficiente/)
    expect(window.localStorage.getItem('sonido-vivo-orders')).toBeNull()
    expect(window.localStorage.getItem('sonido-vivo-stock')).toBeNull()
  })

  it('updates order status, records its history and supports tracking lookup', async () => {
    const { findOrder, seedDemoOrders, updateOrderStatus } = await import('../services/mockOrders.js')
    seedDemoOrders()
    const listener = vi.fn()
    window.addEventListener('sonido-vivo:order-status-changed', listener)

    const result = updateOrderStatus('SV-DEMO-1001', 'en_proceso', {
      id: 'demo-seller',
      name: 'Vendedor Demo',
      role: 'seller',
    })
    const trackedOrder = findOrder('trk-demo-1001')

    expect(result.order.status).toBe('en_proceso')
    expect(trackedOrder.statusHistory).toHaveLength(2)
    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toMatchObject({
      orderId: 'SV-DEMO-1001',
      previousStatus: 'pendiente',
      status: 'en_proceso',
    })
    expect(result.order.auditLog[0]).toMatchObject({
      actorId: 'demo-seller',
      actorName: 'Vendedor Demo',
      actorRole: 'seller',
      action: 'cambio_estado',
      from: 'pendiente',
      to: 'en_proceso',
    })
    window.removeEventListener('sonido-vivo:order-status-changed', listener)
  })

  it('rejects a transition that skips a workflow state', async () => {
    const { seedDemoOrders, updateOrderStatus } = await import('../services/mockOrders.js')
    seedDemoOrders()

    const result = updateOrderStatus('SV-DEMO-1001', 'enviado', {
      id: 'demo-seller',
      name: 'Vendedor Demo',
      role: 'seller',
    })

    expect(result.error).toMatch(/No se puede cambiar/)
    expect(JSON.parse(window.localStorage.getItem('sonido-vivo-orders'))[0].status).toBe('pendiente')
  })
})