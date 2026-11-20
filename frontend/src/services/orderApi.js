import { apiRequest } from './api.js'

const BACKEND_ORDER_STATUSES = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  VALIDADO: 'validado',
  ENVIADO: 'enviado',
  ENTREGADO: 'entregado',
  RECHAZADO: 'rechazado',
}

export const ORDER_STATUSES = Object.values(BACKEND_ORDER_STATUSES)

function mapStatus(status) {
  const mappedStatus = BACKEND_ORDER_STATUSES[status]
  if (!mappedStatus) throw new Error('La API devolvió un estado de pedido desconocido.')
  return mappedStatus
}

function mapItems(items = []) {
  if (!Array.isArray(items)) throw new Error('La API devolvió productos de pedido inválidos.')
  return items.map((item, index) => ({
    code: item.code ?? `line-${index}`,
    name: item.name,
    brand: item.brand ?? '',
    model: item.model ?? '',
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  }))
}

function mapHistory(history = []) {
  if (!Array.isArray(history)) throw new Error('La API devolvió un historial de pedido inválido.')
  return history.map((entry) => ({
    from: entry.from ? mapStatus(entry.from) : null,
    status: mapStatus(entry.status),
    actorName: entry.actorName ?? null,
    createdAt: entry.createdAt,
  }))
}

export function toOrder(order) {
  if (!order || typeof order.id !== 'string' || typeof order.trackingNumber !== 'string') {
    throw new Error('La API devolvió un pedido inválido.')
  }
  const shippingMethod = order.shipping?.method
  if (!['DOMICILIO', 'RETIRO'].includes(shippingMethod)) {
    throw new Error('La API devolvió un método de entrega desconocido.')
  }

  return {
    id: order.id,
    trackingNumber: order.trackingNumber,
    status: mapStatus(order.status),
    createdAt: order.createdAt,
    customerId: order.customerId == null ? undefined : String(order.customerId),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    shipping: {
      method: shippingMethod === 'RETIRO' ? 'retiro' : 'domicilio',
      address: order.shipping.address ?? '',
      pickup: order.shipping.pickup ?? null,
    },
    items: mapItems(order.items),
    subtotal: order.subtotal,
    tax: order.tax,
    shippingCost: order.shippingCost,
    total: order.total,
    payment: order.payment,
    receipt: {
      ...order.receipt,
      type: 'Boleta electrónica simulada',
    },
    statusHistory: mapHistory(order.statusHistory),
  }
}

export function toOrderSummary(order) {
  if (!order || typeof order.id !== 'string') {
    throw new Error('La API devolvió un resumen de pedido inválido.')
  }
  return {
    id: order.id,
    trackingNumber: order.trackingNumber,
    status: mapStatus(order.status),
    createdAt: order.createdAt,
    items: mapItems(order.items),
    total: order.total,
    statusHistory: mapHistory(order.statusHistory),
  }
}

export function toTrackingOrder(order) {
  if (!order || typeof order.id !== 'string' || typeof order.trackingNumber !== 'string') {
    throw new Error('La API devolvió datos de seguimiento inválidos.')
  }
  if (!['DOMICILIO', 'RETIRO'].includes(order.shippingMethod)) {
    throw new Error('La API devolvió un método de entrega desconocido.')
  }
  return {
    id: order.id,
    trackingNumber: order.trackingNumber,
    status: mapStatus(order.status),
    createdAt: order.createdAt,
    shipping: {
      method: order.shippingMethod === 'RETIRO' ? 'retiro' : 'domicilio',
    },
    items: mapItems(order.items),
    total: order.total,
    statusHistory: mapHistory(order.statusHistory),
  }
}

export async function createPaidOrder({ items, shipping, paymentApproved }) {
  const response = await apiRequest('/api/orders', {
    method: 'POST',
    body: {
      shipping: {
        method: shipping.method,
        address: shipping.address || null,
        pickupId: shipping.pickupId || null,
      },
      items,
      paymentApproved,
    },
  })
  return toOrder(response)
}

export async function fetchMyOrders() {
  const response = await apiRequest('/api/orders/mine')
  if (!Array.isArray(response)) throw new Error('La API devolvió un historial de pedidos inválido.')
  return response.map(toOrderSummary)
}

export async function trackOrder(reference) {
  const response = await apiRequest(`/api/orders/tracking/${encodeURIComponent(reference.trim())}`)
  return toTrackingOrder(response)
}
