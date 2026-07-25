import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { invoiceApi } from '../invoiceApi.js';

// One invoice action per completed job: Generate Invoice (opens the Create
// Invoice page) before one exists, Download Invoice (fetches the same
// stored PDF every time) once it does. See system flow spec Section 26.2 --
// realized here as a single row button rather than a literal 3-dot menu,
// since only one of the two actions is ever available at a time.
export default function InvoiceRowAction({ bookingId, paymentMethod, hasInvoice }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  if (!paymentMethod) {
    return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
  }

  if (!hasInvoice) {
    return (
      <button
        type="button"
        className="provider-action-btn accept"
        onClick={() => navigate(ROUTES.PROVIDER_INVOICE.replace(':bookingId', bookingId))}
      >
        Generate Invoice
      </button>
    );
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await invoiceApi.download(bookingId);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button type="button" className="provider-action-btn view" onClick={handleDownload} disabled={downloading}>
      {downloading ? 'Downloading…' : 'Download Invoice'}
    </button>
  );
}
