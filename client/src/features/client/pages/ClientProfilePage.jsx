import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { clientApi } from '../clientApi.js';
import ClientProfileForm from '../components/ClientProfileForm.jsx';
import ChangePasswordForm from '../components/ChangePasswordForm.jsx';
import LocationCard from '../components/LocationCard.jsx';
import LocationEditModal from '../components/LocationEditModal.jsx';
import { getAssetUrl } from '../../../utils/storageUtils.js';
import { IconUser, IconDocumentEdit, IconLock, IconMapPin, IconShield } from '../../../components/common/icons.jsx';

export default function ClientProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingLocationType, setEditingLocationType] = useState(null); // 'PRIMARY' | 'SECONDARY' | null

  useEffect(() => {
    clientApi.getProfile()
      .then((r) => {
        const data = r.data?.data ?? r.data ?? user;
        setProfile(data);
      })
      .catch(() => setProfile(user))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const response = await clientApi.updateProfileImage(file);
      setProfile((p) => ({ ...p, profileImageUrl: response.data?.data?.profileImageUrl }));
      refreshUser?.();
    } catch { /* shown inline */ }
  }

  const initials = profile?.fullName
    ? profile.fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : (profile?.username?.[0]?.toUpperCase() ?? 'U');

  return (
    <div className="cp-page">
      {/* Hero */}
      <div className="cp-hero">
        <div className="cp-hero-overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="cp-hero-inner">
            <div className="cp-hero-avatar" onClick={() => document.getElementById('profile-img-input').click()} title="Click to change photo">
              {profile?.profileImageUrl ? (
                <img src={getAssetUrl(profile.profileImageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{initials}</span>
              )}
              <div className="cp-avatar-overlay">
                <IconDocumentEdit size={22} style={{ color: 'white' }} />
              </div>
              <input id="profile-img-input" type="file" accept="image/jpeg,image/png" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
            <div>
              <h1 className="cp-hero-name">{profile?.fullName ?? profile?.username ?? 'My Profile'}</h1>
              {profile?.username && <div className="cp-hero-username">@{profile.username}</div>}
              <div className="cp-hero-email">{profile?.email}</div>
              {profile?.userToken && (
                <div className="cp-hero-token">
                  <IconShield size={14} style={{ marginRight: 4 }} />
                  Token: <strong style={{ letterSpacing: '0.1em', marginLeft: 4 }}>{profile.userToken}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container cp-body">
        <div className="cp-sections">
          {/* Edit profile */}
          <div className="cp-card">
            <div className="cp-card-title">
              <IconDocumentEdit size={22} style={{ color: 'var(--color-primary-600)' }} />
              Edit Profile
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-neutral-500)' }}>Loading...</div>
            ) : (
              <ClientProfileForm
                initialData={profile}
                onSaved={(updated) => {
                  setProfile((p) => ({ ...p, ...updated }));
                  refreshUser?.();
                }}
              />
            )}
          </div>

          {/* Change password */}
          <div className="cp-card">
            <div className="cp-card-title">
              <IconLock size={22} style={{ color: 'var(--color-primary-600)' }} />
              Change Password
            </div>
            <ChangePasswordForm />
          </div>

          {/* Locations */}
          <div className="cp-card cp-card-full">
            <div className="cp-card-title">
              <IconMapPin size={22} style={{ color: 'var(--color-primary-600)' }} />
              Locations
            </div>
            <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-sm)' }}>
              Set a Primary and, optionally, a Secondary location. Providers only see these once you have an active
              booking with them, and both are available to pick from when you book a service.
            </p>
            <div className="cp-locations-grid">
              <LocationCard
                label="Primary Location"
                location={profile?.primaryLocation}
                onEdit={() => setEditingLocationType('PRIMARY')}
              />
              <LocationCard
                label="Secondary Location"
                location={profile?.secondaryLocation}
                onEdit={() => setEditingLocationType('SECONDARY')}
              />
            </div>
          </div>
        </div>
      </div>

      <LocationEditModal
        isOpen={editingLocationType != null}
        onClose={() => setEditingLocationType(null)}
        label={editingLocationType === 'SECONDARY' ? 'Secondary Location' : 'Primary Location'}
        locationType={editingLocationType ?? 'PRIMARY'}
        initialLocation={editingLocationType === 'SECONDARY' ? profile?.secondaryLocation : profile?.primaryLocation}
        onSaved={(saved) => {
          setProfile((p) => ({
            ...p,
            ...(editingLocationType === 'SECONDARY' ? { secondaryLocation: saved } : { primaryLocation: saved }),
          }));
        }}
      />

      <style>{`
        .cp-page { padding-bottom: var(--space-2xl); }
        .cp-hero {
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=2000&q=80');
          background-size: cover; background-position: center; padding: 72px 0;
        }
        .cp-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,45,25,0.60) 0%, rgba(21,128,61,0.42) 100%);
        }
        .cp-hero-inner { display: flex; align-items: center; gap: var(--space-xl); }
        .cp-hero-avatar {
          width: 108px; height: 108px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--color-primary-400), var(--color-secondary-700));
          display: flex; align-items: center; justify-content: center;
          font-size: 2.4rem; font-weight: 700; color: white;
          border: 4px solid rgba(255,255,255,0.4); cursor: pointer;
          position: relative; overflow: hidden;
        }
        .cp-avatar-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
        }
        .cp-hero-avatar:hover .cp-avatar-overlay { opacity: 1; }
        .cp-hero-name { font-size: var(--font-size-2xl); font-weight: 800; color: white; margin-bottom: 4px; }
        .cp-hero-username { color: rgba(255,255,255,0.65); font-size: var(--font-size-sm); margin-bottom: 4px; }
        .cp-hero-email { color: rgba(255,255,255,0.75); margin-bottom: 8px; font-size: var(--font-size-sm); }
        .cp-hero-token {
          display: inline-flex; align-items: center; padding: 4px 12px;
          background: rgba(255,255,255,0.15); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.3); border-radius: var(--radius-full);
          color: rgba(255,255,255,0.9); font-size: var(--font-size-xs);
        }
        .cp-body { padding-top: var(--space-2xl); }
        .cp-sections { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
        @media (max-width: 768px) { .cp-sections { grid-template-columns: 1fr; } }
        .cp-card-full { grid-column: 1 / -1; isolation: isolate; }
        .cp-card {
          background: white; border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg); padding: var(--space-xl);
        }
        .cp-card-title {
          display: flex; align-items: center; gap: 10px;
          font-size: var(--font-size-lg); font-weight: 700;
          color: var(--color-secondary-700); margin-bottom: var(--space-lg);
          padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-neutral-100);
        }
        .cp-locations-grid { display: flex; flex-direction: column; gap: var(--space-md); }
      `}</style>
    </div>
  );
}
