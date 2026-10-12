import { Link, useLocation } from 'react-router-dom'
import FormField from '../../components/common/FormField.jsx'
import PasswordField from '../../components/common/PasswordField.jsx'

export default function LoginPage() {
  const notice = useLocation().state?.message

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <p className="section-kicker">Mi cuenta</p>
        <h1 className="auth-title">Inicia sesión</h1>
        <p className="auth-subtitle">
          Ingresa con tu correo para ver tus pedidos y comprar más rápido.
        </p>

        {notice && (
          <p className="auth-notice" role="alert">
            {notice}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Correo electrónico"
            id="email"
            type="email"
            placeholder="tucorreo@ejemplo.cl"
            autoComplete="email" />

          <PasswordField id="password" autoComplete="current-password" />

          <div className="auth-row">
            <label className="auth-check">
              <input type="checkbox" name="remember" />
              Recordarme
            </label>
            <Link to="/recuperar" className="auth-inline-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="btn-primary btn-block">Iniciar sesión</button>
        </form>

        <p className="auth-switch">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="auth-inline-link">Regístrate</Link>
        </p>
      </div>
    </section>
  )
}