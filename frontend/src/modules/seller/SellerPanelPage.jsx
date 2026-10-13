import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/common/EmptyState.jsx'
import StockBadge from '../../components/catalog/StockBadge.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useCatalog } from '../../hooks/useCatalog.js'
import {
  getOrders,
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  updateOrderStatus,
} from '../../services/mockOrders.js'
import { formatCLP } from '../../utils/format.js'

const THRESHOLD_KEY = 'sonido-vivo-low-stock-threshold'
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  validado: 'Validado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
}

function readThreshold() {
  try {
    const threshold = Number(window.localStorage.getItem(THRESHOLD_KEY) ?? 3)
    return Number.isInteger(threshold) && threshold >= 0 ? threshold : 3
  } catch {
    return 3
  }
}

function dateTime(value) {
  return new Date(value).toLocaleString('es-CL')
}

export default function SellerPanelPage() {
  const { user } = useAuth()
  const { products, categories, updateStock } = useCatalog()
  const [activeTab, setActiveTab] = useState('inventario')
  const [inventoryQuery, setInventoryQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [stockFilter, setStockFilter] = useState('todos')
  const [threshold, setThreshold] = useState(readThreshold)
  const [stockDrafts, setStockDrafts] = useState({})
  const [orders, setOrders] = useState(getOrders)
  const [orderFilter, setOrderFilter] = useState('todos')
  const [orderQuery, setOrderQuery] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [nextStatus, setNextStatus] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const refreshOrders = () => setOrders(getOrders())
    refreshOrders()
    window.addEventListener('sonido-vivo:order-status-changed', refreshOrders)
    window.addEventListener('storage', refreshOrders)
    return () => {
      window.removeEventListener('sonido-vivo:order-status-changed', refreshOrders)
      window.removeEventListener('storage', refreshOrders)
    }
  }, [])

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= threshold),
    [products, threshold],
  )

  const filteredProducts = useMemo(() => {
    const query = inventoryQuery.trim().toLocaleLowerCase()
    return products.filter((product) => {
      const matchesQuery = !query ||
        `${product.codigo} ${product.nombre} ${product.marca} ${product.modelo}`.toLocaleLowerCase().includes(query)
      const matchesCategory = categoryFilter === 'todas' || product.categoria === categoryFilter
      const matchesStock = stockFilter === 'todos' ||
        (stockFilter === 'bajo' && product.stock > 0 && product.stock <= threshold) ||
        (stockFilter === 'agotado' && product.stock === 0)
      return matchesQuery && matchesCategory && matchesStock
    })
  }, [products, inventoryQuery, categoryFilter, stockFilter, threshold])

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLocaleLowerCase()
    return orders
      .filter((order) => orderFilter === 'todos' || order.status === orderFilter)
      .filter((order) => !query ||
        `${order.id} ${order.trackingNumber ?? ''} ${order.customerName ?? ''} ${order.customerEmail ?? ''}`
          .toLocaleLowerCase().includes(query))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  }, [orders, orderFilter, orderQuery])

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null
  const inProgressCount = orders.filter((order) => ['pendiente', 'en_proceso', 'validado'].includes(order.status)).length

  const saveThreshold = (value) => {
    const next = Math.max(0, Math.floor(Number(value) || 0))
    setThreshold(next)
    try {
      window.localStorage.setItem(THRESHOLD_KEY, String(next))
    } catch {
      setFeedback('No se pudo guardar el umbral en este navegador.')
    }
  }

  const saveStock = (product) => {
    const value = Number(stockDrafts[product.codigo] ?? product.stock)
    const result = updateStock(product.codigo, value)
    if (result.error) {
      setFeedback(result.error)
      return
    }
    setStockDrafts((current) => {
      const next = { ...current }
      delete next[product.codigo]
      return next
    })
    setFeedback(`Stock de ${product.codigo} actualizado a ${result.stock}.`)
  }

  const selectOrder = (order) => {
    setSelectedOrderId(order.id)
    setNextStatus(ORDER_STATUS_TRANSITIONS[order.status]?.[0] ?? '')
    setFeedback('')
  }

  const saveOrderStatus = () => {
    if (!selectedOrder || !nextStatus) return
    const result = updateOrderStatus(selectedOrder.id, nextStatus, user)
    if (result.error) {
      setFeedback(result.error)
      return
    }
    setOrders(getOrders())
    setFeedback(result.changed ? `Pedido ${selectedOrder.id}: ${STATUS_LABELS[nextStatus]}.` : 'El pedido ya tiene ese estado.')
    setNextStatus(ORDER_STATUS_TRANSITIONS[nextStatus]?.[0] ?? '')
  }

  return (
    <section className="page-container featured-section">
      <p className="section-kicker">Operaciones</p>
      <h1 className="section-title">Panel de vendedor</h1>
      <p className="mt-2 text-sm text-costa-deep">Sesión: {user.name}</p>

      <div className="seller-metrics mt-6" aria-label="Resumen operativo">
        <div className="seller-metric"><span>Productos</span><strong>{products.length}</strong></div>
        <div className="seller-metric"><span>Stock bajo o agotado</span><strong>{lowStockProducts.length}</strong></div>
        <div className="seller-metric"><span>Pedidos en curso</span><strong>{inProgressCount}</strong></div>
      </div>

      {lowStockProducts.length > 0 && (
        <aside className="seller-alert mt-5" role="status">
          <strong>{lowStockProducts.length} productos requieren revisión de stock.</strong>
          <span> Umbral actual: {threshold} unidades.</span>
        </aside>
      )}

      <div className="seller-tabs mt-8" role="tablist" aria-label="Áreas del panel">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'inventario'}
          className={`seller-tab ${activeTab === 'inventario' ? 'seller-tab-active' : ''}`}
          onClick={() => setActiveTab('inventario')}
        >Inventario</button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pedidos'}
          className={`seller-tab ${activeTab === 'pedidos' ? 'seller-tab-active' : ''}`}
          onClick={() => setActiveTab('pedidos')}
        >Pedidos</button>
      </div>

      {feedback && <p className="mt-4 text-sm text-costa-deep" role="status" aria-live="polite">{feedback}</p>}

      {activeTab === 'inventario' ? (
        <section className="seller-panel" role="tabpanel" aria-label="Inventario">
          <div className="seller-toolbar">
            <label className="seller-control">
              <span>Buscar producto</span>
              <input className="form-input" type="search" value={inventoryQuery} onChange={(event) => setInventoryQuery(event.target.value)} placeholder="Código, nombre, marca" />
            </label>
            <label className="seller-control">
              <span>Categoría</span>
              <select className="form-input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="todas">Todas</option>
                {categories.map((category) => <option key={category.slug} value={category.slug}>{category.nombre}</option>)}
              </select>
            </label>
            <label className="seller-control">
              <span>Filtrar stock</span>
              <select className="form-input" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
                <option value="todos">Todos</option>
                <option value="bajo">Bajo</option>
                <option value="agotado">Agotado</option>
              </select>
            </label>
            <label className="seller-control seller-threshold">
              <span>Alertar con ≤ unidades</span>
              <input className="form-input" type="number" min="0" step="1" value={threshold} onChange={(event) => saveThreshold(event.target.value)} />
            </label>
          </div>

          <div className="seller-table-wrap">
            <table className="seller-table">
              <thead>
                <tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Nuevo stock</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.codigo}>
                    <td className="seller-code">{product.codigo}</td>
                    <td><strong>{product.nombre}</strong><span className="seller-subline">{product.marca} · {product.modelo}</span></td>
                    <td>{categories.find((category) => category.slug === product.categoria)?.nombre ?? product.categoria}</td>
                    <td><StockBadge stock={product.stock} lowStockThreshold={threshold} /></td>
                    <td>{formatCLP(product.precio)}</td>
                    <td>
                      <input
                        className="form-input seller-stock-input"
                        type="number"
                        min="0"
                        step="1"
                        aria-label={`Nuevo stock para ${product.codigo}`}
                        value={stockDrafts[product.codigo] ?? product.stock}
                        onChange={(event) => setStockDrafts((current) => ({ ...current, [product.codigo]: event.target.value }))}
                      />
                    </td>
                    <td><button type="button" className="btn-outline seller-save-button" onClick={() => saveStock(product)}>Guardar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && <EmptyState title="Sin productos" description="Ajusta los filtros de inventario." />}
          </div>
        </section>
      ) : (
        <section className="seller-orders-layout" role="tabpanel" aria-label="Pedidos">
          <div className="seller-panel seller-order-list">
            <div className="seller-toolbar seller-order-filters">
              <label className="seller-control">
                <span>Buscar pedido</span>
                <input className="form-input" type="search" value={orderQuery} onChange={(event) => setOrderQuery(event.target.value)} placeholder="Número, cliente, tracking" />
              </label>
              <label className="seller-control">
                <span>Estado</span>
                <select className="form-input" value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)}>
                  <option value="todos">Todos</option>
                  {ORDER_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                </select>
              </label>
            </div>
            <div className="seller-order-items">
              {filteredOrders.length === 0 ? (
                <EmptyState title="Sin pedidos" description="No hay coincidencias para estos filtros." />
              ) : filteredOrders.map((order) => (
                <button
                  type="button"
                  key={order.id}
                  className={`seller-order-row ${selectedOrderId === order.id ? 'seller-order-row-active' : ''}`}
                  aria-pressed={selectedOrderId === order.id}
                  onClick={() => selectOrder(order)}
                >
                  <span className="seller-order-row-main"><strong>{order.id}</strong><span>{order.customerName ?? order.customerEmail}</span></span>
                  <span className={`order-status order-status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="seller-panel seller-order-detail">
            {!selectedOrder ? (
              <EmptyState title="Selecciona un pedido" description="El detalle, estado e historial aparecerán aquí." />
            ) : (
              <>
                <div className="seller-detail-heading">
                  <div><p className="text-xs text-costa-sage">{dateTime(selectedOrder.createdAt)}</p><h2 className="mt-1 text-lg font-semibold text-costa-ink">{selectedOrder.id}</h2></div>
                  <span className={`order-status order-status-${selectedOrder.status}`}>{STATUS_LABELS[selectedOrder.status]}</span>
                </div>
                <dl className="seller-detail-grid">
                  <div><dt>Cliente</dt><dd>{selectedOrder.customerName ?? 'Cliente'}</dd></div>
                  <div><dt>Correo</dt><dd>{selectedOrder.customerEmail}</dd></div>
                  <div><dt>Seguimiento</dt><dd>{selectedOrder.trackingNumber}</dd></div>
                  <div><dt>Entrega</dt><dd>{selectedOrder.shipping?.method === 'retiro' ? selectedOrder.shipping.pickup?.name : selectedOrder.shipping?.address}</dd></div>
                </dl>
                <h3 className="seller-section-heading">Productos</h3>
                <ul className="seller-detail-items">
                  {selectedOrder.items.map((item) => <li key={item.code}><span>{item.quantity} × {item.name}</span><strong>{formatCLP(item.lineTotal)}</strong></li>)}
                </ul>
                <div className="cart-total-row mt-3"><span>Total</span><span>{formatCLP(selectedOrder.total)}</span></div>

                {ORDER_STATUS_TRANSITIONS[selectedOrder.status]?.length > 0 ? (
                  <div className="seller-status-actions">
                    <label className="seller-control">
                      <span>Próximo estado permitido</span>
                      <select className="form-input" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
                        {ORDER_STATUS_TRANSITIONS[selectedOrder.status].map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                      </select>
                    </label>
                    <button type="button" className="btn-primary" disabled={!nextStatus} onClick={saveOrderStatus}>Actualizar estado</button>
                  </div>
                ) : <p className="mt-4 text-sm text-costa-sage">Este pedido está en un estado final.</p>}

                <h3 className="seller-section-heading">Registro de acciones</h3>
                {(selectedOrder.auditLog ?? []).length === 0 ? (
                  <p className="text-sm text-costa-sage">Sin acciones registradas todavía.</p>
                ) : (
                  <ol className="seller-audit-list">
                    {selectedOrder.auditLog.map((entry, index) => (
                      <li key={`${entry.createdAt}-${index}`}>
                        <strong>{entry.actorName ?? entry.actorRole ?? 'Sistema'}</strong>
                        <span>{entry.action === 'cambio_estado' ? `${STATUS_LABELS[entry.from]} → ${STATUS_LABELS[entry.to]}` : entry.action}</span>
                        <time dateTime={entry.createdAt}>{dateTime(entry.createdAt)}</time>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </section>
  )
}