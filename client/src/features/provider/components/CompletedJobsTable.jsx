import { IconCheckCircle, IconStar, IconImage } from '../../../components/common/icons.jsx';
import InvoiceRowAction from './InvoiceRowAction.jsx';

const MIN_ROWS = 6;
const COLUMN_COUNT = 10;

function StarRow({ value }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: '#fbbf24' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} size={13} style={{ opacity: i < value ? 1 : 0.25 }} />
      ))}
    </span>
  );
}

export default function CompletedJobsTable({ jobs, postedBookingIds, onCreatePost }) {
  if (!jobs?.length) {
    return (
      <div className="provider-empty-state">
        <div className="provider-empty-state-icon"><IconCheckCircle size={24} /></div>
        <p className="provider-empty-state-title">No completed jobs yet</p>
        <p className="provider-empty-state-desc">Finished jobs will appear here after they are marked complete.</p>
      </div>
    );
  }

  const fillerRowCount = Math.max(0, MIN_ROWS - jobs.length);

  return (
    <div className="provider-table-wrap">
      <table className="provider-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Client</th>
            <th>Token</th>
            <th>Service</th>
            <th>Booking Date</th>
            <th>Completed On</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Post</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => {
            const hasPost = postedBookingIds?.has(j.id);
            return (
              <tr key={j.id}>
                <td>#{j.id}</td>
                <td>{j.client_name ?? '—'}</td>
                <td>{j.client_token ?? '—'}</td>
                <td>{j.service_title ?? '—'}</td>
                <td>{j.service_date ? new Date(j.service_date).toLocaleDateString() : '—'}</td>
                <td>{j.completed_at ? new Date(j.completed_at).toLocaleDateString() : '—'}</td>
                <td>
                  <span className="provider-badge completed">
                    <IconCheckCircle size={12} /> Completed
                  </span>
                </td>
                <td>
                  {j.rating != null
                    ? <StarRow value={j.rating} />
                    : <span style={{ color: 'var(--color-text-muted)' }}>Not rated</span>
                  }
                </td>
                <td>
                  {hasPost ? (
                    <span className="provider-badge completed">
                      <IconImage size={12} /> Posted
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="provider-action-btn accept"
                      onClick={() => onCreatePost(j.id)}
                    >
                      Create Post
                    </button>
                  )}
                </td>
                <td>
                  <InvoiceRowAction
                    bookingId={j.id}
                    paymentMethod={j.payment_method}
                    hasInvoice={j.has_invoice}
                  />
                </td>
              </tr>
            );
          })}
          {Array.from({ length: fillerRowCount }).map((_, i) => (
            <tr className="provider-table-filler-row" key={`filler-${i}`}>
              <td colSpan={COLUMN_COUNT}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
