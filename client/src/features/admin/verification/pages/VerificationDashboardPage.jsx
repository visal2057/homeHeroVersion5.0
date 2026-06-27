import { useEffect, useState } from 'react';
import PendingVerificationCard from '../components/PendingVerificationCard.jsx';
import ComplaintCard from '../components/ComplaintCard.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { fetchPendingApplications, fetchComplaints } from '../verificationAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

export default function VerificationDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useAlert();

  useEffect(() => {
    Promise.all([fetchPendingApplications(), fetchComplaints()])
      .then(([appsRes, complaintsRes]) => {
        setApplications(appsRes.data.data.applications);
        setComplaints(complaintsRes.data.data.complaints);
      })
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [showError]);

  if (isLoading) {
    return (
      <div className="container admin-page text-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container admin-page animate-fade-in-up">
      <div className="admin-page-header">
        <div>
          <h1 className="section-title">Verification Admin Dashboard</h1>
          <p className="section-subtitle">Review Service Provider applications and investigate complaints.</p>
        </div>
      </div>

      <div className="review-columns">
        <div>
          <h3>Pending Verifications ({applications.length})</h3>
          {applications.length === 0 ? (
            <p className="empty-state">No applications waiting for review.</p>
          ) : (
            applications.map((application) => <PendingVerificationCard key={application.applicationId} application={application} />)
          )}
        </div>

        <div>
          <h3>Complaints ({complaints.length})</h3>
          {complaints.length === 0 ? (
            <p className="empty-state">No complaints submitted.</p>
          ) : (
            complaints.map((complaint) => <ComplaintCard key={complaint.complaintId} complaint={complaint} />)
          )}
        </div>
      </div>
    </div>
  );
}
