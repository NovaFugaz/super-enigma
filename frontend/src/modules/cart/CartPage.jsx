import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LOCATIONS } from '../../services/locations.js'

const PICKUP_POINTS = LOCATIONS.filter((loc) => loc.type === 'pickup')

export default function CartPage() {
  // Solo estado visual de las opciones. La lógica real del carrito queda pendiente.
  const [shipping, setShipping] = useState('domicilio')
  const [pickupId, setPickupId] = useState(PICKUP_POINTS[0]?.id)

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
              {/* TODO: aquí se listarán los productos del carrito
                  (nombre, cantidad con .qty-stepper, eliminar) */}
              <p className="cart-empty">Tu carrito está vacío.</p>
            </div>
          </div>

          {/* Tipo de despacho */}
          <div className="cart-card">
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
          </div>
        </div>

        {/* Resumen */}
        <aside className="cart-card cart-summary">
          <h2 className="cart-card-title">Resumen</h2>

          <div className="cart-summary-rows">
            <div className="cart-row">
              <span>Subtotal</span>
              <span className="cart-row-strong">$0</span>
            </div>
            <div className="cart-row">
              <span>IVA (19%)</span>
              <span className="cart-row-strong">$0</span>
            </div>
            <div className="cart-total-row">
              <span>Total</span>
              <span>$0</span>
            </div>
          </div>

          {/* Redirige al login (aún no implementado) */}
          <Link to="/login" className="btn-primary btn-block">
            Pagar
          </Link>
          <Link to="/catalogo" className="btn-outline btn-block">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </section>
  )
}