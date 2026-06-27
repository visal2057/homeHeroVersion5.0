import Modal from './Modal.jsx';

export default function ConfirmModal({ isOpen, title = 'Are you sure?', message, confirmLabel = 'Yes', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p>{message}</p>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="btn btn-primary" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
