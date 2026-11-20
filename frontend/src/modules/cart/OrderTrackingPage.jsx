import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState.jsx'
import FormField from '../../components/common/FormField.jsx'
import { ORDER_STATUSES, trackOrder } from '../../services/orderApi.js'
import { formatCLP } from '../../utils/format.js'

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  validado: 'Validado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
}

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams()
  const initialReference = searchParams.get('tracking') ?? searchParams.get('orden') ?? ''
  const [reference, setReference] = useState(initialReference)
  const [order, setOrder] = useState(null)
  const [searched, setSearched] = useState(Boolean(initialReference))
  const [loading, setLoading] = useState(Boolean(initialReference))
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!initialReference) return undefined
    let active = true
    trackOrder(initialReference)
      .then((trackedOrder) => {
        if (active) setOrder(trackedOrder)
      })
      .catch((lookupError) => {
        if (!active) return
        if (lookupError.status === 404) setNotFound(true)
        else setError(lookupError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [initialReference])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSearched(true)
    setLoading(true)
    setOrder(null)
    setNotFound(false)
    setError('')
    try {
      setOrder(await trackOrder(reference.trim()))
    } catch (lookupError) {
      if (lookupError.status === 404) setNotFound(true)
      else setError(lookupError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-container featured-section">
      <p className="section-kicker">Pedidos</p>
      <h1 className="section-title">Seguimiento de pedido</h1>

      <form className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
        <div className="min-w-0 flex-1">
          <FormField
            id="order-reference"
            label="Número de pedido o seguimiento"
            placeholder="SV-DEMO-1001 o TRK-DEMO-1001"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>Buscar pedido</button>
      </form>

      {loading ? (
        <p className="mt-8 text-sm text-costa-deep" role="status">Buscando pedido…</p>
      ) : error ? (
        <p className="mt-8 text-sm text-red-700" role="alert">No se pudo consultar el seguimiento. Inténtalo nuevamente.</p>
      ) : order ? (
        <article className="cart-card mt-8 max-w-3xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-costa-sage">Seguimiento {order.trackingNumber}</p>
              <h2 className="mt-1 text-lg font-semibold text-costa-ink">Pedido {order.id}</h2>
            </div>
            <span className={`order-status order-status-${order.status}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          <ol className="order-timeline mt-6" aria-label="Historial de estados del pedido">
            {(order.statusHistory ?? [{ status: order.status, createdAt: order.createdAt }]).map((entry, index) => (
              <li className="order-timeline-item" key={`${entry.status}-${entry.createdAt}-${index}`}>
                <span className="order-timeline-dot" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-costa-ink">{STATUS_LABELS[entry.status] ?? entry.status}</p>
                  <p className="mt-0.5 text-xs text-costa-sage">{new Date(entry.createdAt).toLocaleString('es-CL')}</p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="mt-6 space-y-1 border-t border-costa-mist/60 pt-4 text-sm text-costa-deep">
            {order.items.map((item) => <li key={item.code}>{item.quantity} × {item.name}</li>)}
          </ul>
          <div className="cart-total-row mt-4"><span>Total</span><span>{formatCLP(order.total)}</span></div>
        </article>
      ) : searched && notFound ? (
        <div className="mt-8 max-w-2xl">
          <EmptyState title="No encontramos ese pedido" description="Revisa el número de pedido o el código de seguimiento." />
        </div>
      ) : null}

      <p className="mt-5 text-xs text-costa-sage">Estados disponibles: {ORDER_STATUSES.map((status) => STATUS_LABELS[status]).join(' · ')}.</p>
    </section>
  )
}