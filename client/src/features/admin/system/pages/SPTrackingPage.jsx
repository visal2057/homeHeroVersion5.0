import { useCallback, useEffect, useRef, useState } from 'react';
import SPTrackingResultsTable from '../components/SPTrackingResultsTable.jsx';
import SPTrackingStats from '../components/SPTrackingStats.jsx';
import MvpProvidersSection from '../components/MvpProvidersSection.jsx';
import LoadingSpinner from '../../../../components/common/LoadingSpinner.jsx';
import { IconSearch } from '../../../../components/common/icons.jsx';
import { searchSPTracking, fetchMvpProviders } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

const MVP_POLL_INTERVAL_MS = 20000;

export default function SPTrackingPage() {
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [mvpProviders, setMvpProviders] = useState([]);
  const [isMvpLoading, setIsMvpLoading] = useState(true);
  const mvpPollRef = useRef(null);

  const { showError } = useAlert();

  const isSearching = Boolean(search.trim());

  const loadMvpProviders = useCallback(async () => {
    try {
      const { data } = await fetchMvpProviders();
      setMvpProviders(data.data.providers);
    } catch {
      // Non-critical: the leaderboard just keeps showing its last-known state.
    } finally {
      setIsMvpLoading(false);
    }
  }, []);

  // The MVP leaderboard keeps polling in the background even while the admin
  // is viewing a searched provider, so it's already fresh the moment the
  // search box is cleared.
  useEffect(() => {
    loadMvpProviders();
    mvpPollRef.current = setInterval(loadMvpProviders, MVP_POLL_INTERVAL_MS);
    return () => clearInterval(mvpPollRef.current);
  }, [loadMvpProviders]);

  useEffect(() => {
    if (!search.trim()) {
      setProvider(null);
      setJobs([]);
      setStats(null);
      setHasSearched(false);
      return undefined;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      searchSPTracking(search.trim())
        .then(({ data }) => {
          setProvider(data.data.provider);
          setJobs(data.data.jobs);
          setStats(data.data.stats);
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

      <div className="sp-search-wrap">
        <IconSearch size={19} className="sp-search-icon" />
        <input
          className="sp-search-input"
          placeholder="Search by Service Provider name or token"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {isSearching ? (
        isLoading ? (
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
            <SPTrackingStats stats={stats} />
            <div className="card chart-card">
              <h3>Completed Jobs</h3>
              <SPTrackingResultsTable jobs={jobs} />
            </div>
          </>
        ) : null
      ) : (
        <MvpProvidersSection providers={mvpProviders} isLoading={isMvpLoading} />
      )}
    </div>
  );
}
