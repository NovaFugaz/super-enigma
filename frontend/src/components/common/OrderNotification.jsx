import { useEffect, useState } from 'react'
import { ORDER_STATUS_EVENT } from '../../services/mockOrders.js'

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  validado: 'Validado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
}

export default function OrderNotification() {
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    let timeoutId
    const showNotification = (event) => {
      const { orderId, status } = event.detail
      setNotification(`Pedido ${orderId}: ${STATUS_LABELS[status] ?? status}.`)
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => setNotification(null), 6000)
    }

    window.addEventListener(ORDER_STATUS_EVENT, showNotification)
    return () => {
      window.removeEventListener(ORDER_STATUS_EVENT, showNotification)
      window.clearTimeout(timeoutId)
    }
  }, [])

  if (!notification) return null

  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-4 rounded-lg border border-costa-teal bg-white p-4 text-sm text-costa-ink shadow-lg" role="status" aria-live="polite">
      <span className="flex-1">{notification}</span>
      <button type="button" className="cart-remove" aria-label="Cerrar notificación" onClick={() => setNotification(null)}>Cerrar</button>
    </div>
  )
}