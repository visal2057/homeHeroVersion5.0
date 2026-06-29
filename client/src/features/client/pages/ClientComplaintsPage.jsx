import { useEffect, useState } from 'react';
import { clientApi } from '../clientApi.js';
import ClientComplaintForm from '../components/ClientComplaintForm.jsx';

const STATUS_STYLES = {
  OPEN:        { bg: '#fffbeb', color: '#d97706', label: '🔓 Open' },
  IN_REVIEW:   { bg: '#eff6ff', color: '#2563eb', label: '🔍 In Review' },
  RESOLVED:    { bg: '#ecfdf5', color: '#059669', label: '✅ Resolved' },
  CLOSED:      { bg: '#f8fafc', color: '#64748b', label: '📁 Closed' },
};

export default function ClientComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  function fetchComplaints() {
    clientApi.getComplaints()
      .then((r) => setComplaints(r.data?.data ?? r.data ?? []))
      .catch(() => setComplaints([]))
      .finally(() => setLoadingComplaints(false));
  }

  useEffect(() => {
    fetchComplaints();
  }, []);

  function handleSuccess() {
    setShowSuccess(true);
    fetchComplaints();
    setTimeout(() => setShowSuccess(false), 5000);
  }

  return (
    <div style={{ padding: 'var(--space-2xl) 0' }}>
      <div className="container">
        <div className="ccmp-header">
          <h1 className="ccmp-title">📣 Submit a Complaint</h1>
          <p className="ccmp-sub">
            Encountered an issue with a service provider? Let us know and our team will look into it.
          </p>
        </div>

        <div className="ccmp-grid">
          {/* Complaint form */}
          <div className="ccmp-card">
            <h2 className="ccmp-card-title">New Complaint</h2>
            {showSuccess && (
              <div className="ccmp-success">
                ✅ Your complaint has been submitted. Our team will review it within 2 business days.
              </div>
            )}
            <ClientComplaintForm onSuccess={handleSuccess} />
          </div>

          {/* Previous complaints */}
          <div>
            <h2 className="ccmp-card-title" style={{ marginBottom: 'var(--space-lg)' }}>My Complaints</h2>
            {loadingComplaints ? (
              <div style={{ color: 'var(--color-neutral-400)', textAlign: 'center', padding: 'var(--space-xl)' }}>Loading...</div>
            ) : complaints.length === 0 ? (
              <div className="ccmp-empty">
                <span>📭</span>
                <p>No complaints submitted yet.</p>
              </div>
            ) : (
              <div className="ccmp-list">
                {complaints.map((c) => {
                  const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.OPEN;
                  return (
                    <div key={c.id} className="ccmp-item">
                      <div className="ccmp-item-top">
                        <span className="ccmp-item-type">{c.complaintType}</span>
                        <span className="ccmp-item-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                      <p className="ccmp-item-desc">{c.description}</p>
                      <div className="ccmp-item-date">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ccmp-header { margin-bottom: var(--space-2xl); }
        .ccmp-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: 8px; }
        .ccmp-sub { color: var(--color-neutral-500); font-size: var(--font-size-lg); }
        .ccmp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); align-items: start; }
        @media (max-width: 768px) { .ccmp-grid { grid-template-columns: 1fr; } }
        .ccmp-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .ccmp-card-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: var(--space-lg); }
        .ccmp-success { padding: 12px 16px; background: var(--color-success-bg); color: var(--color-success); border-radius: var(--radius-md); margin-bottom: var(--space-lg); font-weight: 600; font-size: var(--font-size-sm); }
        .ccmp-empty { text-align: center; padding: var(--space-xl); color: var(--color-neutral-400); }
        .ccmp-empty span { font-size: 2rem; display: block; margin-bottom: var(--space-md); }
        .ccmp-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .ccmp-item { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md); padding: var(--space-lg); }
        .ccmp-item-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .ccmp-item-type { font-weight: 700; color: var(--color-secondary-700); font-size: var(--font-size-sm); }
        .ccmp-item-status { padding: 3px 10px; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 600; }
        .ccmp-item-desc { color: var(--color-neutral-600); font-size: var(--font-size-sm); margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .ccmp-item-date { font-size: var(--font-size-xs); color: var(--color-neutral-400); }
      `}</style>
    </div>
  );
}
