export const ORDER_STATUS_EVENT = 'sonido-vivo:order-status-changed'

export function notifyOrderStatusChange({ orderId, previousStatus = null, status }) {
  window.dispatchEvent(new CustomEvent(ORDER_STATUS_EVENT, {
    detail: { orderId, previousStatus, status },
  }))
}
