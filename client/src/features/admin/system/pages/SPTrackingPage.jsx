import { useEffect, useState } from 'react';
import SPTrackingResultsTable from '../components/SPTrackingResultsTable.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { searchSPTracking } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

export default function SPTrackingPage() {
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { showError } = useAlert();

  useEffect(() => {
    if (!search.trim()) {
      setProvider(null);
      setJobs([]);
      setHasSearched(false);
      return undefined;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      searchSPTracking(search.trim())
        .then(({ data }) => {
          setProvider(data.data.provider);
          setJobs(data.data.jobs);
          setHasSearched(true);
        })
        .catch((error) => showError(extractErrorMessage(error)))
        .finally(() => setIsLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, showError]);

  return (
    <div className="container admin-page animate-fade-in-up">
      <div className="admin-page-header">
        <div>
          <h1 className="section-title">SP Tracking</h1>
          <p className="section-subtitle">Look up a Service Provider's completed jobs and invoices.</p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ justifyContent: 'center' }}>
        <input
          className="form-control"
          placeholder="Search by Service Provider name or token"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ maxWidth: '480px' }}
        />
      </div>

      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
        </div>
      ) : hasSearched && !provider ? (
        <p className="empty-state">No Service Provider matches that search.</p>
      ) : provider ? (
        <>
          <div className="admin-page-header">
            <h2 className="section-title" style={{ fontSize: 'var(--font-size-lg)' }}>
              {provider.fullName} <span style={{ color: 'var(--color-text-muted)' }}>({provider.userToken})</span>
            </h2>
          </div>
          <SPTrackingResultsTable jobs={jobs} />
        </>
      ) : null}
    </div>
  );
}
