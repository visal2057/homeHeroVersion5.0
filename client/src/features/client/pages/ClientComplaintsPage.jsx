import { useEffect, useState } from 'react';
import { clientApi } from '../clientApi.js';
import ClientComplaintForm from '../components/ClientComplaintForm.jsx';
import { IconFlag, IconCheckCircle, IconAlertCircle, IconInbox } from '../../../components/common/icons.jsx';

const STATUS_STYLES = {
  SUBMITTED:     { bg: '#fffbeb', color: '#d97706', label: 'Submitted' },
  UNDER_REVIEW:  { bg: '#eff6ff', color: '#2563eb', label: 'Under Review' },
  RESOLVED:      { bg: '#ecfdf5', color: '#059669', label: 'Resolved' },
  BAN_RECOMMENDED: { bg: '#fef2f2', color: '#dc2626', label: 'Ban Recommended' },
  CLOSED:        { bg: '#f8fafc', color: '#64748b', label: 'Closed' },
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
    <div className="ccmp-page">
      {/* Hero */}
      <div className="ccmp-hero">
        <div className="ccmp-hero-overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="ccmp-hero-inner">
            <div className="ccmp-hero-icon">
              <IconFlag size={32} style={{ color: 'white' }} />
            </div>
            <div>
              <div className="hh-eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>Support</div>
              <h1 className="ccmp-hero-title">Submit a Complaint</h1>
              <p className="ccmp-hero-sub">
                Report an issue with a service provider and our team will investigate
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container ccmp-body">
        <div className="ccmp-grid">
          {/* Complaint form */}
          <div className="ccmp-card">
            <h2 className="ccmp-card-title">New Complaint</h2>
            {showSuccess && (
              <div className="ccmp-success">
                <IconCheckCircle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
                Your complaint has been submitted. Our team will review it within 2 business days.
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
                <IconInbox size={40} style={{ color: 'var(--color-neutral-300)', marginBottom: 'var(--space-md)' }} />
                <p>No complaints submitted yet.</p>
              </div>
            ) : (
              <div className="ccmp-list">
                {complaints.map((c) => {
                  const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.SUBMITTED;
                  return (
                    <div key={c.id} className="ccmp-item">
                      <div className="ccmp-item-top">
                        <div className="ccmp-item-type-wrap">
                          <IconAlertCircle size={14} style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
                          <span className="ccmp-item-type">{c.complaintType ?? 'General'}</span>
                        </div>
                        <span className="ccmp-item-status" style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      {c.targetName && (
                        <div className="ccmp-item-target">
                          Against: <strong>{c.targetName}</strong>
                          {c.targetToken && <span className="ccmp-item-token">{c.targetToken}</span>}
                        </div>
                      )}
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
        .ccmp-page { padding-bottom: var(--space-2xl); }
        .ccmp-hero {
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=2000&q=80');
          background-size: cover; background-position: center; padding: 64px 0;
        }
        .ccmp-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,45,25,0.60) 0%, rgba(21,128,61,0.42) 100%);
        }
        .ccmp-hero-inner { display: flex; align-items: center; gap: var(--space-xl); }
        .ccmp-hero-icon {
          width: 64px; height: 64px; border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .ccmp-hero-title { font-size: var(--font-size-3xl); font-weight: 800; color: white; margin-bottom: 6px; }
        .ccmp-hero-sub { color: rgba(255,255,255,0.8); font-size: var(--font-size-lg); margin: 0; }
        .ccmp-body { padding-top: var(--space-2xl); }
        .ccmp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); align-items: start; }
        @media (max-width: 768px) { .ccmp-grid { grid-template-columns: 1fr; } }
        .ccmp-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .ccmp-card-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: var(--space-lg); font-weight: 700; }
        .ccmp-success { display: flex; align-items: center; padding: 12px 16px; background: #ecfdf5; color: #059669; border-radius: var(--radius-md); margin-bottom: var(--space-lg); font-weight: 600; font-size: var(--font-size-sm); border: 1px solid #a7f3d0; }
        .ccmp-empty { text-align: center; padding: var(--space-xl); color: var(--color-neutral-400); display: flex; flex-direction: column; align-items: center; }
        .ccmp-list { display: flex; flex-direction: column; gap: var(--space-md); }
        .ccmp-item { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md); padding: var(--space-lg); }
        .ccmp-item-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 8px; }
        .ccmp-item-type-wrap { display: flex; align-items: center; gap: 6px; }
        .ccmp-item-type { font-weight: 700; color: var(--color-secondary-700); font-size: var(--font-size-sm); }
        .ccmp-item-status { padding: 3px 10px; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 600; white-space: nowrap; flex-shrink: 0; }
        .ccmp-item-target { font-size: var(--font-size-xs); color: var(--color-neutral-500); margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
        .ccmp-item-token { font-family: monospace; background: var(--color-primary-50); color: var(--color-primary-700); padding: 1px 6px; border-radius: var(--radius-sm); }
        .ccmp-item-desc { color: var(--color-neutral-600); font-size: var(--font-size-sm); margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .ccmp-item-date { font-size: var(--font-size-xs); color: var(--color-neutral-400); }
      `}</style>
    </div>
  );
}
