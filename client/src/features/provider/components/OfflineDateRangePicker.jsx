import { useState } from 'react';
import AlertMessage from '../../../components/common/AlertMessage.jsx';

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function rangeKeys(startStr, endStr) {
  const keys = [];
  const cursor = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
  while (cursor.getTime() <= end.getTime()) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export default function OfflineDateRangePicker({ onConfirm, onCancel, saving }) {
  const today = toDateKey(new Date());
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [error, setError] = useState('');

  function handleConfirm() {
    if (!start || !end) {
      setError('Please select both a start and end date.');
      return;
    }
    if (end < start) {
      setError('End date cannot be before the start date.');
      return;
    }
    setError('');
    onConfirm(rangeKeys(start, end));
  }

  return (
    <div className="provider-offline-picker">
      <p className="provider-offline-picker-title">Mark yourself unavailable</p>
      <p className="provider-form-hint">
        Choose the date range you'll be offline for. You'll stay visible to clients but cannot be booked on these days.
      </p>

      {error && <AlertMessage type="error" message={error} />}

      <div className="provider-offline-picker-row">
        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="offline-start">Start date</label>
          <input
            id="offline-start"
            type="date"
            className="provider-form-input"
            value={start}
            min={today}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="offline-end">End date</label>
          <input
            id="offline-end"
            type="date"
            className="provider-form-input"
            value={end}
            min={start || today}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>

      <div className="provider-offline-picker-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
          {saving && <span className="btn-spinner" />}
          Confirm &amp; Go Offline
        </button>
      </div>
    </div>
  );
}
