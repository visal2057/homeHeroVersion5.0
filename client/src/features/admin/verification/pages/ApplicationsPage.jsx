import { useEffect, useState } from 'react';
import ApplicationsHistoryTable from '../components/ApplicationsHistoryTable.jsx';
import ApplicationDetailModal from '../components/ApplicationDetailModal.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { fetchApplicationHistory } from '../verificationAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

const TABS = [
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ApplicationsPage() {
  const [history, setHistory] = useState({ approved: [], rejected: [] });
  const [activeTab, setActiveTab] = useState('approved');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const { showError } = useAlert();

  useEffect(() => {
    fetchApplicationHistory()
      .then(({ data }) => setHistory({ approved: data.data.approved, rejected: data.data.rejected }))
      .catch((error) => showError(extractErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [showError]);

  const activeList = history[activeTab];

  return (
    <div className="container admin-page animate-fade-in-up">
      <div className="admin-page-header">
        <div>
          <h1 className="section-title">Applications</h1>
          <p className="section-subtitle">A record of every Service Provider application you've approved or rejected.</p>
        </div>
      </div>

      <div className="announcement-status-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`announcement-status-tab${activeTab === tab.value ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label} ({history[tab.value].length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <ApplicationsHistoryTable
          applications={activeList}
          emptyMessage={`No ${activeTab} applications yet.`}
          onSelect={(application) => setSelectedApplicationId(application.applicationId)}
          showAttempt={activeTab === 'approved'}
        />
      )}

      {selectedApplicationId && (
        <ApplicationDetailModal applicationId={selectedApplicationId} onClose={() => setSelectedApplicationId(null)} />
      )}
    </div>
  );
}
