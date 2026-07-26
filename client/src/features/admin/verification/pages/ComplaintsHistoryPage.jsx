import { useEffect, useState } from 'react';
import ComplaintsHistoryTable from '../components/ComplaintsHistoryTable.jsx';
import ComplaintDetailModal from '../components/ComplaintDetailModal.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { fetchComplaintsHistory } from '../verificationAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

export default function ComplaintsHistoryPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const { showError } = useAlert();

  useEffect(() => {
    fetchComplaintsHistory()
      .then(({ data }) => setComplaints(data.data.complaints))
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [showError]);

  return (
    <div className="container admin-page animate-fade-in-up">
      <div className="admin-page-header">
        <div>
          <h1 className="section-title">Complaints</h1>
          <p className="section-subtitle">A record of every complaint you've resolved, for later reference.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <ComplaintsHistoryTable complaints={complaints} onSelect={(complaint) => setSelectedComplaintId(complaint.complaintId)} />
      )}

      {selectedComplaintId && (
        <ComplaintDetailModal complaintId={selectedComplaintId} onClose={() => setSelectedComplaintId(null)} />
      )}
    </div>
  );
}
