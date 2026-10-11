import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export default function CartSidebar({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div
        className={`cart-overlay ${open ? 'cart-overlay-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`cart-sidebar ${open ? 'cart-sidebar-open' : ''}`}
        aria-label="Carrito de compras"
      >
        <div className="cart-sidebar-header">
          <h2 className="cart-sidebar-title">Tu carrito</h2>
          <button
            type="button"
            className="cart-close"
            aria-label="Cerrar carrito"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="cart-sidebar-body">
          {/* TODO: aquí se listarán los productos del carrito */}
          <p className="cart-empty">Tu carrito está vacío.</p>
        </div>

        <div className="cart-sidebar-footer">
          {/* TODO: lógica para vaciar el carrito */}
          <button type="button" className="btn-danger-outline btn-block">
            Vaciar carrito
          </button>

          <Link to="/carrito" className="btn-primary btn-block" onClick={onClose}>
            Seguir comprando
          </Link>
        </div>
      </aside>
    </>
  )
}