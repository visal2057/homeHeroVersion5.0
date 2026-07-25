import { useState } from 'react';
import Modal from '../../../components/common/Modal.jsx';

export default function RejectReasonModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  function handleConfirmClick() {
    if (!reason.trim()) {
      setError('Please enter a reason for rejecting this booking.');
      return;
    }
    onConfirm(reason.trim());
  }

  return (
    <Modal isOpen onClose={onClose} title="Reject Booking Request">
      <div style={{ position: 'relative' }}>
        <button type="button" className="rr-modal-close" aria-label="Close" onClick={onClose}>×</button>

        <p className="rr-prompt">Why are you rejecting this booking request?</p>
        <textarea
          rows={4}
          maxLength={500}
          placeholder="Let the client know why you can't take this job..."
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(''); }}
          className="rr-textarea"
        />
        <div className="rr-hint">{reason.length}/500</div>

        {error && <div className="rr-error">{error}</div>}

        <div className="rr-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleConfirmClick}>Confirm</button>
        </div>
      </div>

      <style>{`
        .rr-modal-close {
          position: absolute; top: 14px; right: 14px;
          width: 28px; height: 28px; border-radius: 50%;
          border: none; background: var(--color-neutral-100); color: var(--color-neutral-600);
          font-size: 18px; line-height: 1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background var(--transition-base);
        }
        .rr-modal-close:hover { background: var(--color-neutral-200); }
        .rr-prompt { font-size: var(--font-size-sm); color: var(--color-secondary-700); font-weight: 600; margin-bottom: var(--space-sm); }
        .rr-textarea {
          width: 100%; padding: 12px 14px; border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: inherit;
          outline: none; resize: vertical; transition: border-color var(--transition-base);
          background: white; color: var(--color-text); box-sizing: border-box;
        }
        .rr-textarea:focus { border-color: var(--color-primary-500); }
        .rr-hint { margin-top: 4px; font-size: var(--font-size-xs); color: var(--color-neutral-500); text-align: right; }
        .rr-error { margin-top: var(--space-sm); padding: 10px 14px; background: var(--color-error-bg); color: var(--color-error); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .rr-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; margin-top: var(--space-md); }
      `}</style>
    </Modal>
  );
}
