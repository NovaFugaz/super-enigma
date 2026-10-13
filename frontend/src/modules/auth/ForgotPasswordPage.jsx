import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import FormField from '../../components/common/FormField.jsx'
import PasswordField from '../../components/common/PasswordField.jsx'
import { accountExists, resetAccountPassword } from '../../services/mockAuth.js'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [formError, setFormError] = useState('')
  const [complete, setComplete] = useState(false)

  const handleFindAccount = (event) => {
    event.preventDefault()
    setEmailError('')
    setFormError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Ingresa un correo electrónico válido.')
      return
    }
    if (!accountExists(email)) {
      setEmailError('No encontramos una cuenta con ese correo.')
      return
    }
    setRecoveryEmail(email.trim().toLowerCase())
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    const nextPasswordError = password.length < 8 ? 'Usa al menos 8 caracteres.' : ''
    const nextConfirmError = confirmPassword !== password ? 'Las contraseñas no coinciden.' : ''
    setPasswordError(nextPasswordError)
    setConfirmError(nextConfirmError)
    setFormError('')
    if (nextPasswordError || nextConfirmError) return

    if (!(await resetAccountPassword(recoveryEmail, password))) {
      setFormError('No se pudo actualizar la contraseña en este navegador.')
      return
    }
    setComplete(true)
  }

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <p className="section-kicker">Mi cuenta</p>
        <h1 className="auth-title">Recupera tu contraseña</h1>
        <p className="auth-subtitle">Recupera el acceso a tu cuenta.</p>

        {complete ? (
          <div className="auth-form" role="status" aria-live="polite">
            <p className="form-hint">La contraseña de {recoveryEmail} se actualizó.</p>
            <button
              type="button"
              className="btn-primary btn-block"
              onClick={() => navigate('/login', { state: { email: recoveryEmail } })}
            >
              Volver a iniciar sesión
            </button>
          </div>
        ) : recoveryEmail ? (
          <form className="auth-form" onSubmit={handleResetPassword} noValidate>
            <p className="form-hint">Cuenta encontrada: {recoveryEmail}</p>
            <PasswordField
              id="new-password"
              label="Nueva contraseña"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={passwordError}
              hint="Mínimo 8 caracteres."
              minLength={8}
              required/>
            <PasswordField
              id="confirm-password"
              label="Confirmar contraseña"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={confirmError}
              required/>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button type="submit" className="btn-primary btn-block">Guardar contraseña</button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleFindAccount} noValidate>
            <FormField
              label="Correo electrónico"
              id="email"
              type="email"
              placeholder="tucorreo@ejemplo.cl"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={emailError}
              required/>
            <button type="submit" className="btn-primary btn-block">Continuar</button>
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