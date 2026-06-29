/* Subscriptions page — content owned by Visal (Module 5: Payments).
   This page is a placeholder so the sidebar link resolves correctly. */
export default function ProviderSubscriptionsPage() {
  return (
    <div className="provider-page">
      <div className="provider-page-header">
        <div>
          <h1 className="provider-page-title">Subscriptions</h1>
          <p className="provider-page-subtitle">Manage your membership plan and billing.</p>
        </div>
      </div>

      <div className="provider-subscriptions-placeholder">
        <div style={{ fontSize: '3.5rem' }}>💳</div>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-secondary-700)' }}>Membership Plans</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 'var(--space-sm) 0 0' }}>
            Subscription and payment management will be available here soon.
          </p>
        </div>
      </div>
    </div>
  );
}
