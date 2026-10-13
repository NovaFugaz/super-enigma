import { PRODUCTS, getProductByCode } from '../data/catalog.js'

const USERS_KEY = 'sonido-vivo-users'
const ORDERS_KEY = 'sonido-vivo-orders'

export const ORDER_STATUSES = ['pendiente', 'en_proceso', 'validado', 'enviado', 'entregado', 'rechazado']

function readArray(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
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