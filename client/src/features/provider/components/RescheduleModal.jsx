import { useState } from 'react';
import Modal from '../../../components/common/Modal.jsx';

// Same hour/minute constants and 12h->24h conversion as the client's
// BookingForm.jsx time picker, so this looks and behaves identically.
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '15', '30', '45'];

function buildDateTime(date, hour, minute, ampm) {
  let h = parseInt(hour, 10);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return new Date(`${date}T${String(h).padStart(2, '0')}:${minute}:00`).toISOString();
}

export default function RescheduleModal({ onClose, onConfirm }) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState('9');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmpm, setStartAmpm] = useState('AM');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [endAmpm, setEndAmpm] = useState('AM');
  const [error, setError] = useState('');

  function handleConfirmClick() {
    setError('');
    if (!date) {
      setError('Please select a date.');
      return;
    }
    const startAt = buildDateTime(date, startHour, startMinute, startAmpm);
    const endAt = buildDateTime(date, endHour, endMinute, endAmpm);
    if (new Date(startAt).getTime() <= Date.now()) {
      setError('The selected date and time must be in the future.');
      return;
    }
    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      setError('End time must be after the start time.');
      return;
    }
    onConfirm({ scheduledAt: startAt, scheduledEndAt: endAt });
  }

  return (
    <Modal isOpen onClose={onClose} title="Propose a Reschedule">
      <div style={{ position: 'relative' }}>
      <button type="button" className="rs-modal-close" aria-label="Close" onClick={onClose}>×</button>

      <div className="rs-field">
        <label className="rs-label">Date</label>
        <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="rs-input" />
      </div>

      <div className="rs-field">
        <label className="rs-label">Start Time</label>
        <div className="rs-time-row">
          <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="rs-input rs-select">
            {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} className="rs-input rs-select">
            {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={startAmpm} onChange={(e) => setStartAmpm(e.target.value)} className="rs-input rs-select rs-select-ampm">
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      <div className="rs-field">
        <label className="rs-label">End Time</label>
        <div className="rs-time-row">
          <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="rs-input rs-select">
            {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)} className="rs-input rs-select">
            {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={endAmpm} onChange={(e) => setEndAmpm(e.target.value)} className="rs-input rs-select rs-select-ampm">
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      <p className="rs-confirm-msg">
        You hereby confirm that you're ready to complete this task for the client at this requested date and time.
      </p>

      {error && <div className="rs-error">{error}</div>}

      <div className="rs-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={handleConfirmClick}>Confirm</button>
      </div>
      </div>

      <style>{`
        .rs-modal-close {
          position: absolute; top: 14px; right: 14px;
          width: 28px; height: 28px; border-radius: 50%;
          border: none; background: var(--color-neutral-100); color: var(--color-neutral-600);
          font-size: 18px; line-height: 1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background var(--transition-base);
        }
        .rs-modal-close:hover { background: var(--color-neutral-200); }
        .rs-field { margin-bottom: var(--space-md); }
        .rs-label { display: block; font-weight: 600; color: var(--color-secondary-700); margin-bottom: 6px; font-size: var(--font-size-sm); }
        .rs-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: inherit;
          outline: none; transition: border-color var(--transition-base);
          background: white; color: var(--color-text); box-sizing: border-box;
        }
        .rs-input:focus { border-color: var(--color-primary-500); }
        .rs-time-row { display: flex; gap: 10px; }
        .rs-select { flex: 1; padding-left: 12px; padding-right: 12px; cursor: pointer; }
        .rs-select-ampm { flex: 0 0 84px; font-weight: 600; }
        .rs-confirm-msg {
          font-size: var(--font-size-sm); color: var(--color-neutral-600); line-height: 1.5;
          background: var(--color-primary-50); border-radius: var(--radius-md);
          padding: 12px 14px; margin: var(--space-md) 0;
        }
        .rs-error { margin-bottom: var(--space-md); padding: 10px 14px; background: var(--color-error-bg); color: var(--color-error); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .rs-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; }
      `}</style>
    </Modal>
  );
}
