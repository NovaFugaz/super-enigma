import { PRODUCTS, getProductByCode } from '../data/catalog.js'

const USERS_KEY = 'sonido-vivo-users'
const ORDERS_KEY = 'sonido-vivo-orders'
const STOCK_KEY = 'sonido-vivo-stock'
export const ORDER_STATUS_EVENT = 'sonido-vivo:order-status-changed'

export const ORDER_STATUSES = ['pendiente', 'en_proceso', 'validado', 'enviado', 'entregado', 'rechazado']

function readArray(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function readObject(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function restoreStorage(key, value) {
  if (value === null) window.localStorage.removeItem(key)
  else window.localStorage.setItem(key, value)
}

function notifyStatusChange(order, previousStatus) {
  window.dispatchEvent(new CustomEvent(ORDER_STATUS_EVENT, {
    detail: { orderId: order.id, previousStatus, status: order.status },
  }))
}

export function getOrders() {
  return readArray(ORDERS_KEY)
}

export function findOrder(reference) {
  const normalizedReference = String(reference ?? '').trim().toLowerCase()
  if (!normalizedReference) return null
  return getOrders().find((order) =>
    [order.id, order.trackingNumber].some((value) => String(value ?? '').toLowerCase() === normalizedReference),
  ) ?? null
}

export function simulatePayment(approved) {
  if (!approved) {
    return {
      approved: false,
      status: 'rechazado',
      message: 'El pago fue rechazado. No se creó el pedido ni se modificó el stock.',
    }
  }

  return {
    approved: true,
    status: 'aprobado',
    transactionId: `PAY-DEMO-${Date.now()}`,
    authorizationCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    message: 'Pago aprobado por la pasarela de demostración.',
  }
}

export function savePaidOrder(order, products) {
  const originalOrders = window.localStorage.getItem(ORDERS_KEY)
  const originalStock = window.localStorage.getItem(STOCK_KEY)
  const orders = readArray(ORDERS_KEY)
  const stockOverrides = readObject(STOCK_KEY)

  for (const item of order.items) {
    const product = products.find((entry) => entry.codigo === item.code)
    const availableStock = Number(stockOverrides[item.code] ?? product?.stock)
    if (!product || !Number.isInteger(availableStock) || availableStock < item.quantity) {
      return { error: `Stock insuficiente para ${item.name}.` }
    }
    stockOverrides[item.code] = availableStock - item.quantity
  }

  try {
    window.localStorage.setItem(STOCK_KEY, JSON.stringify(stockOverrides))
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]))
  } catch {
    try {
      restoreStorage(STOCK_KEY, originalStock)
      restoreStorage(ORDERS_KEY, originalOrders)
    } catch {
      // Preserve the original persistence error as a failed checkout.
    }
    return { error: 'No se pudo guardar el pedido en este navegador.' }
  }

  notifyStatusChange(order, 'pendiente')
  return { order, stockOverrides }
}

export function updateOrderStatus(orderId, status) {
  if (!ORDER_STATUSES.includes(status)) return { error: 'Estado de pedido no válido.' }
  const orders = readArray(ORDERS_KEY)
  const currentOrder = orders.find((order) => order.id === orderId)
  if (!currentOrder) return { error: 'No se encontró el pedido.' }
  if (currentOrder.status === status) return { order: currentOrder, changed: false }

  const changedAt = new Date().toISOString()
  const updatedOrder = {
    ...currentOrder,
    status,
    statusHistory: [...(currentOrder.statusHistory ?? []), { status, createdAt: changedAt }],
  }
  const updatedOrders = orders.map((order) => order.id === orderId ? updatedOrder : order)

  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders))
  } catch {
    return { error: 'No se pudo actualizar el pedido en este navegador.' }
  }

  notifyStatusChange(updatedOrder, currentOrder.status)
  return { order: updatedOrder, changed: true }
}

function buildItems(codes) {
  return codes.map((code) => {
    const product = getProductByCode(code)
    return {
      code: product.codigo,
      name: product.nombre,
      brand: product.marca,
      model: product.modelo,
      unitPrice: product.precio,
      quantity: 1,
      lineTotal: product.precio,
    }
  })
}

function buildOrder({ id, customer, status, codes, daysAgo, trackingNumber, method = 'domicilio' }) {
  const items = buildItems(codes)
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const tax = Math.round(subtotal * 0.19)
  const createdAt = new Date(Date.now() - daysAgo * 86_400_000).toISOString()

  return {
    id,
    demo: true,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    createdAt,
    status,
    trackingNumber,
    shipping: method === 'retiro'
      ? { method, address: '', pickup: { name: 'Starken Viña Batuco', address: 'Av. Valparaíso 1195, Viña del Mar' } }
      : { method, address: 'Av. Valparaíso 581, Viña del Mar', pickup: null },
    items,
    subtotal,
    tax,
    total: subtotal + tax,
    statusHistory: [{ status, createdAt }],
  }
}

export function seedDemoOrders() {
  const users = readArray(USERS_KEY)
  const customer = users.find((user) => user.email === 'cliente@sonidovivo.cl')
  if (!customer || PRODUCTS.length === 0) return false

  const existingOrders = readArray(ORDERS_KEY)
  if (existingOrders.some((order) => order.demo === true)) return true

  const demoOrders = [
    buildOrder({ id: 'SV-DEMO-1001', customer, status: 'pendiente', codes: ['GA001'], daysAgo: 1, trackingNumber: 'TRK-DEMO-1001' }),
    buildOrder({ id: 'SV-DEMO-1002', customer, status: 'en_proceso', codes: ['PE001', 'AC004'], daysAgo: 2, trackingNumber: 'TRK-DEMO-1002' }),
    buildOrder({ id: 'SV-DEMO-1003', customer, status: 'validado', codes: ['MI001'], daysAgo: 3, trackingNumber: 'TRK-DEMO-1003' }),
    buildOrder({ id: 'SV-DEMO-1004', customer, status: 'enviado', codes: ['TC001'], daysAgo: 5, trackingNumber: 'TRK-DEMO-1004' }),
    buildOrder({ id: 'SV-DEMO-1005', customer, status: 'entregado', codes: ['ES002'], daysAgo: 8, trackingNumber: 'TRK-DEMO-1005', method: 'retiro' }),
    buildOrder({ id: 'SV-DEMO-1006', customer, status: 'rechazado', codes: ['BA001'], daysAgo: 10, trackingNumber: 'TRK-DEMO-1006' }),
  ]

  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify([...demoOrders, ...existingOrders]))
    return true
  } catch {
    return false
  }
}