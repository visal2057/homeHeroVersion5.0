// Shows the provider's bank details that a card payment will be sent to.
// These come from the provider's Payment Settings (which I also own).
// The client can only read them — they are never editable here.
export default function PayeeDetails({ payee }) {
  // If the provider has not saved payment settings yet, there is nothing
  // to pay into, so we tell the client instead of showing a blank box.
  if (!payee) {
    return (
      <div className="pd-card pd-empty">
        This provider has not set up card payments yet. Please choose cash.
        <style>{`.pd-empty { color: var(--color-neutral-500); font-size: var(--font-size-sm); }`}</style>
      </div>
    );
  }

  return (
    <div className="pd-card">
      <h3 className="pd-title">Paying into</h3>
      <div className="pd-row"><span>Account holder</span><strong>{payee.accountHolderName}</strong></div>
      <div className="pd-row"><span>Bank</span><strong>{payee.bankName}</strong></div>
      <div className="pd-row"><span>Branch</span><strong>{payee.branchName}</strong></div>
      <div className="pd-row"><span>Account</span><strong>•••• {payee.accountLastFour}</strong></div>

      <style>{`
        .pd-card { background: var(--color-neutral-50); border: 1px solid var(--color-neutral-200); border-radius: var(--radius-md); padding: var(--space-lg); }
        .pd-title { font-size: var(--font-size-sm); text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-neutral-500); margin-bottom: var(--space-sm); }
        .pd-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: var(--font-size-sm); color: var(--color-neutral-600); }
        .pd-row strong { color: var(--color-neutral-800); }
      `}</style>
    </div>
  );
}
