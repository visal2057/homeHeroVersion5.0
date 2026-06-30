import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { clientApi } from '../clientApi.js';
import BookingForm from '../components/BookingForm.jsx';
import { IconCalendar } from '../../../components/common/icons.jsx';

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
    <div className="bcp-page">
      {/* Hero */}
      <div className="bcp-hero">
        <div className="bcp-hero-overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="bcp-hero-inner">
            <div className="bcp-hero-icon">
              <IconCalendar size={32} style={{ color: 'white' }} />
            </div>
            <div>
              <div className="hh-eyebrow" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>Booking</div>
              <h1 className="bcp-hero-title">Confirm Your Booking</h1>
              <p className="bcp-hero-sub">
                {provider?.name ? `Requesting ${provider.name}${provider.category ? ` · ${provider.category}` : ''}` : 'Fill in your details to send a booking request'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container bcp-body">
        {/* Breadcrumb */}
        <div className="bcp-breadcrumb">
          <Link to={ROUTES.HOME} style={{ color: 'var(--color-primary-600)' }}>Home</Link>
          {' › '}
          {provider?.category && (
            <>
              <Link
                to={ROUTES.CLIENT_EXPLORE.replace(':category', provider.category?.toLowerCase()?.replace(' ', '-'))}
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

        <div className="bcp-content" style={{ maxWidth: 720, margin: '0 auto' }}>
          {provider && <BookingForm provider={provider} client={clientProfile} />}
          <p className="bcp-note">
            Your request will be sent to the provider. They will confirm or decline within 24 hours.
          </p>
        </div>
      </div>

      <style>{`
        .bcp-page { padding-bottom: var(--space-2xl); }
        .bcp-hero {
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=2000&q=80');
          background-size: cover; background-position: center; padding: 56px 0;
        }
        .bcp-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,45,25,0.60) 0%, rgba(21,128,61,0.42) 100%);
        }
        .bcp-hero-inner { display: flex; align-items: center; gap: var(--space-xl); }
        .bcp-hero-icon {
          width: 64px; height: 64px; border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .bcp-hero-title { font-size: var(--font-size-3xl); font-weight: 800; color: white; margin-bottom: 6px; }
        .bcp-hero-sub { color: rgba(255,255,255,0.8); font-size: var(--font-size-lg); margin: 0; }
        .bcp-body { padding-top: var(--space-xl); }
        .bcp-breadcrumb { font-size: var(--font-size-sm); color: var(--color-neutral-500); margin-bottom: var(--space-lg); }
        .bcp-content { max-width: 760px; }
        .bcp-note { margin-top: var(--space-lg); font-size: var(--font-size-sm); color: var(--color-neutral-400); text-align: center; }
      `}</style>
    </div>
  );
}
