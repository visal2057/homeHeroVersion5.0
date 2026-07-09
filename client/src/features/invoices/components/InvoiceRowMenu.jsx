import { useEffect, useRef, useState } from 'react';

// Dinuka's "More Options" row menu (Section 14.1): shows Generate Invoice
// when no invoice exists yet for the job, Download Invoice once one has
// been generated.
export default function InvoiceRowMenu({ hasInvoice, onGenerate, onDownload }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect() {
    setOpen(false);
    if (hasInvoice) {
      onDownload();
    } else {
      onGenerate();
    }
  }

  return (
    <div className="provider-row-menu" ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="provider-row-menu-trigger"
        aria-label="More options"
        onClick={() => setOpen((o) => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '4px 8px' }}
      >
        &#8942;
      </button>
      {open && (
        <div
          className="provider-row-menu-dropdown"
          style={{
            position: 'absolute', right: 0, top: '100%', zIndex: 10,
            background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 160,
          }}
        >
          <button
            type="button"
            onClick={handleSelect}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {hasInvoice ? 'Download Invoice' : 'Generate Invoice'}
          </button>
        </div>
      )}
    </div>
  );
}
