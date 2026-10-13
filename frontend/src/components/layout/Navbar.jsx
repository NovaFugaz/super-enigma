import { NavLink } from "react-router-dom"

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Navbar({ mobile = false, onNavigate, user, onLogout }) {
  const roleHome = user?.role === 'seller'
    ? { to: '/vendedor', label: 'Panel vendedor' }
    : user?.role === 'admin'
      ? { to: '/administracion', label: 'Administración' }
      : user?.role === 'customer'
        ? { to: '/pedidos', label: 'Pedidos' }
        : null

  return (
    <nav
      className={mobile ? 'nav-mobile' : 'nav-desktop'}
      aria-label={mobile ? 'Principal móvil' : 'Principal'}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className="nav-link"
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}

      {roleHome && (
        <NavLink to={roleHome.to} className="nav-link" onClick={onNavigate}>
          {roleHome.label}
        </NavLink>
      )}

      {mobile && (
        <>
          {user ? (
            <button
              type="button"
              className="nav-link text-left"
              onClick={() => {
                onLogout()
                onNavigate()
              }}
            >
              Cerrar sesión ({user.name.split(' ')[0]})
            </button>
          ) : (
            <>
              <NavLink to="/login" className="nav-link" onClick={onNavigate}>Iniciar sesión</NavLink>
              <NavLink to="/registro" className="nav-link" onClick={onNavigate}>Registrarse</NavLink>
            </>
          )}
        </>
      )}
    </nav>
  )
}