import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart.js'
import { formatCLP } from '../../utils/format.js'
import CartItem from './CartItem.jsx'

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
  const { cartItems, subtotal, clearCart } = useCart()

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
          {cartItems.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío.</p>
          ) : (
            cartItems.map((item) => (
              <CartItem key={item.product.codigo} item={item} />
            ))
          )}
        </div>

        <div className="cart-sidebar-footer">
          {cartItems.length > 0 && (
            <>
              <div className="cart-row">
                <span>Subtotal</span>
                <span className="cart-row-strong">{formatCLP(subtotal)}</span>
              </div>
              <button type="button" className="cart-remove" onClick={clearCart}>
                Vaciar carrito
              </button>
            </>
          )}

          <Link to="/carrito" className="btn-primary btn-block" onClick={onClose}>
            Ir al carrito
          </Link>
          <Link to="/catalogo" className="btn-outline btn-block" onClick={onClose}>
            Seguir comprando
          </Link>
        </div>
      </aside>
    </>
  )
}