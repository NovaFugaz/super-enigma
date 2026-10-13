import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import FormField from '../../components/common/FormField.jsx'
import PasswordField from '../../components/common/PasswordField.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { authenticateAccount } from '../../services/mockAuth.js'

const ROLE_HOME = {
  customer: '/pedidos',
  seller: '/vendedor',
  admin: '/administracion',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const notice = location.state?.notice
  const [values, setValues] = useState({ email: location.state?.email ?? '', password: '' })
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.'
    }
    if (!values.password) nextErrors.password = 'Ingresa tu contraseña.'
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    const profile = await authenticateAccount(values.email, values.password)
    if (!profile) {
      setFormError('El correo o la contraseña no coinciden con una cuenta registrada.')
      return
    }

    login(profile, remember)
    const destination = location.state?.from?.pathname ?? ROLE_HOME[profile.role] ?? '/'
    navigate(destination, { replace: true })
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
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            error={errors.email}
            required/>

          <PasswordField
            id="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            error={errors.password}
            required/>

          <div className="auth-row">
            <label className="auth-check">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Recordarme
            </label>
            <Link to="/recuperar" className="auth-inline-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <button type="submit" className="btn-primary btn-block">
            Iniciar sesión
          </button>
        </form>

        <p className="auth-switch">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="auth-inline-link">Regístrate</Link>
        </p>
      </div>
    </section>
  )
}