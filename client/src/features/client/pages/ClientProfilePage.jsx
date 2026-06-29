import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { clientApi } from '../clientApi.js';
import ClientProfileForm from '../components/ClientProfileForm.jsx';

export default function ClientProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.getProfile()
      .then((r) => setProfile(r.data?.data ?? r.data ?? user))
      .catch(() => setProfile(user))
      .finally(() => setLoading(false));
  }, [user]);

  const initials = user
    ? ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'
    : 'U';

  return (
    <div style={{ padding: 'var(--space-2xl) 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="cp-header">
          <div className="cp-avatar-big">
            <span>{initials}</span>
          </div>
          <div>
            <h1 className="cp-title">
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.username}
            </h1>
            <div className="cp-email">{user?.email}</div>
            <div className="cp-role-chip">Client Account</div>
          </div>
        </div>

        <div className="cp-card">
          <h2 className="cp-card-title">✏️ Edit Profile</h2>
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

        <div className="cp-card" style={{ marginTop: 'var(--space-lg)' }}>
          <h2 className="cp-card-title">📍 Location Map</h2>
          <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-md)' }}>
            Your address is used to help providers understand your service location.
          </p>
          <div className="cp-map-placeholder">
            <span>🗺️</span>
            <p>
              {profile?.addressLine1
                ? `${profile.addressLine1}${profile.addressLine2 ? ', ' + profile.addressLine2 : ''}${profile.district ? ', ' + profile.district : ''}`
                : 'No address saved yet. Update your profile above to set your location.'}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .cp-header {
          display: flex; gap: var(--space-xl); align-items: center;
          margin-bottom: var(--space-2xl); flex-wrap: wrap;
        }
        .cp-avatar-big {
          width: 100px; height: 100px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-secondary-700));
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; font-weight: 700; color: white; flex-shrink: 0;
          border: 4px solid var(--color-primary-200);
        }
        .cp-title { font-size: var(--font-size-2xl); color: var(--color-secondary-700); margin-bottom: 4px; }
        .cp-email { color: var(--color-neutral-500); margin-bottom: 8px; }
        .cp-role-chip {
          display: inline-block; padding: 4px 12px; border-radius: var(--radius-full);
          background: var(--color-primary-100); color: var(--color-primary-700);
          font-size: var(--font-size-xs); font-weight: 600;
        }
        .cp-card {
          background: white; border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg); padding: var(--space-xl);
        }
        .cp-card-title { font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: var(--space-xl); }
        .cp-map-placeholder {
          background: var(--color-neutral-50); border-radius: var(--radius-md);
          border: 2px dashed var(--color-neutral-300); padding: var(--space-2xl);
          text-align: center; color: var(--color-neutral-500);
        }
        .cp-map-placeholder span { font-size: 2.5rem; display: block; margin-bottom: var(--space-md); }
      `}</style>
    </div>
  );
}
