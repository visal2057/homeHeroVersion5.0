import { useState } from 'react';
import { bookingApi } from '../bookingApi.js';

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: s <= value ? '#f59e0b' : '#cbd5e1', padding: 0 }}
          onClick={() => onChange(s)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewModal({ booking, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await bookingApi.reviewBooking(booking.id, { rating, comment });
      onDone();
      onClose();
    } catch {
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Leave a Review</h3>
        <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)' }}>
          How was your experience with <strong>{booking.providerName}</strong>?
        </p>
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary-700)' }}>Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary-700)' }}>Comment (optional)</label>
          <textarea rows={3} className="bf-input bf-textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={submitting} onClick={submit}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
      <style>{`
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .modal-box { background: white; border-radius: var(--radius-lg); padding: var(--space-xl); width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); }
        .bf-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--color-neutral-200); border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: inherit; outline: none; transition: border-color var(--transition-base); background: white; box-sizing: border-box; }
        .bf-input:focus { border-color: var(--color-primary-500); }
        .bf-textarea { resize: vertical; }
      `}</style>
    </div>
  );
}

export default function CompletedJobsTable({ bookings = [], onRefresh }) {
  const [reviewTarget, setReviewTarget] = useState(null);

  if (!bookings.length) {
    return (
      <div className="bt-empty">
        <span>✅</span>
        <h3>No completed jobs yet</h3>
        <p>Your finished bookings will appear here.</p>
        <style>{`.bt-empty { text-align: center; padding: var(--space-2xl); color: var(--color-neutral-400); } .bt-empty span { font-size: 2.5rem; display: block; margin-bottom: var(--space-md); } .bt-empty h3 { color: var(--color-neutral-600); }`}</style>
      </div>
    );
  }

  return (
    <div>
      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onDone={() => { onRefresh?.(); setReviewTarget(null); }}
        />
      )}
      <div className="bt-table-wrap">
        <table className="bt-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Service</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Rating</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <div className="bt-provider-cell">
                    <div className="bt-provider-avatar">{(b.providerName ?? 'P')[0]}</div>
                    <span>{b.providerName ?? 'Unknown'}</span>
                  </div>
                </td>
                <td>{b.category ?? '—'}</td>
                <td>{b.serviceDate ? new Date(b.serviceDate).toLocaleDateString('en-LK') : '—'}</td>
                <td>{b.durationHours ? `${b.durationHours}h` : '—'}</td>
                <td>
                  {b.clientRating
                    ? <span style={{ color: '#f59e0b' }}>{'★'.repeat(b.clientRating)}{'☆'.repeat(5 - b.clientRating)}</span>
                    : <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--font-size-xs)' }}>Not rated</span>}
                </td>
                <td>
                  {!b.clientRating ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '4px 12px', fontSize: 'var(--font-size-xs)' }}
                      onClick={() => setReviewTarget(b)}
                    >
                      ⭐ Review
                    </button>
                  ) : (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-400)' }}>Done</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        .bt-table-wrap { overflow-x: auto; }
        .bt-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
        .bt-table th { background: var(--color-neutral-50); padding: 10px 14px; text-align: left; color: var(--color-neutral-600); font-weight: 600; border-bottom: 2px solid var(--color-neutral-200); white-space: nowrap; }
        .bt-table td { padding: 12px 14px; border-bottom: 1px solid var(--color-neutral-100); color: var(--color-neutral-700); vertical-align: middle; }
        .bt-table tr:hover td { background: var(--color-neutral-50); }
        .bt-provider-cell { display: flex; align-items: center; gap: 8px; }
        .bt-provider-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary-100); display: flex; align-items: center; justify-content: center; color: var(--color-primary-700); font-weight: 700; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
