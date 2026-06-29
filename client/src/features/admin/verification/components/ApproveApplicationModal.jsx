import ConfirmModal from '../../../../components/common/ConfirmModal.jsx';

export default function ApproveApplicationModal({ isOpen, onClose, onConfirm, fullName }) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Approve application"
      message={`Approve ${fullName}'s Service Provider application? They will be notified by email and can then purchase a membership.`}
      confirmLabel="Approve"
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}
