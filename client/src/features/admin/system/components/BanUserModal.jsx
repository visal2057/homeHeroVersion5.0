import { useEffect, useState } from 'react';
import Modal from '../../../../components/common/Modal.jsx';

// Converts a requestedEndsAt ISO timestamp (from a Verification Admin's
// recommendation) into the value a <input type="datetime-local"> expects.
function toDatetimeLocalValue(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BanUserModal({ isOpen, onClose, onSubmit, targetName, isSubmitting, recommendation }) {
  const [banType, setBanType] = useState('TEMPORARY');
  const [endsAt, setEndsAt] = useState('');
  const [reason, setReason] = useState('');

  // Pre-fill from the Verification Admin's recommended ban type/duration/reason
  // (when opened from a Ban Request card) so the System Admin reviews-then-adjusts
  // instead of re-entering everything from scratch.
  useEffect(() => {
    if (!isOpen) return;
    setBanType(recommendation?.banType ?? 'TEMPORARY');
    setEndsAt(toDatetimeLocalValue(recommendation?.requestedEndsAt));
    setReason(recommendation?.reason ?? '');
  }, [isOpen, recommendation]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ banType, endsAt: banType === 'TEMPORARY' ? endsAt : null, reason });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ban ${targetName ?? 'user'}`}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Ban type</label>
          <select className="form-control" value={banType} onChange={(event) => setBanType(event.target.value)}>
            <option value="TEMPORARY">Temporary</option>
            <option value="PERMANENT">Permanent</option>
          </select>
        </div>

        {banType === 'TEMPORARY' && (
          <div className="form-group">
            <label className="form-label">Ban ends at</label>
            <input
              type="datetime-local"
              className="form-control"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Reason</label>
          <textarea className="form-control" value={reason} onChange={(event) => setReason(event.target.value)} required />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
            Apply Ban
          </button>
        </div>
      </form>
    </Modal>
  );
}
