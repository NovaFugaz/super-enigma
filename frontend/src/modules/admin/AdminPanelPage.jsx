import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useCatalog } from '../../hooks/useCatalog.js'
import {
  createManagedUser,
  listManagedUsers,
  updateManagedUser,
  USER_ROLES,
} from '../../services/mockAuth.js'
import { getOrders } from '../../services/mockOrders.js'
import { downloadSalesReport } from '../../services/salesReport.js'
import { formatCLP } from '../../utils/format.js'

const ROLE_LABELS = { customer: 'Cliente', seller: 'Vendedor', admin: 'Administrador' }
const TAB_LABELS = { dashboard: 'Dashboard', usuarios: 'Usuarios y roles', productos: 'Productos', inventario: 'Inventario' }
const DASHBOARD_MOUNTED_AT = Date.now()
const EMPTY_USER = { name: '', phone: '', email: '', password: '', role: 'customer' }
const EMPTY_PRODUCT = {
  codigo: '', categoria: 'guitarras-acusticas', nombre: '', marca: '', modelo: '',
  precio: '', stock: 0, descripcion: '', image: '',
}

function readThreshold() {
  try {
    const threshold = Number(window.localStorage.getItem('sonido-vivo-low-stock-threshold') ?? 3)
    return Number.isInteger(threshold) && threshold >= 0 ? threshold : 3
  } catch {
    return 3
  }
}

export default function AdminPanelPage() {
  const { user } = useAuth()
  const {
    adminProducts,
    categories,
    createProduct,
    deactivateProduct,
    updateProduct,
    updateStock,
  } = useCatalog()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState(listManagedUsers)
  const [userDraft, setUserDraft] = useState(EMPTY_USER)
  const [editingUserId, setEditingUserId] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('todos')
  const [userStatusFilter, setUserStatusFilter] = useState('todos')
  const [userError, setUserError] = useState('')
  const [productDraft, setProductDraft] = useState(EMPTY_PRODUCT)
  const [editingProductCode, setEditingProductCode] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [productError, setProductError] = useState('')
  const [inventoryQuery, setInventoryQuery] = useState('')
  const [stockDrafts, setStockDrafts] = useState({})
  const [threshold, setThreshold] = useState(readThreshold)
  const [orders, setOrders] = useState(getOrders)
  const [period, setPeriod] = useState('30')
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

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase()
    return users.filter((account) => {
      const matchesQuery = !query || `${account.name} ${account.email} ${account.phone}`.toLowerCase().includes(query)
      const matchesRole = userRoleFilter === 'todos' || account.role === userRoleFilter
      const matchesActive = userStatusFilter === 'todos' || (userStatusFilter === 'activos' ? account.active : !account.active)
      return matchesQuery && matchesRole && matchesActive
    })
  }, [users, userQuery, userRoleFilter, userStatusFilter])

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase()
    return adminProducts.filter((product) =>
      !query || `${product.codigo} ${product.nombre} ${product.marca} ${product.modelo}`.toLowerCase().includes(query),
    )
  }, [adminProducts, productQuery])

  const filteredInventory = useMemo(() => {
    const query = inventoryQuery.trim().toLowerCase()
    return adminProducts.filter((product) =>
      product.active !== false &&
      (!query || `${product.codigo} ${product.nombre} ${product.marca}`.toLowerCase().includes(query)),
    )
  }, [adminProducts, inventoryQuery])

  const salesOrders = useMemo(() => {
    const cutoff = period === 'all' ? 0 : DASHBOARD_MOUNTED_AT - Number(period) * 86_400_000
    return orders.filter((order) =>
      order.status !== 'rechazado' &&
      (order.demo || order.payment?.status === 'aprobado') &&
      new Date(order.createdAt).getTime() >= cutoff,
    )
  }, [orders, period])

  const salesTotal = salesOrders.reduce((sum, order) => sum + order.total, 0)
  const salesUnits = salesOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )
  const topProducts = useMemo(() => {
    const totals = new Map()
    salesOrders.forEach((order) => order.items.forEach((item) => {
      const current = totals.get(item.code) ?? { code: item.code, name: item.name, units: 0, sales: 0 }
      current.units += item.quantity
      current.sales += item.lineTotal
      totals.set(item.code, current)
    }))
    return [...totals.values()].sort((left, right) => right.sales - left.sales).slice(0, 5)
  }, [salesOrders])

  const salesByDate = useMemo(() => {
    const totals = new Map()
    salesOrders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString('es-CL')
      totals.set(date, (totals.get(date) ?? 0) + order.total)
    })
    return [...totals.entries()].slice(-14)
  }, [salesOrders])
  const maxDailySales = Math.max(1, ...salesByDate.map(([, amount]) => amount))
  const lowStockCount = adminProducts.filter((product) => product.active !== false && product.stock <= threshold).length
  const activeUsersCount = users.filter((account) => account.active).length

  const refreshUsers = () => setUsers(listManagedUsers())

  const saveUser = async (event) => {
    event.preventDefault()
    setUserError('')
    if (!userDraft.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDraft.email.trim())) {
      setUserError('Ingresa un nombre y un correo válido.')
      return
    }

    if (editingUserId) {
      const editingAccount = users.find((account) => account.id === editingUserId)
      const activeAdminCount = users.filter((account) => account.active && account.role === 'admin').length
      if (editingUserId === user.id && userDraft.role !== user.role) {
        setUserError('No puedes cambiar tu propio rol desde esta sesión.')
        return
      }
      if (editingAccount?.active && editingAccount.role === 'admin' && userDraft.role !== 'admin' && activeAdminCount <= 1) {
        setUserError('Debe permanecer al menos un administrador activo.')
        return
      }
      const result = updateManagedUser(editingUserId, userDraft)
      if (result.error) {
        setUserError(result.error)
        return
      }
      setFeedback(`Usuario ${result.user.email} actualizado.`)
    } else {
      if (userDraft.password.length < 8) {
        setUserError('La contraseña inicial debe tener al menos 8 caracteres.')
        return
      }
      const result = await createManagedUser(userDraft)
      if (result.error) {
        setUserError(result.error)
        return
      }
      setFeedback(`Usuario ${result.user.email} creado.`)
    }

    refreshUsers()
    setEditingUserId('')
    setUserDraft(EMPTY_USER)
  }

  const editUser = (account) => {
    setEditingUserId(account.id)
    setUserDraft({ ...account, password: '' })
    setUserError('')
    setActiveTab('usuarios')
  }

  const toggleUserActive = (account) => {
    if (account.id === user.id) {
      setUserError('No puedes desactivar tu propia cuenta desde esta sesión.')
      return
    }
    const activeAdminCount = users.filter((entry) => entry.active && entry.role === 'admin').length
    if (account.active && account.role === 'admin' && activeAdminCount <= 1) {
      setUserError('Debe permanecer al menos un administrador activo.')
      return
    }
    const result = updateManagedUser(account.id, { active: !account.active })
    if (result.error) {
      setUserError(result.error)
      return
    }
    refreshUsers()
    setUserError('')
    setFeedback(`Usuario ${account.email}: ${account.active ? 'desactivado' : 'activado'}.`)
  }

  const saveProduct = (event) => {
    event.preventDefault()
    setProductError('')
    const result = editingProductCode
      ? updateProduct(editingProductCode, productDraft)
      : createProduct(productDraft)
    if (result.error) {
      setProductError(result.error)
      return
    }
    setFeedback(`Producto ${result.product.codigo} ${editingProductCode ? 'actualizado' : 'creado'}.`)
    setProductDraft(EMPTY_PRODUCT)
    setEditingProductCode('')
  }

  const editProduct = (product) => {
    setEditingProductCode(product.codigo)
    setProductDraft({ ...product, precio: String(product.precio), stock: product.stock })
    setProductError('')
    setActiveTab('productos')
  }

  const handleDeactivateProduct = (product) => {
    const result = deactivateProduct(product.codigo)
    if (result.error) {
      setProductError(result.error)
      return
    }
    setFeedback(`Producto ${product.codigo} desactivado del catálogo.`)
  }

  const saveStock = (product) => {
    const stock = Number(stockDrafts[product.codigo] ?? product.stock)
    const result = updateStock(product.codigo, stock)
    if (result.error) {
      setFeedback(result.error)
      return
    }
    setStockDrafts((current) => {
      const next = { ...current }
      delete next[product.codigo]
      return next
    })
    setFeedback(`Stock de ${product.codigo} actualizado.`)
  }

  const saveThreshold = (value) => {
    const next = Math.max(0, Math.floor(Number(value) || 0))
    setThreshold(next)
    try {
      window.localStorage.setItem('sonido-vivo-low-stock-threshold', String(next))
    } catch {
      setFeedback('No se pudo guardar el umbral de stock.')
    }
  }

  return (
    <section className="page-container featured-section">
      <p className="section-kicker">Administración</p>
      <h1 className="section-title">Panel administrador</h1>
      <p className="mt-2 text-sm text-costa-deep">Sesión: {user.name}</p>

      <div className="admin-tabs mt-7" role="tablist" aria-label="Secciones de administración">
        {Object.entries(TAB_LABELS).map(([tab, label]) => (
          <button
            type="button"
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`seller-tab ${activeTab === tab ? 'seller-tab-active' : ''}`}
            onClick={() => { setActiveTab(tab); setFeedback('') }}
          >{label}</button>
        ))}
      </div>
      {feedback && <p className="mt-4 text-sm text-costa-deep" role="status" aria-live="polite">{feedback}</p>}

      {activeTab === 'dashboard' && (
        <section className="admin-section" role="tabpanel" aria-label="Dashboard">
          <div className="admin-dashboard-toolbar">
            <label className="seller-control admin-period-control">
              <span>Período de ventas</span>
              <select className="form-input" value={period} onChange={(event) => setPeriod(event.target.value)}>
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="365">Último año</option>
                <option value="all">Todo el historial</option>
              </select>
            </label>
            <button type="button" className="btn-primary" onClick={() => downloadSalesReport(salesOrders)}>
              Exportar reporte CSV
            </button>
          </div>
          <div className="seller-metrics mt-4">
            <div className="seller-metric"><span>Ventas del período</span><strong>{formatCLP(salesTotal)}</strong></div>
            <div className="seller-metric"><span>Pedidos considerados</span><strong>{salesOrders.length}</strong></div>
            <div className="seller-metric"><span>Unidades vendidas</span><strong>{salesUnits}</strong></div>
            <div className="seller-metric"><span>Usuarios activos</span><strong>{activeUsersCount}</strong></div>
            <div className="seller-metric"><span>Productos activos</span><strong>{adminProducts.filter((product) => product.active !== false).length}</strong></div>
            <div className="seller-metric"><span>Alertas de stock</span><strong>{lowStockCount}</strong></div>
          </div>

          <div className="admin-dashboard-grid mt-5">
            <section className="admin-panel">
              <h2 className="admin-panel-title">Ventas por fecha</h2>
              {salesByDate.length === 0 ? <p className="text-sm text-costa-sage">Sin ventas en este período.</p> : (
                <div className="admin-sales-chart" aria-label="Gráfico de ventas por fecha">
                  {salesByDate.map(([date, amount]) => (
                    <div className="admin-sales-column" key={date} title={`${date}: ${formatCLP(amount)}`}>
                      <span className="admin-sales-bar" style={{ height: `${Math.max(6, amount / maxDailySales * 100)}%` }} />
                      <span className="admin-sales-date">{date}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="admin-panel">
              <h2 className="admin-panel-title">Productos top</h2>
              {topProducts.length === 0 ? <p className="text-sm text-costa-sage">Sin ventas en este período.</p> : (
                <ol className="admin-top-products">
                  {topProducts.map((product, index) => (
                    <li key={product.code}><span>{index + 1}. {product.name}<small>{product.units} unidades</small></span><strong>{formatCLP(product.sales)}</strong></li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </section>
      )}

      {activeTab === 'usuarios' && (
        <section className="admin-section" role="tabpanel" aria-label="Usuarios y roles">
          <div className="admin-management-grid">
            <section className="admin-panel">
              <h2 className="admin-panel-title">{editingUserId ? 'Editar usuario' : 'Agregar funcionario o cliente'}</h2>
              <form className="admin-form" onSubmit={saveUser} noValidate>
                <label className="seller-control"><span>Nombre</span><input className="form-input" value={userDraft.name} onChange={(event) => setUserDraft((current) => ({ ...current, name: event.target.value }))} required /></label>
                <label className="seller-control"><span>Teléfono</span><input className="form-input" value={userDraft.phone} onChange={(event) => setUserDraft((current) => ({ ...current, phone: event.target.value }))} /></label>
                <label className="seller-control"><span>Correo electrónico</span><input className="form-input" type="email" value={userDraft.email} onChange={(event) => setUserDraft((current) => ({ ...current, email: event.target.value }))} required /></label>
                {!editingUserId && <label className="seller-control"><span>Contraseña inicial</span><input className="form-input" type="password" minLength="8" value={userDraft.password} onChange={(event) => setUserDraft((current) => ({ ...current, password: event.target.value }))} required /></label>}
                <label className="seller-control"><span>Rol</span><select className="form-input" aria-label="Rol del usuario" value={userDraft.role} onChange={(event) => setUserDraft((current) => ({ ...current, role: event.target.value }))}>{USER_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select></label>
                {userError && <p className="form-error" role="alert">{userError}</p>}
                <div className="flex flex-wrap gap-2">
                  <button type="submit" className="btn-primary">{editingUserId ? 'Guardar cambios' : 'Crear usuario'}</button>
                  {editingUserId && <button type="button" className="btn-outline" onClick={() => { setEditingUserId(''); setUserDraft(EMPTY_USER); setUserError('') }}>Cancelar edición</button>}
                </div>
              </form>
            </section>
            <section className="admin-panel admin-user-list-panel">
              <h2 className="admin-panel-title">Usuarios ({users.length})</h2>
              <div className="admin-inline-filters">
                <input className="form-input" type="search" aria-label="Buscar usuarios" placeholder="Nombre o correo" value={userQuery} onChange={(event) => setUserQuery(event.target.value)} />
                <select className="form-input" aria-label="Filtrar por rol" value={userRoleFilter} onChange={(event) => setUserRoleFilter(event.target.value)}><option value="todos">Todos los roles</option>{USER_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select>
                <select className="form-input" aria-label="Filtrar por estado de usuario" value={userStatusFilter} onChange={(event) => setUserStatusFilter(event.target.value)}><option value="todos">Todos</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option></select>
              </div>
              <div className="admin-list-table-wrap">
                <table className="seller-table">
                  <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {filteredUsers.map((account) => (
                      <tr key={account.id}>
                        <td><strong>{account.name}</strong><span className="seller-subline">{account.email}</span></td>
                        <td>{ROLE_LABELS[account.role]}</td>
                        <td><span className={`order-status ${account.active ? 'order-status-validado' : 'order-status-rechazado'}`}>{account.active ? 'Activo' : 'Inactivo'}</span></td>
                        <td><div className="admin-row-actions"><button type="button" className="auth-inline-link" onClick={() => editUser(account)}>Editar</button><button type="button" className="auth-inline-link" disabled={account.id === user.id} onClick={() => toggleUserActive(account)}>{account.active ? 'Desactivar' : 'Activar'}</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <p className="py-5 text-sm text-costa-sage">Sin usuarios para estos filtros.</p>}
              </div>
            </section>
          </div>
        </section>
      )}

      {activeTab === 'productos' && (
        <section className="admin-section" role="tabpanel" aria-label="Productos">
          <div className="admin-management-grid">
            <section className="admin-panel">
              <h2 className="admin-panel-title">{editingProductCode ? `Editar ${editingProductCode}` : 'Crear producto'}</h2>
              <form className="admin-form" onSubmit={saveProduct} noValidate>
                <label className="seller-control"><span>Código</span><input className="form-input" value={productDraft.codigo} disabled={Boolean(editingProductCode)} onChange={(event) => setProductDraft((current) => ({ ...current, codigo: event.target.value }))} required /></label>
                <label className="seller-control"><span>Nombre</span><input className="form-input" value={productDraft.nombre} onChange={(event) => setProductDraft((current) => ({ ...current, nombre: event.target.value }))} required /></label>
                <label className="seller-control"><span>Categoría</span><select className="form-input" aria-label="Categoría del producto" value={productDraft.categoria} onChange={(event) => setProductDraft((current) => ({ ...current, categoria: event.target.value }))}>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.nombre}</option>)}</select></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="seller-control"><span>Marca</span><input className="form-input" value={productDraft.marca} onChange={(event) => setProductDraft((current) => ({ ...current, marca: event.target.value }))} /></label>
                  <label className="seller-control"><span>Modelo</span><input className="form-input" value={productDraft.modelo} onChange={(event) => setProductDraft((current) => ({ ...current, modelo: event.target.value }))} /></label>
                </div>
                <label className="seller-control"><span>Precio CLP</span><input className="form-input" type="number" min="0" step="1" value={productDraft.precio} onChange={(event) => setProductDraft((current) => ({ ...current, precio: event.target.value }))} required /></label>
                {!editingProductCode && <label className="seller-control"><span>Stock inicial</span><input className="form-input" type="number" min="0" step="1" value={productDraft.stock} onChange={(event) => setProductDraft((current) => ({ ...current, stock: event.target.value }))} required /></label>}
                <label className="seller-control"><span>Descripción</span><textarea className="form-input" rows="3" value={productDraft.descripcion} onChange={(event) => setProductDraft((current) => ({ ...current, descripcion: event.target.value }))} /></label>
                {productError && <p className="form-error" role="alert">{productError}</p>}
                <div className="flex flex-wrap gap-2"><button type="submit" className="btn-primary">{editingProductCode ? 'Guardar producto' : 'Crear producto'}</button>{editingProductCode && <button type="button" className="btn-outline" onClick={() => { setEditingProductCode(''); setProductDraft(EMPTY_PRODUCT); setProductError('') }}>Cancelar</button>}</div>
              </form>
            </section>
            <section className="admin-panel admin-product-list-panel">
              <h2 className="admin-panel-title">Catálogo ({adminProducts.length})</h2>
              <input className="form-input" type="search" aria-label="Buscar productos" placeholder="Código, nombre o marca" value={productQuery} onChange={(event) => setProductQuery(event.target.value)} />
              <div className="admin-list-table-wrap">
                <table className="seller-table">
                  <thead><tr><th>Producto</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>{filteredProducts.map((product) => (
                    <tr key={product.codigo}>
                      <td><strong>{product.nombre}</strong><span className="seller-subline">{product.codigo} · {product.marca}</span></td>
                      <td>{product.stock}</td>
                      <td><span className={`order-status ${product.active === false ? 'order-status-rechazado' : 'order-status-validado'}`}>{product.active === false ? 'Inactivo' : 'Activo'}</span></td>
                      <td><div className="admin-row-actions"><button type="button" className="auth-inline-link" onClick={() => editProduct(product)}>Editar</button>{product.active !== false && <button type="button" className="auth-inline-link" onClick={() => handleDeactivateProduct(product)}>Desactivar</button>}</div></td>
                    </tr>
                  ))}</tbody>
                </table>
                {filteredProducts.length === 0 && <p className="py-5 text-sm text-costa-sage">Sin productos para esta búsqueda.</p>}
              </div>
            </section>
          </div>
        </section>
      )}

      {activeTab === 'inventario' && (
        <section className="admin-section" role="tabpanel" aria-label="Inventario">
          <div className="admin-inventory-toolbar">
            <label className="seller-control"><span>Buscar en inventario</span><input className="form-input" type="search" value={inventoryQuery} onChange={(event) => setInventoryQuery(event.target.value)} placeholder="Código, nombre, marca" /></label>
            <label className="seller-control"><span>Umbral de alerta (unidades)</span><input className="form-input" type="number" min="0" step="1" value={threshold} onChange={(event) => saveThreshold(event.target.value)} /></label>
            <p className="admin-inventory-count">{lowStockCount} productos bajo umbral</p>
          </div>
          <div className="admin-panel admin-inventory-panel">
            <div className="seller-table-wrap">
              <table className="seller-table">
                <thead><tr><th>Código</th><th>Producto</th><th>Stock</th><th>Alerta</th><th>Ajustar</th><th>Acción</th></tr></thead>
                <tbody>{filteredInventory.map((product) => (
                  <tr key={product.codigo}>
                    <td className="seller-code">{product.codigo}</td>
                    <td><strong>{product.nombre}</strong><span className="seller-subline">{product.marca} · {product.modelo}</span></td>
                    <td>{product.stock}</td>
                    <td>{product.stock <= threshold ? <span className="stock-badge stock-low">Revisar stock</span> : <span className="text-xs text-costa-sage">Normal</span>}</td>
                    <td><input className="form-input seller-stock-input" type="number" min="0" step="1" aria-label={`Stock nuevo ${product.codigo}`} value={stockDrafts[product.codigo] ?? product.stock} onChange={(event) => setStockDrafts((current) => ({ ...current, [product.codigo]: event.target.value }))} /></td>
                    <td><button type="button" className="btn-outline seller-save-button" onClick={() => saveStock(product)}>Guardar</button></td>
                  </tr>
                ))}</tbody>
              </table>
              {filteredInventory.length === 0 && <p className="py-5 text-sm text-costa-sage">No hay productos para esta búsqueda.</p>}
            </div>
          </div>
        </section>
      )}
    </section>
  )
}