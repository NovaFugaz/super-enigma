import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

const ROLE_LABELS = {
  customer: 'cliente',
  seller: 'vendedor',
  admin: 'administrador',
}

export default function AccessDeniedPage() {
  const { user } = useAuth()

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <p className="section-kicker">Acceso restringido</p>
        <h1 className="auth-title">403 · Sin permisos</h1>
        <p className="auth-subtitle">
          {user
            ? `Tu sesión corresponde a un perfil de ${ROLE_LABELS[user.role] ?? 'usuario'}, sin acceso a esta sección.`
            : 'Inicia sesión con una cuenta autorizada para entrar a esta sección.'}
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Volver al inicio</Link>
      </div>
    </section>
  )
}