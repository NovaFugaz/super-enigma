import { Link } from 'react-router-dom'
import FormField from '../../components/common/FormField.jsx'

export default function ForgotPasswordPage() {
  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <p className="section-kicker">Mi cuenta</p>
        <h1 className="auth-title">Recupera tu contraseña</h1>
        <p className="auth-subtitle">
            Ingresa el correo con el que te registraste y te enviaremos un enlacepara crear una nueva contraseña.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Correo electrónico"
            id="email"
            type="email"
            placeholder="tucorreo@ejemplo.cl"
            autoComplete="email"/>

          <button type="submit" className="btn-primary btn-block">
            Enviar enlace
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya la recordaste?{' '}
          <Link to="/login" className="auth-inline-link">Volver a iniciar sesión</Link>
        </p>
      </div>
    </section>
  )
}