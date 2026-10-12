import { Link, useNavigate } from 'react-router-dom'
import CartItem from '../../components/cart/CartItem.jsx'
import { useCart } from '../../hooks/useCart.js'
import { LOCATIONS } from '../../services/locations.js'
import { CHECKOUT_LOGIN_MESSAGE } from '../../utils/cart.js'
import { formatCLP } from '../../utils/format.js'

const PICKUP_POINTS = LOCATIONS.filter((loc) => loc.type === 'pickup')

export default function CartPage() {
  const navigate = useNavigate()
  const { lines, totals, shipping, pickupId, setShipping, setPickupId, clearCart } = useCart()

  const isEmpty = lines.length === 0
  const selectedPickup = pickupId ?? PICKUP_POINTS[0]?.id

  let shippingLabel = '—'
  if (!isEmpty) {
    shippingLabel =
      shipping === 'retiro' || totals.hasFreeShipping ? 'Gratis' : formatCLP(totals.shippingCost)
  }

  const handleCheckout = () => {
    // Cuando exista autenticación: if (isAuthenticated) return navigate('/checkout')
    navigate('/login', { state: { from: '/carrito', message: CHECKOUT_LOGIN_MESSAGE } })
  }

  return (
    <section className="page-container featured-section">
      <p className="section-kicker">Carrito</p>
      <h1 className="section-title">Tu carrito de compras</h1>

      <div className="cart-page-grid">
        <div className="cart-page-main">
          <div className="cart-card">
            <h2 className="cart-card-title">Productos</h2>

            <div className="cart-list">
              {isEmpty ? (
                <p className="cart-empty">Tu carrito está vacío.</p>
              ) : (
                lines.map(({ product, qty }) => (
                  <CartItem key={product.codigo} product={product} qty={qty} />
                ))
              )}
            </div>

            {!isEmpty && (
              <button type="button" className="btn-danger-outline mt-4" onClick={clearCart}>
                Vaciar carrito
              </button>
            )}
          </div>

          <div className="cart-card">
            <h2 className="cart-card-title">Tipo de despacho</h2>

            <div className="shipping-options">
              <label className="shipping-option">
                <input
                  type="radio"
                  name="shipping"
                  value="domicilio"
                  checked={shipping === 'domicilio'}
                  onChange={(e) => setShipping(e.target.value)} />
                <span>
                  <span className="shipping-option-title">Despacho a domicilio</span>
                  <span className="shipping-option-text">
                    Envío protegido a todo Chile con Starken o Chilexpress.
                  </span>
                </span>
              </label>

              <label className="shipping-option">
                <input
                  type="radio"
                  name="shipping"
                  value="retiro"
                  checked={shipping === 'retiro'}
                  onChange={(e) => setShipping(e.target.value)} />
                <span>
                  <span className="shipping-option-title">Retiro en punto</span>
                  <span className="shipping-option-text">
                    Retira tu pedido en Starken o Chilexpress, en Viña del Mar.
                  </span>
                </span>
              </label>
            </div>

            {shipping === 'retiro' && (
              <div className="pickup-section">
                <p className="pickup-title">Elige tu punto de retiro</p>

                <div className="pickup-list">
                  {PICKUP_POINTS.map((point) => (
                    <label key={point.id} className="shipping-option">
                      <input
                        type="radio"
                        name="pickup"
                        value={point.id}
                        checked={selectedPickup === point.id}
                        onChange={(e) => setPickupId(e.target.value)} />
                      <span>
                        <span className="shipping-option-title">{point.name}</span>
                        <span className="shipping-option-text">{point.address}</span>
                        <span className="shipping-option-text">{point.hours[0]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="cart-card cart-summary">
          <h2 className="cart-card-title">Resumen</h2>

          <div className="cart-summary-rows">
            <div className="cart-row">
              <span>Subtotal</span>
              <span className="cart-row-strong">{formatCLP(totals.subtotal)}</span>
            </div>
            <div className="cart-row">
              <span>Despacho</span>
              <span className="cart-row-strong">{shippingLabel}</span>
            </div>
            {!totals.ivaIncluded && (
              <div className="cart-row">
                <span>IVA (19%)</span>
                <span className="cart-row-strong">{formatCLP(totals.iva)}</span>
              </div>
            )}
            <div className="cart-total-row">
              <span>Total</span>
              <span>{formatCLP(totals.total)}</span>
            </div>
            {totals.ivaIncluded && !isEmpty && (
              <p className="cart-item-meta">Incluye IVA (19%): {formatCLP(totals.iva)}</p>
            )}
            {totals.missingForFreeShipping > 0 && (
              <p className="cart-item-meta">
                Te faltan {formatCLP(totals.missingForFreeShipping)} para despacho gratis.
              </p>
            )}
          </div>

          <button
            type="button"
            className="btn-primary btn-block disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isEmpty}
            onClick={handleCheckout}>Pagar</button>
          <Link to="/catalogo" className="btn-outline btn-block">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </section>
  )
}