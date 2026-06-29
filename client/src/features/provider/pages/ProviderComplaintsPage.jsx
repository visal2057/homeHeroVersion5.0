import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import ProviderComplaintForm from '../components/ProviderComplaintForm.jsx';

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
    open:        'pending',
    'in-review': 'active',
    resolved:    'completed',
    closed:      'cancelled',
  };

  return (
    <div className="provider-page">
      <div className="provider-page-header">
        <div>
          <h1 className="provider-page-title">Complaints</h1>
          <p className="provider-page-subtitle">Report issues or concerns to the HomeHero team.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', borderBottom: '2px solid var(--color-border)', paddingBottom: '-2px' }}>
        {[
          { id: 'history', label: `My Complaints (${complaints.length})` },
          { id: 'new',     label: '+ New Complaint' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setTab(id); if (id === 'new') { setSubmitted(false); setSubmitError(''); } }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 16px',
              fontWeight: tab === id ? 700 : 500,
              fontSize: 'var(--font-size-sm)',
              color: tab === id ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
              borderBottom: tab === id ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {label}
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
                  <div className="provider-empty-state-icon">📋</div>
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
                        <th>Type</th>
                        <th>Subject</th>
                        <th>Submitted</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((c) => (
                        <tr key={c.id}>
                          <td>{c.type ?? '—'}</td>
                          <td>{c.subject ?? '—'}</td>
                          <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
                          <td>
                            <span className={`provider-badge ${statusColor[c.status] ?? 'pending'}`}>
                              {c.status ?? 'open'}
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
