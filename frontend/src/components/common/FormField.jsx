export default function FormField({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  error,
  hint,
  value,
  onChange,
  required = false,
  minLength,
}) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">{label}</label>
      <input
        id={id}
        name={name ?? id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={descriptionId}
        className="form-input"/>
      {hint && !error && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="form-error">{error}</p>
      )}
    </div>
  )
}