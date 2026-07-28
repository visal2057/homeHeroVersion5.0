import { useEffect, useState, useCallback } from 'react';
import { membershipApi } from '../membershipApi.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';
import MembershipExpiryWarning from '../components/MembershipExpiryWarning.jsx';
import MembershipStatusCard from '../components/MembershipStatusCard.jsx';
import MembershipPricingCard from '../components/MembershipPricingCard.jsx';
import MembershipHistoryTable from '../components/MembershipHistoryTable.jsx';
import MembershipPaymentForm from '../components/MembershipPaymentForm.jsx';
import ProviderPageHero from '../../../provider/components/ProviderPageHero.jsx';
import EmptyState from '../../../../components/common/EmptyState.jsx';
import Modal from '../../../../components/common/Modal.jsx';
import { IconAlertCircle } from '../../../../components/common/icons.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1594989627219-01e365ee6d05?auto=format&fit=crop&w=1600&q=80';

export default function SubscriptionPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await membershipApi.getOverview();
      setOverview(res.data?.data ?? res.data);
    } catch (err) {
      setOverview(null);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // After a successful payment: close the form and reload fresh data.
  const handlePaid = () => {
    setShowPayment(false);
    load();
  };

  if (loading) {
    return <div className="container" style={{ padding: 'var(--space-2xl)', color: 'var(--color-neutral-500)' }}>Loading membership…</div>;
  }

  if (error || !overview) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
        <EmptyState
          icon={IconAlertCircle}
          tone="error"
          title="Couldn't load your membership"
          message={error || 'Something went wrong loading your membership details.'}
          actionLabel="Try Again"
          onAction={load}
        />
      </div>
    );
  }

  const hasActive = overview.current?.status === 'ACTIVE';
  // Renewal is only allowed once the current membership has expired.
  const canBuy = !overview.current || overview.current.status !== 'ACTIVE';

  return (
    <div style={{ padding: 'var(--space-2xl) 0' }} className={showPayment ? 'sub-blurred' : ''}>
      <div className="container">
        <ProviderPageHero
          title="Membership"
          subtitle="Your HomeHero membership keeps you visible and bookable to clients."
          image={HERO_IMAGE}
        />

        <MembershipExpiryWarning current={overview.current} />

        <div className="sub-grid">
          <MembershipStatusCard current={overview.current} />
          <MembershipPricingCard
            quote={overview.quote}
            hasActive={hasActive}
            canBuy={canBuy}
            activeUntil={overview.current?.expiresAt}
            onBuy={() => setShowPayment(true)}
          />
        </div>

        <div className="sub-history">
          <h2 className="sub-h2">Payment history</h2>
          <MembershipHistoryTable history={overview.history} />
        </div>
      </div>

      <style>{`
        .sub-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: 4px; }
        .sub-sub { color: var(--color-neutral-500); margin-bottom: var(--space-xl); }
        .sub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); margin-bottom: var(--space-xl); align-items: start; }
        .sub-history { background: white; border: 1px solid var(--color-neutral-200); border-radius: var(--radius-lg); padding: var(--space-xl); }
        .sub-h2 { font-size: var(--font-size-lg); color: var(--color-secondary-700); margin-bottom: var(--space-md); }
        @media (max-width: 800px) { .sub-grid { grid-template-columns: 1fr; } }
        .sub-blurred { filter: blur(4px); transition: filter 0.2s ease; }
      `}</style>

      {/* Popup instead of an inline block at the bottom of the page (which
          used to render below the history table, invisible without
          scrolling) - blurred backdrop + centered card, closable via the ×
          or the form's own Cancel button, same as every other modal in the
          app (see RejectReasonModal.jsx for the established × convention). */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} maxWidth={480}>
        <div style={{ position: 'relative' }}>
          <button type="button" className="sub-modal-close" aria-label="Close" onClick={() => setShowPayment(false)}>×</button>
          <MembershipPaymentForm
            quote={overview.quote}
            onCancel={() => setShowPayment(false)}
            onPaid={handlePaid}
          />
        </div>
        <style>{`
          .sub-modal-close {
            position: absolute; top: 14px; right: 14px;
            width: 28px; height: 28px; border-radius: 50%;
            border: none; background: var(--color-neutral-100); color: var(--color-neutral-600);
            font-size: 18px; line-height: 1; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background var(--transition-base);
          }
          .sub-modal-close:hover { background: var(--color-neutral-200); }
        `}</style>
      </Modal>
    </div>
  );
}
