export default function FormSelect({ label, name, error, options = [], placeholder, ...selectProps }) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
        </label>
      )}
      <select id={name} name={name} className={`form-control ${error ? 'has-error' : ''}`} {...selectProps}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
