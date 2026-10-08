import { useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "./Navbar.jsx"

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const NoteIcon = () => (
  <svg {...iconProps}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)
const SearchIcon = () => (
  <svg {...iconProps} width={16} height={16}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)
const CartIcon = () => (
  <svg {...iconProps} width={20} height={20}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
)
const MenuIcon = ({ open }) => (
  <svg {...iconProps}>
    {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
  </svg>
)

export default function Header() {
  const [open, setOpen] = useState(false)
  const closeMenu = () => setOpen(false)

  return (
    <header className="site-header">
      <div className="page-container header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark">
            <NoteIcon />
          </span>
          <span>
            <span className="brand-name">Sonido Vivo</span>
            <span className="brand-tagline">Viña del Mar • Luthier &amp; Audio</span>
          </span>
        </Link>

        <label className="search-box">
          <SearchIcon />
          <input type="search" placeholder="Buscar" aria-label="Buscar productos" />
        </label>

        {/* Escritorio*/}
        <Navbar />

        <div className="header-actions">
          <Link to="/login" className="auth-link">
            Iniciar sesión
          </Link>
          <Link to="/registro" className="auth-register">
            Registrarse
          </Link>
          <Link to="/carrito" className="btn-cart" aria-label="Ver carrito">
            <CartIcon />
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {/* Para movil */}
      {open && <Navbar mobile onNavigate={closeMenu} />}
    </header>
  )
}