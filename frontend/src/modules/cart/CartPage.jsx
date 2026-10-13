import { Link, useNavigate } from 'react-router-dom'
import CartItem from '../../components/cart/CartItem.jsx'
import { useCart } from '../../hooks/useCart.js'
import { LOCATIONS } from '../../services/locations.js'
import { useCart } from '../../hooks/useCart.js'
import { useAuth } from '../../hooks/useAuth.js'
import { formatCLP } from '../../utils/format.js'
import CartItem from '../../components/cart/CartItem.jsx'
import { simulatePayment } from '../../services/mockOrders.js'

const PICKUP_POINTS = LOCATIONS.filter((loc) => loc.type === 'pickup')

export default function CartPage() {
  const [shipping, setShipping] = useState('domicilio')
  const [pickupId, setPickupId] = useState(PICKUP_POINTS[0]?.id)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [order, setOrder] = useState(null)
  const [paymentMessage, setPaymentMessage] = useState('')
  const { cartItems, subtotal, tax, total, createOrder } = useCart()
  const { user } = useAuth()

  const handlePayment = (approved) => {
    setCheckoutError('')
    setPaymentMessage('')
    if (!user || user.role !== 'customer') {
      setCheckoutError('Inicia sesión con una cuenta de cliente para continuar.')
      return
    }
    if (shipping === 'domicilio' && !deliveryAddress.trim()) {
      setCheckoutError('Ingresa la dirección donde recibirás el pedido.')
      return
    }

    const payment = simulatePayment(approved)
    if (!payment.approved) {
      setPaymentMessage(payment.message)
      return
    }

    const pickup = PICKUP_POINTS.find((point) => point.id === pickupId)
    const result = createOrder({
      shipping: {
        method: shipping,
        address: shipping === 'domicilio' ? deliveryAddress.trim() : '',
        pickup: shipping === 'retiro' && pickup ? { name: pickup.name, address: pickup.address } : null,
      },
      customer: user,
      payment,
    })

    if (result.error) {
      setPaymentMessage(result.error)
      return
    }
    setOrder(result.order)
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
          <p className="mt-3 text-sm font-semibold text-costa-deep">{order.receipt.type}: {order.receipt.number}</p>
          <p className="mt-1 text-xs text-costa-sage">
            Pago aprobado · Ref. {order.payment.transactionId} · Autorización {order.payment.authorizationCode}
          </p>
          <div className="cart-summary-rows mt-5">
            <div className="cart-row"><span>Productos</span><span>{order.items.reduce((count, item) => count + item.quantity, 0)}</span></div>
            <div className="cart-total-row"><span>Total del pedido</span><span>{formatCLP(order.total)}</span></div>
          </div>
          <Link
            to={`/seguimiento?tracking=${encodeURIComponent(order.trackingNumber)}`}
            className="auth-inline-link mt-4 inline-block"
          >
            Seguir pedido {order.trackingNumber}
          </Link>
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

            {!isEmpty && (
              <button type="button" className="btn-danger-outline mt-4" onClick={clearCart}>
                Vaciar carrito
              </button>
            )}
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
          </div>}
        </div>

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
            {!totals.ivaIncluded && (
              <div className="cart-row">
                <span>IVA (19%)</span>
                <span className="cart-row-strong">{formatCLP(totals.iva)}</span>
              </div>
            )}
            <div className="cart-total-row">
              <span>Total</span>
              <span>{formatCLP(total)}</span>
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

          {checkoutError && <p id="checkout-error" className="text-sm text-red-700" role="alert">{checkoutError}</p>}
          {paymentMessage && <p className="text-sm text-red-700" role="alert">{paymentMessage}</p>}
          {cartItems.length > 0 && !user && (
            <div className="space-y-2">
              <p className="text-sm text-costa-deep">Inicia sesión como cliente para pagar y guardar el pedido en tu historial.</p>
              <Link to="/login" state={{ from: { pathname: '/carrito' } }} className="btn-primary btn-block">
                Iniciar sesión
              </Link>
            </div>
          )}
          {cartItems.length > 0 && user?.role === 'customer' && (
            <div className="space-y-2">
              <button type="button" className="btn-primary btn-block" onClick={() => handlePayment(true)}>
                Pagar con tarjeta (simulación)
              </button>
              <button type="button" className="btn-outline btn-block" onClick={() => handlePayment(false)}>
                Simular pago rechazado
              </button>
            </div>
          )}
          <Link to="/catalogo" className="btn-outline btn-block">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </section>
  )
}