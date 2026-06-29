import { useState, useEffect } from 'react';
import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';
import ProviderProfileForm     from '../components/ProviderProfileForm.jsx';
import PortfolioPostEditor     from '../components/PortfolioPostEditor.jsx';
import CreatePortfolioPostModal from '../components/CreatePortfolioPostModal.jsx';

const TABS = [
  { id: 'profile',    label: '👤 Profile' },
  { id: 'portfolio',  label: '🖼️ Portfolio' },
];

export default function ProviderProfilePage() {
  const [tab,           setTab]           = useState('profile');
  const [profile,       setProfile]       = useState(null);
  const [portfolio,     setPortfolio]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState('');
  const [saveSuccess,   setSaveSuccess]   = useState('');
  const [showModal,     setShowModal]     = useState(false);
  const [modalSaving,   setModalSaving]   = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, portfolioRes] = await Promise.allSettled([
          axiosClient.get(API_ENDPOINTS.PROVIDER.PROFILE),
          axiosClient.get(API_ENDPOINTS.PROVIDER.PORTFOLIO),
        ]);
        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data?.data ?? profileRes.value.data);
        }
        if (portfolioRes.status === 'fulfilled') {
          const list = portfolioRes.value.data?.data ?? portfolioRes.value.data ?? [];
          setPortfolio(Array.isArray(list) ? list : []);
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

  async function handleAddPost(postData) {
    setModalSaving(true);
    try {
      const res = await axiosClient.post(API_ENDPOINTS.PROVIDER.PORTFOLIO, postData);
      const newPost = res.data?.data ?? res.data;
      setPortfolio((prev) => [newPost, ...prev]);
      setShowModal(false);
    } catch {
      // modal shows its own error
    } finally {
      setModalSaving(false);
    }
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
      <div className="provider-page-header">
        <div>
          <h1 className="provider-page-title">Profile &amp; Settings</h1>
          <p className="provider-page-subtitle">Manage your public profile and portfolio.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', borderBottom: '2px solid var(--color-border)', paddingBottom: '-2px' }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 16px',
              fontWeight: tab === id ? 700 : 500,
              fontSize: 'var(--font-size-sm)',
              color: tab === id ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
              borderBottom: tab === id ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'color var(--transition-base)',
            }}
          >
            {label}
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
                  saving={saving}
                  error={saveError}
                  success={saveSuccess}
                />
              </div>
            </div>
          )}

          {tab === 'portfolio' && (
            <div className="provider-card">
              <div className="provider-card-header">
                <h2 className="provider-card-title">Portfolio</h2>
              </div>
              <div className="provider-card-body">
                <PortfolioPostEditor
                  posts={portfolio}
                  onAdd={() => setShowModal(true)}
                  onDelete={handleDeletePost}
                />
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <CreatePortfolioPostModal
          onClose={() => setShowModal(false)}
          onSave={handleAddPost}
          saving={modalSaving}
        />
      )}
    </div>
  );
}
