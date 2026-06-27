import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ComplaintDetails from '../components/ComplaintDetails.jsx';
import ComplaintVerdictForm from '../components/ComplaintVerdictForm.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { fetchComplaintDetail, submitComplaintVerdict } from '../verificationAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import { ROUTES } from '../../../../constants/routes.js';

export default function ComplaintReviewPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaintDetail(complaintId)
      .then(({ data }) => setComplaint(data.data.complaint))
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [complaintId, showError]);

  async function handleSubmitVerdict(payload) {
    setIsSubmitting(true);
    try {
      await submitComplaintVerdict(complaintId, payload);
      showSuccess('Verdict submitted.');
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

  if (!complaint) return null;

  return (
    <div className="container admin-page animate-fade-in-up">
      <h1 className="section-title">Complaint Review</h1>
      <ComplaintDetails complaint={complaint} />

      {complaint.verdict ? (
        <div className="card chart-card">
          <h3>Verdict Already Recorded</h3>
          <p>{complaint.verdict.verdictText}</p>
        </div>
      ) : (
        <ComplaintVerdictForm complaint={complaint} onSubmit={handleSubmitVerdict} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
