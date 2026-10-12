import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import CartItem from './CartItem.jsx'
import { useCart } from '../../hooks/useCart.js'
import { formatCLP } from '../../utils/format.js'

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
  const { lines, totals, clearCart } = useCart()
  const isEmpty = lines.length === 0

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
        aria-hidden="true" />

      <aside
        className={`cart-sidebar ${open ? 'cart-sidebar-open' : ''}`}
        aria-label="Carrito de compras">
        <div className="cart-sidebar-header">
          <h2 className="cart-sidebar-title">Tu carrito</h2>
          <button type="button" className="cart-close" aria-label="Cerrar carrito" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="cart-sidebar-body">
          {isEmpty ? (
            <p className="cart-empty">Tu carrito está vacío.</p>
          ) : (
            lines.map(({ product, qty }) => (
              <CartItem key={product.codigo} product={product} qty={qty} />
            ))
          )}
        </div>

        <div className="cart-sidebar-footer">
          {!isEmpty && (
            <div className="cart-row">
              <span>Subtotal</span>
              <span className="cart-row-strong">{formatCLP(totals.subtotal)}</span>
            </div>
          )}

          <button
            type="button"
            className="btn-danger-outline btn-block disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isEmpty}
            onClick={clearCart}
          >Vaciar carrito</button>

          <Link to="/carrito" className="btn-primary btn-block" onClick={onClose}>
            Ir al carrito
          </Link>
        </div>
      </aside>
    </>
  )
}