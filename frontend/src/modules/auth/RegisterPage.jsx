import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import FormField from '../../components/common/FormField.jsx'
import PasswordField from '../../components/common/PasswordField.jsx'
import { registerAccount } from '../../services/mockAuth.js'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (values.name.trim().length < 2) nextErrors.name = 'Ingresa tu nombre completo.'
    if (values.phone.replace(/\D/g, '').length < 8) nextErrors.phone = 'Ingresa un teléfono válido.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.'
    }
    if (values.password.length < 8) nextErrors.password = 'Usa al menos 8 caracteres.'
    if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    const result = await registerAccount(values)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setRegisteredEmail(result.profile.email)
  }

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <p className="section-kicker">Únete</p>
        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-subtitle">
          Regístrate para guardar tus datos y seguir tus pedidos.
        </p>

        {registeredEmail ? (
          <div className="auth-form" role="status" aria-live="polite">
            <p className="form-hint">Cuenta creada para {registeredEmail}.</p>
            <button
              type="button"
              className="btn-primary btn-block"
              onClick={() => navigate('/login', { state: { email: registeredEmail } })}
            >
              Continuar al inicio de sesión
            </button>
          </div>
        ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Nombre"
            id="name"
            placeholder="Tu nombre completo"
            autoComplete="name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            error={errors.name}
            required/>

          <FormField
            label="Teléfono"
            id="phone"
            type="tel"
            placeholder="+56 9 1234 5678"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
            error={errors.phone}
            required/>

          <FormField
            label="Correo electrónico"
            id="email"
            type="email"
            placeholder="tucorreo@ejemplo.cl"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            error={errors.email}
            required/>

          <PasswordField
            id="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            error={errors.password}
            hint="Mínimo 8 caracteres."
            minLength={8}
            required/>

          <PasswordField
            id="confirm-password"
            label="Confirmar contraseña"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(event) => setValues((current) => ({ ...current, confirmPassword: event.target.value }))}
            error={errors.confirmPassword}
            required/>

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <button type="submit" className="btn-primary btn-block">
            Crear cuenta
          </button>
        </form>
        )}

        <p className="auth-switch">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-inline-link">Inicia sesión</Link>
        </p>
      </div>
    </section>
  )
}