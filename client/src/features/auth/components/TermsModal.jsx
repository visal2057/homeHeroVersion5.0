import Modal from '../../../components/common/Modal.jsx';

export default function TermsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="HomeHero Service Provider Terms & Conditions">
      <div style={{ maxHeight: 360, overflowY: 'auto', fontSize: 'var(--font-size-sm)' }}>
        <p>By registering as a Service Provider on HomeHero, you agree to the following:</p>
        <ul>
          <li>You will provide accurate personal, service and identity information.</li>
          <li>Your verification documents will be reviewed by an authorized Verification Admin and kept private.</li>
          <li>You must maintain an active membership to go online and receive booking requests.</li>
          <li>You will respond to booking requests honestly and complete accepted jobs professionally.</li>
          <li>HomeHero may suspend or ban accounts found in violation of platform policies.</li>
          <li>A 5% platform fee applies to card payments collected from clients on your behalf.</li>
        </ul>
      </div>
      <button type="button" className="btn btn-primary btn-block" onClick={onClose} style={{ marginTop: 'var(--space-md)' }}>
        Close
      </button>
    </Modal>
  );
}
