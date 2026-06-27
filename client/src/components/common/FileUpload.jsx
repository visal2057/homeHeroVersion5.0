import { useState } from 'react';

export default function FileUpload({ label, name, accept, error, hint, onFileSelected }) {
  const [fileName, setFileName] = useState('');

  function handleChange(event) {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : '');
    onFileSelected?.(file ?? null);
  }

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        className={`form-control ${error ? 'has-error' : ''}`}
        onChange={handleChange}
      />
      {fileName && <div className="form-hint">Selected: {fileName}</div>}
      {error && <div className="form-error">{error}</div>}
      {!error && hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}
