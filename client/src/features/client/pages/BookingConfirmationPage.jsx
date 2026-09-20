import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { clientApi } from '../clientApi.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import BookingForm from '../components/BookingForm.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import PageHero from '../../../components/common/PageHero.jsx';
import { SkeletonLine } from '../../../components/common/Skeleton.jsx';
import { IconCalendar, IconAlertCircle } from '../../../components/common/icons.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=2000&q=80';

export default function BookingConfirmationPage() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes] = await Promise.all([
        clientApi.getProviderProfile(providerId),
        clientApi.getProfile(),
      ]);
      setProvider(pRes.data?.data ?? pRes.data);
      setClientProfile(cRes.data?.data ?? cRes.data);
    } catch (err) {
      setProvider(null);
      setClientProfile(null);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)', maxWidth: 912, margin: '0 auto' }}>
        <SkeletonLine height={28} width="40%" style={{ marginBottom: 'var(--space-lg)' }} />
        <SkeletonLine height={180} style={{ marginBottom: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }} />
        <SkeletonLine height={44} style={{ marginBottom: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }} />
        <SkeletonLine height={44} width="80%" style={{ borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
        <EmptyState
          icon={IconAlertCircle}
          tone="error"
          title="Couldn't load this booking form"
          message={error}
          actionLabel="Try Again"
          onAction={load}
        />
      </div>
    );
  }

  return (
    <div className="bcp-page">
      <PageHero
        image={HERO_IMAGE}
        icon={IconCalendar}
        eyebrow="Booking"
        title="Confirm Your Booking"
        subtitle={provider?.name ? `Requesting ${provider.name}${provider.category ? ` - ${provider.category}` : ''}` : 'Fill in your details to send a booking request'}
      />

      <div className="container bcp-body">
        {/* Breadcrumb */}
        <div className="bcp-breadcrumb">
          <Link to={ROUTES.HOME} style={{ color: 'var(--color-primary-600)' }}>Home</Link>
          {' › '}
          {provider?.category && (
            <>
              <Link
                to={ROUTES.CLIENT_EXPLORE.replace(':category', (provider.categories?.[0] ?? provider.category).toLowerCase().replace(/\s+/g, '-'))}
                style={{ color: 'var(--color-primary-600)' }}
              >
                {provider.category}
              </Link>
              {' › '}
            </>
          )}
          <Link to={ROUTES.CLIENT_PROVIDER_PROFILE.replace(':providerId', providerId)} style={{ color: 'var(--color-primary-600)' }}>
            {provider?.name}
          </Link>
          {' › '}
          <span style={{ color: 'var(--color-neutral-500)' }}>Book</span>
        </div>

        <div className="bcp-content" style={{ margin: '0 auto' }}>
          {provider && <BookingForm provider={provider} client={clientProfile} />}
          <p className="bcp-note">
            Your request will be sent to the provider. They will confirm or decline within 24 hours.
          </p>
        </div>
      </div>

      <style>{`
        .bcp-page { padding-bottom: var(--space-2xl); }
        .bcp-body { padding-top: var(--space-xl); }
        .bcp-breadcrumb { font-size: var(--font-size-sm); color: var(--color-neutral-500); margin-bottom: var(--space-lg); }
        .bcp-content { max-width: 912px; }
        .bcp-note { margin-top: var(--space-lg); font-size: var(--font-size-sm); color: var(--color-neutral-400); text-align: center; }
      `}</style>
    </div>
  );
}
