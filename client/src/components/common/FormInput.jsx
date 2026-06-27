export default function FormInput({ label, name, error, hint, ...inputProps }) {
  // Once the user has typed something and there is no error, show a
  // green border so they get quick positive feedback without having to
  // wait until the whole form is submitted.
  const hasSuccess = !error && Boolean(inputProps.value);
  const stateClass = error ? 'has-error' : hasSuccess ? 'has-success' : '';

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
        </label>
      )}
      <input id={name} name={name} className={`form-control ${stateClass}`} {...inputProps} />
      {error && <div className="form-error">{error}</div>}
      {!error && hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}
