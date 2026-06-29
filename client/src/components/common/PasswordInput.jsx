import { useState } from 'react';
import { IconEye, IconEyeOff } from './icons.jsx';

export default function PasswordInput({ label, name, error, hint, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  // Same idea as FormInput: a green border once there is a value and no
  // error, so the user sees positive feedback while typing.
  const hasSuccess = !error && Boolean(inputProps.value);
  const stateClass = error ? 'has-error' : hasSuccess ? 'has-success' : '';

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="password-input-wrapper">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          className={`form-control ${stateClass}`}
          {...inputProps}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </div>
      {error && <div className="form-error">{error}</div>}
      {!error && hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}
