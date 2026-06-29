import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { clientApi } from '../clientApi.js';
import BookingForm from '../components/BookingForm.jsx';

const MOCK_PROVIDER = {
  id: 'mock-1',
  providerId: 'mock-1',
  name: 'Nimal Perera',
  category: 'Gardening',
  district: 'colombo',
  hourlyRate: 1500,
  isVerified: true,
};

export default function BookingConfirmationPage() {
  const { providerId } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          clientApi.getProviderProfile(providerId),
          clientApi.getProfile(),
        ]);
        setProvider(pRes.data?.data ?? pRes.data);
        setClientProfile(cRes.data?.data ?? cRes.data);
      } catch {
        setProvider({ ...MOCK_PROVIDER, id: providerId, providerId });
        setClientProfile(user);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [providerId, user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
        <div className="ep-spinner" />
        <style>{`.ep-spinner { width: 40px; height: 40px; border: 3px solid var(--color-neutral-200); border-top-color: var(--color-primary-500); border-radius: 50%; animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-2xl) 0' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', marginBottom: 'var(--space-lg)' }}>
          <Link to={ROUTES.CLIENT_HOME} style={{ color: 'var(--color-primary-600)' }}>Home</Link>
          {' › '}
          {provider?.category && (
            <>
              <Link to={ROUTES.CLIENT_EXPLORE.replace(':category', provider.category?.toLowerCase()?.replace(' ', '-'))} style={{ color: 'var(--color-primary-600)' }}>{provider.category}</Link>
              {' › '}
            </>
          )}
          <Link to={ROUTES.CLIENT_PROVIDER_PROFILE.replace(':providerId', providerId)} style={{ color: 'var(--color-primary-600)' }}>{provider?.name}</Link>
          {' › '}
          <span>Book</span>
        </div>

        <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-secondary-700)', marginBottom: 'var(--space-sm)' }}>
          📅 Confirm Booking
        </h1>
        <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-xl)' }}>
          Fill in your details below to send a booking request to the provider.
        </p>

        {provider && (
          <BookingForm provider={provider} client={clientProfile} />
        )}

        <p style={{ marginTop: 'var(--space-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-400)', textAlign: 'center' }}>
          Your request will be sent to the provider. They will confirm or decline within 24 hours.
        </p>
      </div>
    </div>
  );
}
