export default function FormField({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  error,
  hint,
}) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">{label}</label>
      <input
        id={id}
        name={name ?? id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="form-input"/>
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="form-error">{error}</p>
      )}
    </div>
  )
}