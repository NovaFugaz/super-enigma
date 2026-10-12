import { Link } from 'react-router-dom'
import FormField from '../../components/common/FormField.jsx'
import PasswordField from '../../components/common/PasswordField.jsx'

export default function RegisterPage() {
  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <p className="section-kicker">Únete</p>
        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-subtitle">
          Regístrate para guardar tus datos y seguir tus pedidos.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Nombre"
            id="name"
            placeholder="Tu nombre completo"
            autoComplete="name"/>

          <FormField
            label="Teléfono"
            id="phone"
            type="tel"
            placeholder="+56 9 1234 5678"
            autoComplete="tel"/>

          <FormField
            label="Correo electrónico"
            id="email"
            type="email"
            placeholder="tucorreo@ejemplo.cl"
            autoComplete="email"/>

          <PasswordField
            id="password"
            autoComplete="new-password"
            hint="Mínimo 8 caracteres."/>

          <button type="submit" className="btn-primary btn-block">
            Crear cuenta
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-inline-link">Inicia sesión</Link>
        </p>
      </div>
    </section>
  )
}