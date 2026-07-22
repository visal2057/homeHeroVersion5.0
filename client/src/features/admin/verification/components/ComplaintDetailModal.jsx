import { useEffect, useState } from 'react';
import Modal from '../../../../components/common/Modal.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import ComplaintDetails from './ComplaintDetails.jsx';
import { fetchComplaintDetail } from '../verificationAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

export default function ComplaintDetailModal({ complaintId, onClose }) {
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useAlert();

  useEffect(() => {
    if (!complaintId) return;
    setIsLoading(true);
    setComplaint(null);
    fetchComplaintDetail(complaintId)
      .then(({ data }) => setComplaint(data.data.complaint))
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [complaintId, showError]);

  return (
    <Modal isOpen={Boolean(complaintId)} onClose={onClose} maxWidth={680}>
      {isLoading || !complaint ? (
        <div className="text-center" style={{ padding: 'var(--space-xl) 0' }}>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <ComplaintDetails complaint={complaint} />

          {complaint.verdict && (
            <div className="card chart-card" style={{ marginBottom: 0 }}>
              <h3>Verdict</h3>
              {complaint.verdict.investigationNotes && (
                <p><strong>Investigation Notes:</strong> {complaint.verdict.investigationNotes}</p>
              )}
              <p><strong>Resolution:</strong> {complaint.verdict.verdictText}</p>
              <p><strong>Recorded:</strong> {new Date(complaint.verdict.submittedAt).toLocaleString()}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
