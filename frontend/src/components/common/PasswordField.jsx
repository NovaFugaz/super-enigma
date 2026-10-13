import { useState } from 'react'

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

const EyeIcon = () => (
  <svg {...iconProps}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg {...iconProps}>
    <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.9 4M6.6 6.6C3.7 8.4 2 12 2 12s3.5 8 10 8a10 10 0 0 0 5.4-1.6" />
    <path d="m2 2 20 20M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
)

export default function PasswordField({
  label = 'Contraseña',
  id = 'password',
  name,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  error,
  hint,
  value,
  onChange,
  required = false,
  minLength,
}) {
  const [visible, setVisible] = useState(false)
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="password-wrapper">
        <input
          id={id}
          name={name ?? id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={descriptionId}
          className="form-input pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="password-toggle"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint && !error && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="form-error">
          {error}
        </p>
      )}
    </div>
  )
}