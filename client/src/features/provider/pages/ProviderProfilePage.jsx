import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import ProviderProfileForm     from '../components/ProviderProfileForm.jsx';
import PortfolioPostEditor     from '../components/PortfolioPostEditor.jsx';
import ProviderReviews         from '../components/ProviderReviews.jsx';
import ProviderPageHero        from '../components/ProviderPageHero.jsx';
import PaymentSettingsSection  from '../../payments/provider/components/PaymentSettingsSection.jsx';
import { IconUser, IconImage, IconStar, IconCreditCard } from '../../../components/common/icons.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1758687126864-96b61e1b3af0?auto=format&fit=crop&w=1600&q=80';

const TABS = [
  { id: 'profile',  label: 'Profile',          Icon: IconUser },
  { id: 'works',    label: 'Previous Works',   Icon: IconImage },
  { id: 'reviews',  label: 'Reviews',          Icon: IconStar },
  { id: 'payments', label: 'Payment Settings', Icon: IconCreditCard },
];

export default function ProviderProfilePage() {
  const [tab,           setTab]           = useState('profile');
  const [profile,       setProfile]       = useState(null);
  const [portfolio,     setPortfolio]     = useState([]);
  const [reviews,       setReviews]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState('');
  const [saveSuccess,   setSaveSuccess]   = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, portfolioRes, reviewsRes] = await Promise.allSettled([
          axiosClient.get(API_ENDPOINTS.PROVIDER.PROFILE),
          axiosClient.get(API_ENDPOINTS.PROVIDER.PORTFOLIO),
          axiosClient.get(API_ENDPOINTS.PROVIDER.REVIEWS),
        ]);
        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data?.data ?? profileRes.value.data);
        }
        if (portfolioRes.status === 'fulfilled') {
          const list = portfolioRes.value.data?.data ?? portfolioRes.value.data ?? [];
          setPortfolio(Array.isArray(list) ? list : []);
        }
        if (reviewsRes.status === 'fulfilled') {
          const list = reviewsRes.value.data?.data ?? reviewsRes.value.data ?? [];
          setReviews(Array.isArray(list) ? list : []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveProfile(formData) {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const res = await axiosClient.put(API_ENDPOINTS.PROVIDER.PROFILE, formData);
      setProfile(res.data?.data ?? res.data);
      setSaveSuccess('Profile updated successfully!');
    } catch (err) {
      setSaveError(err.response?.data?.message ?? 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileImageUploaded(profileImageUrl) {
    setProfile((prev) => (prev ? { ...prev, profileImageUrl } : prev));
  }

  async function handleSavePost(id, { title, description }) {
    const res = await axiosClient.put(API_ENDPOINTS.PROVIDER.PORTFOLIO_DELETE(id), { title, description });
    const updated = res.data?.data ?? res.data;
    setPortfolio((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  }

  async function handleDeletePost(id) {
    if (!window.confirm('Delete this portfolio post?')) return;
    try {
      await axiosClient.delete(API_ENDPOINTS.PROVIDER.PORTFOLIO_DELETE(id));
      setPortfolio((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silently fail — list stays unchanged
    }
  }

  return (
    <div className="provider-page">
      <ProviderPageHero
        title="Profile & Settings"
        subtitle="Manage your public profile, work, reviews and payment details."
        image={HERO_IMAGE}
      />

      {/* Tabs */}
      <div className="provider-tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`provider-tab${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="provider-spinner-wrap"><div className="provider-spinner" /></div>
      ) : (
        <>
          {tab === 'profile' && (
            <div className="provider-card">
              <div className="provider-card-header">
                <h2 className="provider-card-title">Personal Information</h2>
              </div>
              <div className="provider-card-body">
                <ProviderProfileForm
                  profile={profile}
                  onSave={handleSaveProfile}
                  onImageUploaded={handleProfileImageUploaded}
                  saving={saving}
                  error={saveError}
                  success={saveSuccess}
                />
              </div>
            </div>
          )}

          {tab === 'works' && (
            <div className="provider-card">
              <div className="provider-card-header">
                <h2 className="provider-card-title">Previous Works</h2>
              </div>
              <div className="provider-card-body">
                <PortfolioPostEditor
                  posts={portfolio}
                  onSave={handleSavePost}
                  onDelete={handleDeletePost}
                />
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="provider-card">
              <div className="provider-card-header">
                <h2 className="provider-card-title">Client Reviews</h2>
              </div>
              <div className="provider-card-body">
                <ProviderReviews reviews={reviews} />
              </div>
            </div>
          )}

          {tab === 'payments' && <PaymentSettingsSection />}
        </>
      )}
    </div>
  );
}
