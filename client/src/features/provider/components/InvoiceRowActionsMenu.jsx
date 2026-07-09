import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerCreateInvoiceRoute } from '../../../constants/routes.js';
import { useAlert } from '../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { getInvoiceForm, downloadInvoice } from '../invoiceApi.js';

// Hosted inside the Service Provider's Completed Jobs table, immediately
// after the Create Post button (see system flow spec, Section 26.2). Pass
// `invoiceExists` if the host table already knows it to skip the lookup.
export default function InvoiceRowActionsMenu({ bookingId, invoiceExists }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInvoice, setHasInvoice] = useState(invoiceExists ?? null);
  const [isBusy, setIsBusy] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { showError } = useAlert();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleToggle() {
    if (!isOpen && hasInvoice === null) {
      try {
        const { data } = await getInvoiceForm(bookingId);
        setHasInvoice(data.data.form.invoiceExists);
      } catch (apiError) {
        showError(extractErrorMessage(apiError));
        return;
      }
    }
    setIsOpen((prev) => !prev);
  }

  function handleGenerateClick() {
    setIsOpen(false);
    navigate(providerCreateInvoiceRoute(bookingId));
  }

  async function handleDownloadClick() {
    setIsOpen(false);
    setIsBusy(true);
    try {
      await downloadInvoice(bookingId);
    } catch (apiError) {
      showError(extractErrorMessage(apiError));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="btn btn-icon"
        aria-label="More options"
        onClick={handleToggle}
        disabled={isBusy}
      >
        &#8942;
      </button>
      {isOpen && (
        <div
          className="card"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            zIndex: 10,
            minWidth: 180,
            padding: 'var(--space-sm)',
          }}
        >
          {hasInvoice ? (
            <button type="button" className="btn btn-text btn-block" onClick={handleDownloadClick}>
              Download Invoice
            </button>
          ) : (
            <button type="button" className="btn btn-text btn-block" onClick={handleGenerateClick}>
              Generate Invoice
            </button>
          )}
        </div>
      )}
    </div>
  );
}
