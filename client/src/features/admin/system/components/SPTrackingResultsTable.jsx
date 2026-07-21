import { Fragment, useState } from 'react';
import { downloadTrackedInvoice } from '../systemAdminApi.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

function formatAmount(amount) {
  return amount === null ? '—' : `LKR ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function SPTrackingResultsTable({ jobs }) {
  const [expandedId, setExpandedId] = useState(null);
  const { showError } = useAlert();

  if (jobs.length === 0) {
    return <p className="empty-state">This Service Provider has no completed jobs yet.</p>;
  }

  const handleViewInvoice = async (bookingId) => {
    try {
      await downloadTrackedInvoice(bookingId);
    } catch (error) {
      showError(extractErrorMessage(error));
    }
  };

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Client</th>
            <th>Category</th>
            <th>Completed</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const isExpanded = expandedId === job.bookingId;
            return (
              <Fragment key={job.bookingId}>
                <tr
                  onClick={() => setExpandedId(isExpanded ? null : job.bookingId)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>#{job.bookingId}</td>
                  <td>
                    {job.clientName}
                    <br />
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{job.clientToken}</span>
                  </td>
                  <td>{job.serviceCategory}</td>
                  <td>{job.completionDate ? new Date(job.completionDate).toLocaleDateString() : '—'}</td>
                  <td>{job.paymentMethod ?? '—'}</td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={5}>
                      <div className="sp-tracking-detail">
                        <p><strong>Job description:</strong> {job.jobDescription}</p>
                        <p><strong>Location:</strong> {job.jobLocation ?? '—'}</p>
                        <p><strong>Booking date:</strong> {job.bookingDate ? new Date(job.bookingDate).toLocaleString() : '—'}</p>
                        <p><strong>Completion date:</strong> {job.completionDate ? new Date(job.completionDate).toLocaleString() : '—'}</p>
                        <p><strong>Payment method:</strong> {job.paymentMethod ?? '—'}</p>
                        <p><strong>Amount:</strong> {formatAmount(job.amount)}</p>
                        {job.hasInvoice && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleViewInvoice(job.bookingId);
                            }}
                          >
                            View Invoice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
