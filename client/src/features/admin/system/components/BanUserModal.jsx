import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { banPopoverPosition } from '../banPopoverPosition.js';

// Converts a requestedEndsAt ISO timestamp (from a Verification Admin's
// recommendation) into the value a <input type="datetime-local"> expects.
function toDatetimeLocalValue(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Anchored next to whichever Ban button opened it (table row or ban-request
// card), instead of the generic full-page centered Modal, so the admin never
// has to scroll away from what they were just looking at to fill this in.
export default function BanUserModal({ isOpen, onClose, onSubmit, targetName, isSubmitting, recommendation, anchorRect }) {
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

  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !anchorRect) return null;

  const position = banPopoverPosition(anchorRect);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ banType, endsAt: banType === 'TEMPORARY' ? endsAt : null, reason });
  }

  return createPortal(
    <>
      {/* Transparent click-catcher: closes the popover on an outside click
          without dimming or blurring the table behind it. */}
      <div className="ban-popover-catcher" onClick={onClose} />
      <div
        className="ban-popover animate-fade-in"
        style={{ top: position.top, left: position.left }}
        onClick={(event) => event.stopPropagation()}
      >
        <h4 className="ban-popover-title">Ban {targetName ?? 'user'}</h4>
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
            <textarea
              className="form-control"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              required
            />
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
      </div>
    </>,
    document.body,
  );
}
