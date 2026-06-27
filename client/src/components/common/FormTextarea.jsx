export default function FormTextarea({ label, name, error, hint, ...textareaProps }) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
        </label>
      )}
      <textarea id={name} name={name} className={`form-control ${error ? 'has-error' : ''}`} {...textareaProps} />
      {error && <div className="form-error">{error}</div>}
      {!error && hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}
