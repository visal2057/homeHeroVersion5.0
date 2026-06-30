import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import ProviderComplaintForm from '../components/ProviderComplaintForm.jsx';
import ProviderPageHero from '../components/ProviderPageHero.jsx';
import { IconClipboardList } from '../../../components/common/icons.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1686178827149-6d55c72d81df?auto=format&fit=crop&w=1600&q=80';

export default function ProviderComplaintsPage() {
  const [complaints,  setComplaints]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted,   setSubmitted]   = useState(false);
  const [tab,         setTab]         = useState('history');

  useEffect(() => {
    async function load() {
      try {
        const res = await axiosClient.get(API_ENDPOINTS.PROVIDER.COMPLAINTS);
        const list = res.data?.data ?? res.data ?? [];
        setComplaints(Array.isArray(list) ? list : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await axiosClient.post(API_ENDPOINTS.PROVIDER.COMPLAINTS, formData);
      const newComplaint = res.data?.data ?? res.data;
      setComplaints((prev) => [newComplaint, ...prev]);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewComplaint() {
    setSubmitted(false);
    setSubmitError('');
    setTab('new');
  }

  const statusColor = {
    SUBMITTED:       'pending',
    UNDER_REVIEW:    'active',
    RESOLVED:        'completed',
    BAN_RECOMMENDED: 'active',
    CLOSED:          'cancelled',
  };

  return (
    <div className="provider-page">
      <ProviderPageHero
        title="Complaints"
        subtitle="Report issues or concerns to the HomeHero team."
        image={HERO_IMAGE}
      />

      {/* Tabs */}
      <div className="provider-tabs">
        {[
          { id: 'history', label: 'My Complaints', count: complaints.length },
          { id: 'new',     label: 'New Complaint' },
        ].map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            className={`provider-tab${tab === id ? ' active' : ''}`}
            onClick={() => { setTab(id); if (id === 'new') { setSubmitted(false); setSubmitError(''); } }}
          >
            {label}
            {count != null && <span className="count">({count})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="provider-spinner-wrap"><div className="provider-spinner" /></div>
      ) : (
        <>
          {tab === 'history' && (
            <div className="provider-card">
              {complaints.length === 0 ? (
                <div className="provider-empty-state">
                  <div className="provider-empty-state-icon"><IconClipboardList size={24} /></div>
                  <p className="provider-empty-state-title">No complaints submitted</p>
                  <p className="provider-empty-state-desc">If you need to report an issue, use the "New Complaint" tab.</p>
                  <button type="button" className="btn btn-primary" onClick={() => setTab('new')}>
                    Submit a Complaint
                  </button>
                </div>
              ) : (
                <div className="provider-table-wrap">
                  <table className="provider-table">
                    <thead>
                      <tr>
                        <th>Complaint For</th>
                        <th>Token</th>
                        <th>Details</th>
                        <th>Submitted</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((c) => (
                        <tr key={c.id}>
                          <td>{c.targetName ?? '—'}</td>
                          <td>{c.targetToken ?? '—'}</td>
                          <td style={{ maxWidth: 280 }}>{c.description ?? '—'}</td>
                          <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                          <td>
                            <span className={`provider-badge ${statusColor[c.status] ?? 'pending'}`}>
                              {c.status?.replace('_', ' ') ?? 'Submitted'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'new' && (
            <div className="provider-card">
              <div className="provider-card-header">
                <h2 className="provider-card-title">Submit a Complaint</h2>
              </div>
              <div className="provider-card-body">
                <ProviderComplaintForm
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  error={submitError}
                  success={submitted}
                />
                {submitted && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ marginTop: 'var(--space-md)' }}
                    onClick={handleNewComplaint}
                  >
                    Submit Another
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
