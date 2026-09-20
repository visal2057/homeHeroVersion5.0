import { useEffect, useState } from 'react';
import { clientApi } from '../clientApi.js';
import ClientComplaintForm from '../components/ClientComplaintForm.jsx';
import PageHero from '../../../components/common/PageHero.jsx';
import RevealOnScroll from '../../../components/common/RevealOnScroll.jsx';
import { SkeletonRows } from '../../../components/common/Skeleton.jsx';
import { IconFlag, IconCheckCircle, IconAlertCircle, IconInbox } from '../../../components/common/icons.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=2000&q=80';

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
      <PageHero
        image={HERO_IMAGE}
        icon={IconFlag}
        eyebrow="Support"
        title="Submit a Complaint"
        subtitle="Report an issue with a service provider and our team will investigate"
      />

      <div className="container ccmp-body">
        <div className="ccmp-grid">
          {/* Complaint form */}
          <RevealOnScroll className="ccmp-card" y={16}>
            <h2 className="ccmp-card-title">New Complaint</h2>
            {showSuccess && (
              <div className="ccmp-success">
                <IconCheckCircle size={19} style={{ marginRight: 8, flexShrink: 0 }} />
                Your complaint has been submitted. Our team will review it within 2 business days.
              </div>
            )}
            <ClientComplaintForm onSuccess={handleSuccess} />
          </RevealOnScroll>

          {/* Previous complaints */}
          <RevealOnScroll delay={0.1} y={16}>
            <h2 className="ccmp-card-title" style={{ marginBottom: 'var(--space-lg)' }}>My Complaints</h2>
            {loadingComplaints ? (
              <SkeletonRows count={3} />
            ) : complaints.length === 0 ? (
              <div className="ccmp-empty">
                <IconInbox size={48} style={{ color: 'var(--color-neutral-300)', marginBottom: 'var(--space-md)' }} />
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
                          <IconAlertCircle size={17} style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
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
                          {c.relatedBookingId && <span className="ccmp-item-token">Booking #{c.relatedBookingId}</span>}
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
          </RevealOnScroll>
        </div>
      </div>

      <style>{`
        .ccmp-page { padding-bottom: var(--space-2xl); }
        .ccmp-body { padding-top: var(--space-2xl); }
        .ccmp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); align-items: start; }
        @media (max-width: 768px) { .ccmp-grid { grid-template-columns: 1fr; } }
        .ccmp-card { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .ccmp-card-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: var(--space-lg); font-weight: 700; }
        .ccmp-success { display: flex; align-items: center; padding: 14px 19px; background: #ecfdf5; color: #059669; border-radius: var(--radius-md); margin-bottom: var(--space-lg); font-weight: 600; font-size: var(--font-size-sm); border: 1px solid #a7f3d0; }
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

        /* .ccmp-item-target has no wrap, so a longer provider name plus a
           booking-ref token can outrun a phone-width card - let it wrap
           instead of overflowing. */
        @media (max-width: 480px) {
          .ccmp-item-target { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
