import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import FormField from '../../components/common/FormField.jsx'
import PasswordField from '../../components/common/PasswordField.jsx'
import { confirmPasswordReset, requestPasswordReset } from '../../services/passwordResetApi.js'

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const handleRequest = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await requestPasswordReset(email.trim())
      setRequestSent(true)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleConfirm = async (event) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    try {
      await confirmPasswordReset(token, password)
      setComplete(true)
    } catch (resetError) {
      setError(resetError.message)
    }
  }

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <p className="section-kicker">Mi cuenta</p>
        <h1 className="auth-title">Recupera tu contraseña</h1>
        <p className="auth-subtitle">Te enviaremos un enlace de un solo uso para restablecerla.</p>

        {complete ? (
          <div className="auth-form" role="status" aria-live="polite">
            <p className="form-hint">Tu contraseña se actualizó. Ya puedes iniciar sesión.</p>
            <Link to="/login" className="btn-primary btn-block text-center">Volver a iniciar sesión</Link>
          </div>
        ) : token ? (
          <form className="auth-form" onSubmit={handleConfirm} noValidate>
            <PasswordField
              id="new-password"
              label="Nueva contraseña"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hint="Usa entre 8 y 72 caracteres."
              minLength={8}
              required/>
            <PasswordField
              id="confirm-password"
              label="Confirmar contraseña"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required/>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="btn-primary btn-block">Guardar contraseña</button>
          </form>
        ) : requestSent ? (
          <div className="auth-form" role="status" aria-live="polite">
            <p className="form-hint">
              Si la cuenta existe y está activa, recibirás un enlace válido por 15 minutos. Si no aparece,
              verifica que Docker esté ejecutando Mailpit y vuelve a intentarlo. Revisa la bandeja en{' '}
              <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="auth-inline-link">
                Mailpit
              </a>.
            </p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleRequest} noValidate>
            <FormField
              label="Correo electrónico"
              id="email"
              type="email"
              placeholder="tucorreo@ejemplo.cl"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required/>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="btn-primary btn-block">Enviar enlace de recuperación</button>
          </form>
        )}

        <p className="auth-switch">
          ¿Ya la recordaste?{' '}
          <Link to="/login" className="auth-inline-link">Volver a iniciar sesión</Link>
        </p>
      </div>
    </section>
  )
}