import { useEffect, useState } from 'react';
import Modal from '../../../../components/common/Modal.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import VerificationDocumentViewer from './VerificationDocumentViewer.jsx';
import { fetchApplicationDetail } from '../verificationAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

const STATUS_VARIANT = { APPROVED: 'is-success', REJECTED: 'is-error' };

export default function ApplicationDetailModal({ applicationId, onClose }) {
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useAlert();

  useEffect(() => {
    if (!applicationId) return;
    setIsLoading(true);
    setApplication(null);
    fetchApplicationDetail(applicationId)
      .then(({ data }) => setApplication(data.data.application))
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [applicationId, showError]);

  return (
    <Modal isOpen={Boolean(applicationId)} onClose={onClose} maxWidth={720}>
      {isLoading || !application ? (
        <div className="text-center" style={{ padding: 'var(--space-xl) 0' }}>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <h3>
            {application.fullName}{' '}
            <span className={`status-badge ${STATUS_VARIANT[application.verificationStatus] ?? 'is-neutral'}`}>
              {application.verificationStatus}
            </span>
          </h3>

          <div className="dashboard-grid" style={{ marginBottom: 0 }}>
            <div>
              <p><strong>Username:</strong> {application.username}</p>
              <p><strong>Token:</strong> {application.userToken}</p>
              <p><strong>Email:</strong> {application.email}</p>
              <p><strong>Phone:</strong> {application.phone}</p>
              <p><strong>Categories:</strong> {application.categories.join(', ')}</p>
            </div>
            <div>
              <p><strong>Home District:</strong> {application.homeDistrictName}</p>
              <p><strong>Service District:</strong> {application.serviceDistrictName}</p>
              <p><strong>Hourly Charge Estimate:</strong> LKR {application.hourlyChargeEstimate}</p>
              <p><strong>Applied:</strong> {application.submittedAt ? new Date(application.submittedAt).toLocaleString() : '—'}</p>
              <p><strong>Reviewed:</strong> {application.reviewedAt ? new Date(application.reviewedAt).toLocaleString() : '—'}</p>
            </div>
          </div>

          <p><strong>Bio:</strong> {application.bio}</p>
          <p><strong>Work Hours / Details:</strong> {application.workHoursDetails}</p>

          {application.verificationStatus === 'REJECTED' && application.rejectionReason && (
            <p><strong>Rejection Reason:</strong> {application.rejectionReason}</p>
          )}

          <h3 style={{ marginTop: 'var(--space-lg)' }}>Verification Documents</h3>
          <VerificationDocumentViewer documents={application.documents} />

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
