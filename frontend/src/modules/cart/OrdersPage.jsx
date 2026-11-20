import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { fetchMyOrders, ORDER_STATUSES } from '../../services/orderApi.js'
import { formatCLP } from '../../utils/format.js'

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  validado: 'Validado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    fetchMyOrders()
      .then((loadedOrders) => {
        if (active) setOrders(loadedOrders)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user.email, user.id, reloadKey])

  const visibleOrders = useMemo(
    () => statusFilter === 'todos' ? orders : orders.filter((order) => order.status === statusFilter),
    [orders, statusFilter],
  )

  return (
    <section className="page-container featured-section">
      <p className="section-kicker">Mi cuenta</p>
      <h1 className="section-title">Mis pedidos</h1>

      <div className="catalog-toolbar mt-6">
        <p className="text-sm text-costa-deep">{visibleOrders.length} pedidos</p>
        <label className="catalog-sort">
          <span className="sr-only">Filtrar pedidos por estado</span>
          <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="todos">Todos los estados</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-costa-deep" role="status">Cargando tus pedidos…</p>
      ) : error ? (
        <div className="mt-8 max-w-2xl" role="alert">
          <p>No se pudieron cargar tus pedidos.</p>
          <button type="button" className="auth-inline-link mt-2" onClick={() => {
            setError('')
            setLoading(true)
            setReloadKey((key) => key + 1)
          }}>
            Reintentar
          </button>
        </div>
      ) : visibleOrders.length === 0 ? (
        <EmptyState
          title={orders.length === 0 ? 'Todavía no tienes pedidos' : 'No hay pedidos en este estado'}
          description="Cuando confirmes una compra, aparecerá aquí con sus productos y seguimiento."
        />
      ) : (
        <div className="mt-5 space-y-4">
          {visibleOrders.map((order) => (
            <article className="cart-card" key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-costa-sage">{new Date(order.createdAt).toLocaleDateString('es-CL')}</p>
                  <h2 className="mt-1 text-base font-semibold text-costa-ink">Pedido {order.id}</h2>
                </div>
                <span className={`order-status order-status-${order.status}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-costa-deep">
                {order.items.map((item) => (
                  <li key={item.code}>{item.quantity} × {item.name}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-costa-mist/60 pt-4">
                <span className="font-semibold text-costa-ink">{formatCLP(order.total)}</span>
                <Link
                  to={`/seguimiento?tracking=${encodeURIComponent(order.trackingNumber ?? order.id)}`}
                  className="auth-inline-link"
                >
                  Seguimiento · {order.trackingNumber ?? order.id}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}