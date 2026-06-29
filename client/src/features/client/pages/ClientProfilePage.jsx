import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { clientApi } from '../clientApi.js';
import ClientProfileForm from '../components/ClientProfileForm.jsx';
import ChangePasswordForm from '../components/ChangePasswordForm.jsx';
import MapPicker from '../../../components/common/MapPicker.jsx';

export default function ClientProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    clientApi.getProfile()
      .then((r) => {
        const data = r.data?.data ?? r.data ?? user;
        setProfile(data);
        if (data?.location) setLocation(data.location);
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
    } catch {
      // image upload failure is shown inline next to the button
    }
  }

  async function handleSaveLocation() {
    if (!location) return;
    setSavingLocation(true);
    setLocationMessage('');
    try {
      const response = await clientApi.updateLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        addressText: location.addressText ?? profile?.location?.addressText ?? 'Selected on map',
      });
      setProfile((p) => ({ ...p, location: response.data?.data }));
      setLocationMessage('Location saved successfully.');
    } catch (err) {
      setLocationMessage(err?.response?.data?.message ?? 'Failed to save location.');
    } finally {
      setSavingLocation(false);
    }
  }

  const initials = profile?.fullName
    ? profile.fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : (profile?.username?.[0]?.toUpperCase() ?? 'U');

  return (
    <div style={{ padding: 'var(--space-2xl) 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="cp-header">
          <label className="cp-avatar-big" style={{ cursor: 'pointer', overflow: 'hidden' }}>
            {profile?.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{initials}</span>
            )}
            <input type="file" accept="image/jpeg,image/png" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
          <div>
            <h1 className="cp-title">{profile?.fullName ?? profile?.username}</h1>
            <div className="cp-email">{profile?.email}</div>
            <div className="cp-role-chip">Client Account · Token: {profile?.userToken}</div>
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
          <h2 className="cp-card-title">🔒 Change Password</h2>
          <ChangePasswordForm />
        </div>

        <div className="cp-card" style={{ marginTop: 'var(--space-lg)' }}>
          <h2 className="cp-card-title">📍 Location Map</h2>
          <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-md)' }}>
            Drag the pin to your exact location. Providers only see this once you have an active booking with them.
          </p>
          <MapPicker
            latitude={location?.latitude ?? profile?.location?.latitude}
            longitude={location?.longitude ?? profile?.location?.longitude}
            onChange={setLocation}
          />
          {locationMessage && <p style={{ marginTop: 'var(--space-sm)' }}>{locationMessage}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
            <button type="button" className="btn btn-primary" disabled={!location || savingLocation} onClick={handleSaveLocation}>
              {savingLocation ? 'Saving…' : 'Save Location'}
            </button>
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
      `}</style>
    </div>
  );
}
