import { NavLink } from "react-router-dom"

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Navbar({ mobile = false, onNavigate }) {
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

      {mobile && (
        <>
          <NavLink to="/login" className="nav-link" onClick={onNavigate}>
            Iniciar sesión
          </NavLink>
          <NavLink to="/registro" className="nav-link" onClick={onNavigate}>
            Registrarse
          </NavLink>
        </>
      )}
    </nav>
  )
}