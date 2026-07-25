import { useEffect, useState } from 'react';
import Modal from '../../../../components/common/Modal.jsx';
import ConfirmModal from '../../../../components/common/ConfirmModal.jsx';

export default function RejectApplicationModal({ isOpen, onClose, onConfirm, fullName, isSubmitting }) {
  const [reason, setReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setIsConfirming(false);
    }
  }, [isOpen]);

  function handleSubmit(event) {
    event.preventDefault();
    setIsConfirming(true);
  }

  function handleConfirmedReject() {
    onConfirm(reason);
  }

  if (isConfirming) {
    return (
      <ConfirmModal
        isOpen={isOpen}
        title="Confirm rejection"
        message={`Reject ${fullName}'s application with this reason? "${reason}" They will be notified by email and cannot be reconsidered without reapplying.`}
        confirmLabel={isSubmitting ? 'Rejecting…' : 'Reject Application'}
        onConfirm={handleConfirmedReject}
        onCancel={() => setIsConfirming(false)}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reject ${fullName}'s application`}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Rejection reason</label>
          <textarea className="form-control" value={reason} onChange={(event) => setReason(event.target.value)} required />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" style={{ backgroundColor: '#dc2626', color: '#fff' }} disabled={isSubmitting}>
            {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
            Reject Application
          </button>
        </div>
      </form>
    </Modal>
  );
}
