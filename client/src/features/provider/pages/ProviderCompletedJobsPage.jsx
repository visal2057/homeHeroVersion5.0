import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import CompletedJobsTable from '../components/CompletedJobsTable.jsx';
import ProviderReviews   from '../components/ProviderReviews.jsx';

export default function ProviderCompletedJobsPage() {
  const [jobs,    setJobs]    = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('jobs');

  useEffect(() => {
    async function load() {
      try {
        const [jobsRes, reviewsRes] = await Promise.allSettled([
          axiosClient.get(API_ENDPOINTS.PROVIDER.COMPLETED_JOBS),
          axiosClient.get(API_ENDPOINTS.PROVIDER.REVIEWS),
        ]);
        if (jobsRes.status === 'fulfilled') {
          const list = jobsRes.value.data?.data ?? jobsRes.value.data ?? [];
          setJobs(Array.isArray(list) ? list : []);
        }
        if (reviewsRes.status === 'fulfilled') {
          const list = reviewsRes.value.data?.data ?? reviewsRes.value.data ?? [];
          setReviews(Array.isArray(list) ? list : []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="provider-page">
      <div className="provider-page-header">
        <div>
          <h1 className="provider-page-title">Completed Jobs</h1>
          <p className="provider-page-subtitle">Your job history and client reviews.</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        <button
          type="button"
          className={`btn ${tab === 'jobs' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: 'var(--font-size-sm)' }}
          onClick={() => setTab('jobs')}
        >
          Completed Jobs ({jobs.length})
        </button>
        <button
          type="button"
          className={`btn ${tab === 'reviews' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: 'var(--font-size-sm)' }}
          onClick={() => setTab('reviews')}
        >
          Client Reviews ({reviews.length})
        </button>
      </div>

      {loading ? (
        <div className="provider-spinner-wrap"><div className="provider-spinner" /></div>
      ) : (
        <div className="provider-card">
          {tab === 'jobs' ? (
            <CompletedJobsTable jobs={jobs} />
          ) : (
            <div className="provider-card-body">
              <ProviderReviews reviews={reviews} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
