import { useEffect, useState } from 'react'
import { CartContext } from './cart-context.js'
import { useCatalog } from '../hooks/useCatalog.js'
import { createPaidOrder } from '../services/orderApi.js'
import { notifyOrderStatusChange } from '../services/orderNotifications.js'
import { calcTotals } from '../utils/cart.js'

const CART_STORAGE_KEY = 'sonido-vivo-cart'

function readCart() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(saved)) return []

    return saved.filter(
      (item) =>
        typeof item.productCode === 'string' &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { products, reload: reloadCatalog } = useCatalog()
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // The cart remains usable when browser storage is unavailable.
    }
  }, [items])

  const cartItems = items.flatMap((item) => {
    const product = products.find((entry) => entry.codigo === item.productCode)
    if (!product || product.stock < 1) return []

    const quantity = Math.min(item.quantity, product.stock)
    return [{ product, quantity, lineTotal: product.precio * quantity }]
  })

  const totals = calcTotals(
    cartItems.map(({ product, quantity }) => ({ product, qty: quantity })),
    'retiro',
  )
  const { subtotal, total } = totals
  const tax = totals.iva
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const addItem = (product, quantity = 1) => {
    if (!product || product.stock < 1) return
    const amount = Math.max(1, Math.floor(Number(quantity) || 1))

    setItems((current) => {
      const existing = current.find((item) => item.productCode === product.codigo)
      if (!existing) {
        return [...current, { productCode: product.codigo, quantity: Math.min(amount, product.stock) }]
      }

      return current.map((item) =>
        item.productCode === product.codigo
          ? { ...item, quantity: Math.min(item.quantity + amount, product.stock) }
          : item,
      )
    })
  }

  const setQuantity = (productCode, quantity) => {
    const product = products.find((entry) => entry.codigo === productCode)
    if (!product || product.stock < 1) return

    const nextQuantity = Math.max(1, Math.min(product.stock, Math.floor(Number(quantity) || 1)))
    setItems((current) =>
      current.map((item) =>
        item.productCode === productCode ? { ...item, quantity: nextQuantity } : item,
      ),
    )
  }

  const removeItem = (productCode) => {
    setItems((current) => current.filter((item) => item.productCode !== productCode))
  }

  const clearCart = () => setItems([])

  const createOrder = async ({ shipping, customer, payment }) => {
    if (cartItems.length === 0) return { error: 'El carrito está vacío.' }
    if (!customer || customer.role !== 'customer') return { error: 'Inicia sesión con una cuenta de cliente para comprar.' }
    if (!payment?.approved) return { error: 'El pago no fue aprobado.' }

    try {
      const order = await createPaidOrder({
        shipping: {
          method: shipping.method === 'retiro' ? 'RETIRO' : 'DOMICILIO',
          address: shipping.method === 'domicilio' ? shipping.address : null,
          pickupId: shipping.method === 'retiro' ? shipping.pickupId : null,
        },
        items: cartItems.map(({ product, quantity }) => ({
          code: product.codigo,
          quantity,
        })),
        paymentApproved: payment.approved,
      })

      const lastStatusChange = order.statusHistory?.[order.statusHistory.length - 1]
      notifyOrderStatusChange({
        orderId: order.id,
        previousStatus: lastStatusChange?.from,
        status: order.status,
      })
      clearCart()
      reloadCatalog()
      return { order }
    } catch (error) {
      return { error: error.message }
    }
  }

  return (
    <CartContext.Provider
      value={{ cartItems, itemCount, subtotal, tax, total, addItem, setQuantity, removeItem, clearCart, createOrder }}
    >
      {children}
    </CartContext.Provider>
  )
}