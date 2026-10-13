import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LOCATIONS } from '../../services/locations.js'
import { useCart } from '../../hooks/useCart.js'
import { formatCLP } from '../../utils/format.js'
import CartItem from '../../components/cart/CartItem.jsx'

const PICKUP_POINTS = LOCATIONS.filter((loc) => loc.type === 'pickup')

export default function CartPage() {
  const [shipping, setShipping] = useState('domicilio')
  const [pickupId, setPickupId] = useState(PICKUP_POINTS[0]?.id)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [order, setOrder] = useState(null)
  const { cartItems, subtotal, tax, total, createOrder } = useCart()

  const handleCheckout = (event) => {
    event.preventDefault()
    if (shipping === 'domicilio' && !deliveryAddress.trim()) {
      setCheckoutError('Ingresa la dirección donde recibirás el pedido.')
      return
    }

    const pickup = PICKUP_POINTS.find((point) => point.id === pickupId)
    const createdOrder = createOrder({
      method: shipping,
      address: shipping === 'domicilio' ? deliveryAddress.trim() : '',
      pickup: shipping === 'retiro' && pickup ? { name: pickup.name, address: pickup.address } : null,
    })

    if (!createdOrder) return
    setCheckoutError('')
    setOrder(createdOrder)
  }

  if (order) {
    return (
      <section className="page-container featured-section">
        <p className="section-kicker">Pedido confirmado</p>
        <h1 className="section-title">Gracias por tu compra</h1>
        <div className="cart-card mt-8 max-w-2xl">
          <p className="text-sm text-costa-deep">Número de pedido</p>
          <p className="mt-1 text-lg font-semibold text-costa-ink">{order.id}</p>
          <p className="mt-4 text-sm text-costa-deep">
            {order.shipping.method === 'retiro'
              ? `Retiro en ${order.shipping.pickup?.name ?? 'punto seleccionado'}`
              : `Despacho a ${order.shipping.address}`}
          </p>
          <div className="cart-summary-rows mt-5">
            <div className="cart-row"><span>Productos</span><span>{order.items.reduce((count, item) => count + item.quantity, 0)}</span></div>
            <div className="cart-total-row"><span>Total del pedido</span><span>{formatCLP(order.total)}</span></div>
          </div>
          <Link to="/catalogo" className="btn-primary mt-6 inline-flex">Seguir comprando</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page-container featured-section">
      <p className="section-kicker">Carrito</p>
      <h1 className="section-title">Tu carrito de compras</h1>

      <div className="cart-page-grid">
        <div className="cart-page-main">
          {/* Productos */}
          <div className="cart-card">
            <h2 className="cart-card-title">Productos</h2>

            <div className="cart-list">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <p>Tu carrito está vacío.</p>
                  <Link to="/catalogo" className="auth-inline-link">Explorar catálogo</Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartItem key={item.product.codigo} item={item} />
                ))
              )}
            </div>
          </div>

          {/* Tipo de despacho */}
          {cartItems.length > 0 && <div className="cart-card">
            <h2 className="cart-card-title">Tipo de despacho</h2>

            <div className="shipping-options">
              <label className="shipping-option">
                <input
                  type="radio"
                  name="shipping"
                  value="domicilio"
                  checked={shipping === 'domicilio'}
                  onChange={(e) => setShipping(e.target.value)}
                />
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
                  onChange={(e) => setShipping(e.target.value)}
                />
                <span>
                  <span className="shipping-option-title">Retiro en punto</span>
                  <span className="shipping-option-text">
                    Retira tu pedido en Starken o Chilexpress, en Viña del Mar.
                  </span>
                </span>
              </label>
            </div>

            {shipping === 'domicilio' && (
              <div className="mt-5">
                <label htmlFor="delivery-address" className="filter-title">Dirección de despacho</label>
                <input
                  id="delivery-address"
                  type="text"
                  className="form-input mt-2"
                  autoComplete="street-address"
                  placeholder="Calle, número, comuna y ciudad"
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  aria-describedby={checkoutError ? 'checkout-error' : undefined}
                />
              </div>
            )}

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
                        checked={pickupId === point.id}
                        onChange={(e) => setPickupId(e.target.value)}
                      />
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
          </div>}
        </div>

        {/* Resumen */}
        <aside className="cart-card cart-summary">
          <h2 className="cart-card-title">Resumen</h2>

          <div className="cart-summary-rows">
            <div className="cart-row">
              <span>Subtotal</span>
              <span className="cart-row-strong">{formatCLP(subtotal)}</span>
            </div>
            <div className="cart-row">
              <span>IVA (19%)</span>
              <span className="cart-row-strong">{formatCLP(tax)}</span>
            </div>
            <div className="cart-total-row">
              <span>Total</span>
              <span>{formatCLP(total)}</span>
            </div>
          </div>

          {checkoutError && <p id="checkout-error" className="text-sm text-red-700" role="alert">{checkoutError}</p>}
          <button
            type="button"
            className="btn-primary btn-block disabled:cursor-not-allowed disabled:opacity-50"
            disabled={cartItems.length === 0}
            onClick={handleCheckout}
          >
            Confirmar pedido simulado
          </button>
          <Link to="/catalogo" className="btn-outline btn-block">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </section>
  )
}