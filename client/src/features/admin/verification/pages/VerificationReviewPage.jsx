import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VerificationDocumentViewer from '../components/VerificationDocumentViewer.jsx';
import ApproveApplicationModal from '../components/ApproveApplicationModal.jsx';
import RejectApplicationModal from '../components/RejectApplicationModal.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { fetchApplicationDetail, approveApplication, rejectApplication } from '../verificationAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { ROUTES } from '../../../../constants/routes.js';

export default function VerificationReviewPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApplicationDetail(applicationId)
      .then(({ data }) => setApplication(data.data.application))
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [applicationId, showError]);

  async function handleApprove() {
    setIsSubmitting(true);
    try {
      await approveApplication(applicationId);
      showSuccess('Application approved.');
      navigate(ROUTES.VERIFICATION_ADMIN_DASHBOARD);
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReject(reason) {
    setIsSubmitting(true);
    try {
      await rejectApplication(applicationId, reason);
      showSuccess('Application rejected.');
      navigate(ROUTES.VERIFICATION_ADMIN_DASHBOARD);
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container admin-page text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="container admin-page animate-fade-in-up">
      <h1 className="section-title">Verification Review</h1>
      <p className="section-subtitle">Application from {application.fullName}</p>

      <div className="card chart-card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3>Applicant Information</h3>
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
            <p><strong>Police Station:</strong> {application.policeStationName}</p>
            <p><strong>Police Report Date:</strong> {new Date(application.policeReportDate).toLocaleDateString()}</p>
          </div>
        </div>
        <p><strong>Bio:</strong> {application.bio}</p>
        <p><strong>Work Hours / Details:</strong> {application.workHoursDetails}</p>
      </div>

      <div className="card chart-card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3>Verification Documents</h3>
        <VerificationDocumentViewer documents={application.documents} />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <button type="button" className="btn btn-primary" onClick={() => setIsApproveOpen(true)}>
          Approve
        </button>
        <button type="button" className="btn" style={{ backgroundColor: '#dc2626', color: '#fff' }} onClick={() => setIsRejectOpen(true)}>
          Reject
        </button>
      </div>

      <ApproveApplicationModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
        fullName={application.fullName}
      />
      <RejectApplicationModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleReject}
        fullName={application.fullName}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
