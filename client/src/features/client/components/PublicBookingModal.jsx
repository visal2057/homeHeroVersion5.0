import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { clientApi } from '../clientApi.js';
import { bookingApi } from '../bookingApi.js';
import MapPicker from '../../../components/common/MapPicker.jsx';
import {
  IconCalendar, IconClock, IconMapPin, IconImage, IconXCircle, IconSend,
} from '../../../components/common/icons.jsx';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '15', '30', '45'];

function buildDateTime(date, hour, minute, ampm) {
  let h = parseInt(hour, 10);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return new Date(`${date}T${String(h).padStart(2, '0')}:${minute}:00`).toISOString();
}

// Popup for posting a job to every provider in a category at once, rather
// than one specific provider (see BookingForm.jsx for the single-provider
// equivalent this mirrors field-for-field). Whichever provider accepts
// first is assigned the job; everything from there on is a normal booking.
export default function PublicBookingModal({ categorySlug, categoryLabel, onClose }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];

  const [client, setClient] = useState(null);
  const [loadingClient, setLoadingClient] = useState(true);

  const [form, setForm] = useState({
    serviceDate: '',
    startHour: '9', startMinute: '00', startAmpm: 'AM',
    endHour: '10', endMinute: '00', endAmpm: 'AM',
    jobDescription: '',
  });
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasPrimaryLocation = client?.primaryLocation?.latitude != null;
  const hasSecondaryLocation = client?.secondaryLocation?.latitude != null;

  const [locationMode, setLocationMode] = useState('custom');
  const [customAddress, setCustomAddress] = useState('');
  const [customPosition, setCustomPosition] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await clientApi.getProfile();
        const profile = res.data?.data ?? res.data;
        if (cancelled) return;
        setClient(profile);
        if (profile?.primaryLocation?.latitude != null) setLocationMode('primary');
        else if (profile?.secondaryLocation?.latitude != null) setLocationMode('secondary');
      } catch {
        if (!cancelled) setError('Could not load your profile. Please try again.');
      } finally {
        if (!cancelled) setLoadingClient(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const effectiveLocation =
    locationMode === 'primary' ? client?.primaryLocation
    : locationMode === 'secondary' ? client?.secondaryLocation
    : (customPosition ? { ...customPosition, addressText: customAddress } : null);
  const hasEffectiveLocation = effectiveLocation?.latitude != null;

  useEffect(() => {
    return () => photoUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [photoUrls]);

  // Lock page scroll while the popup is open, same as the app's other
  // full-screen overlays.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handlePhotosChange(e) {
    const files = Array.from(e.target.files ?? []).slice(0, 3);
    setPhotos(files);
    setPhotoUrls(files.map((f) => URL.createObjectURL(f)));
  }

  function removePhoto(idx) {
    URL.revokeObjectURL(photoUrls[idx]);
    setPhotos((p) => p.filter((_, i) => i !== idx));
    setPhotoUrls((u) => u.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.serviceDate || !form.jobDescription.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.jobDescription.trim().length < 10) {
      setError('Job description must be at least 10 characters.');
      return;
    }
    const startAt = buildDateTime(form.serviceDate, form.startHour, form.startMinute, form.startAmpm);
    const endAt = buildDateTime(form.serviceDate, form.endHour, form.endMinute, form.endAmpm);
    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      setError('End time must be after the start time.');
      return;
    }
    if (locationMode === 'custom' && !customAddress.trim()) {
      setError('Please enter an address for the location you dropped a pin on.');
      return;
    }
    if (!hasEffectiveLocation) {
      setError(
        locationMode === 'custom'
          ? 'Please drop a pin on the map to set the service location.'
          : 'Please select a location for this booking.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('categorySlug', categorySlug);
      formData.append('jobDescription', form.jobDescription);
      formData.append('scheduledAt', startAt);
      formData.append('scheduledEndAt', endAt);
      if (effectiveLocation?.latitude) {
        formData.append('locationLatitude', effectiveLocation.latitude);
        formData.append('locationLongitude', effectiveLocation.longitude);
        formData.append('locationAddress', effectiveLocation.addressText ?? '');
      }
      photos.forEach((file) => formData.append('jobPhotos', file));

      const res = await bookingApi.createPublicBooking(formData);
      const bookingId = res.data?.data?.bookingId ?? res.data?.bookingId;
      navigate(ROUTES.CLIENT_BOOKING_SENT, { state: { bookingId, isPublicBooking: true } });
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to submit your public booking request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pbm-overlay" onClick={onClose}>
      <div className="pbm-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pbm-close" onClick={onClose} aria-label="Close">
          <IconXCircle size={28} />
        </button>

        <div className="pbm-header">
          <div className="pbm-header-icon"><IconSend size={22} /></div>
          <h2 className="pbm-title">{categoryLabel} Public Booking Request</h2>
        </div>

        {loadingClient ? (
          <div className="pbm-loading">Loading your details…</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {client?.fullName && (
              <div className="booking-client-strip">
                Booking as <strong>{client.fullName}</strong>{client.username ? ` (${client.username})` : ''}
              </div>
            )}

            <div className="booking-form-grid">
              {/* Date */}
              <div className="bf-group">
                <label className="bf-label">
                  <IconCalendar size={17} style={{ marginRight: 6 }} />
                  Service Date <span className="bf-required">*</span>
                </label>
                <input type="date" name="serviceDate" min={today} value={form.serviceDate} onChange={handleChange} className="bf-input" required />
              </div>

              {/* Time */}
              <div className="bf-group">
                <label className="bf-label">
                  <IconClock size={17} style={{ marginRight: 6 }} />
                  Service Time <span className="bf-required">*</span>
                </label>
                <div className="bf-time-subrow">
                  <span className="bf-time-subrow-label">Start</span>
                  <div className="bf-time-row">
                    <select name="startHour" value={form.startHour} onChange={handleChange} className="bf-input bf-select">
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select name="startMinute" value={form.startMinute} onChange={handleChange} className="bf-input bf-select">
                      {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select name="startAmpm" value={form.startAmpm} onChange={handleChange} className="bf-input bf-select bf-select-ampm">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="bf-time-subrow">
                  <span className="bf-time-subrow-label">End</span>
                  <div className="bf-time-row">
                    <select name="endHour" value={form.endHour} onChange={handleChange} className="bf-input bf-select">
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select name="endMinute" value={form.endMinute} onChange={handleChange} className="bf-input bf-select">
                      {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select name="endAmpm" value={form.endAmpm} onChange={handleChange} className="bf-input bf-select bf-select-ampm">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bf-group bf-group-full">
                <label className="bf-label">
                  <IconMapPin size={17} style={{ marginRight: 6 }} />
                  Service Location
                </label>

                <div className="bf-location-modes">
                  {hasPrimaryLocation && (
                    <button
                      type="button"
                      className={`bf-loc-mode-btn${locationMode === 'primary' ? ' bf-loc-mode-active' : ''}`}
                      onClick={() => setLocationMode('primary')}
                    >
                      Primary Location
                    </button>
                  )}
                  {hasSecondaryLocation && (
                    <button
                      type="button"
                      className={`bf-loc-mode-btn${locationMode === 'secondary' ? ' bf-loc-mode-active' : ''}`}
                      onClick={() => setLocationMode('secondary')}
                    >
                      Secondary Location
                    </button>
                  )}
                  <button
                    type="button"
                    className={`bf-loc-mode-btn${locationMode === 'custom' ? ' bf-loc-mode-active' : ''}`}
                    onClick={() => setLocationMode('custom')}
                  >
                    Drop a Pin
                  </button>
                </div>

                {locationMode === 'custom' ? (
                  <div className="bf-location-custom">
                    <input
                      type="text"
                      placeholder="Address for this location"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="bf-input"
                      style={{ marginBottom: 'var(--space-sm)' }}
                    />
                    <MapPicker
                      latitude={customPosition?.latitude}
                      longitude={customPosition?.longitude}
                      onChange={setCustomPosition}
                      draggable
                      height={220}
                    />
                  </div>
                ) : (
                  <div className={`bf-location-display${hasEffectiveLocation ? '' : ' bf-location-warn'}`}>
                    <div className="bf-location-text">
                      {hasEffectiveLocation
                        ? (effectiveLocation.addressText ?? `${effectiveLocation.latitude?.toFixed(5)}, ${effectiveLocation.longitude?.toFixed(5)}`)
                        : 'No location set — please add it in your Client Profile.'}
                    </div>
                    <Link to={ROUTES.CLIENT_PROFILE} className="bf-loc-alt-btn">
                      <IconMapPin size={14} style={{ marginRight: 4 }} />
                      Change in Profile
                    </Link>
                  </div>
                )}
              </div>

              {/* Job description */}
              <div className="bf-group bf-group-full">
                <label className="bf-label">Job Description <span className="bf-required">*</span></label>
                <textarea
                  name="jobDescription"
                  rows={3}
                  maxLength={1000}
                  placeholder="Describe what you need done (at least 10 characters)..."
                  value={form.jobDescription}
                  onChange={handleChange}
                  className="bf-input bf-textarea"
                  required
                />
                <div className={`bf-hint${form.jobDescription.length > 0 && form.jobDescription.length < 10 ? ' bf-hint-warn' : ''}`}>
                  {form.jobDescription.length}/1000
                </div>
              </div>

              {/* Photos */}
              <div className="bf-group bf-group-full">
                <label className="bf-label">
                  <IconImage size={17} style={{ marginRight: 6 }} />
                  Job Photos <span style={{ color: 'var(--color-neutral-400)', fontWeight: 400 }}>(up to 3, optional)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handlePhotosChange}
                  style={{ display: 'none' }}
                />
                <button type="button" className="bf-upload-btn" onClick={() => fileInputRef.current?.click()}>
                  <IconImage size={19} style={{ color: 'var(--color-primary-600)' }} />
                  {photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? 's' : ''} selected — click to change` : 'Choose Photos'}
                </button>

                {photoUrls.length > 0 && (
                  <div className="bf-photo-previews">
                    {photoUrls.map((url, i) => (
                      <div key={url} className="bf-photo-thumb">
                        <img src={url} alt={`Preview ${i + 1}`} />
                        <button type="button" className="bf-photo-remove" onClick={() => removePhoto(i)} aria-label="Remove photo">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && <div className="bf-error">{error}</div>}

            {/* Confirm booking section */}
            <div className="pbm-confirm">
              <p className="pbm-confirm-note">
                This request will be broadcast to every verified {categoryLabel} provider in your area.
                This booking request will be a first come - first served request for the service providers.
              </p>
              <div className="pbm-actions">
                <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-shine" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Public Booking Request'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .pbm-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55);
          display: flex; align-items: flex-start; justify-content: center;
          z-index: 9999; padding: var(--space-2xl) var(--space-lg);
          overflow-y: auto;
        }
        .pbm-modal {
          position: relative; background: white; border-radius: var(--radius-xl);
          max-width: 720px; width: 100%; box-shadow: 0 24px 70px rgba(0,0,0,0.28);
          animation: hh-scale-in 0.22s ease;
        }
        @keyframes hh-scale-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

        .pbm-close {
          position: absolute; top: 14px; right: 14px; z-index: 2;
          background: none; border: none; padding: 2px; cursor: pointer;
          color: var(--color-neutral-400); display: flex; border-radius: 50%;
          transition: color var(--transition-base), background-color var(--transition-base);
        }
        .pbm-close:hover { color: var(--color-neutral-600); background: var(--color-neutral-100); }

        .pbm-header {
          display: flex; align-items: center; gap: 14px;
          padding: var(--space-lg) var(--space-2xl);
          border-bottom: 1px solid var(--color-neutral-200);
          background: linear-gradient(135deg, var(--color-primary-50), white);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        }
        .pbm-header-icon {
          flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%;
          background: var(--color-primary-600); color: white;
          display: flex; align-items: center; justify-content: center;
        }
        .pbm-title { margin: 0; font-size: var(--font-size-xl); font-weight: 700; color: var(--color-secondary-700); line-height: 1.3; }
        .pbm-loading { padding: var(--space-2xl); text-align: center; color: var(--color-neutral-500); }

        .booking-client-strip {
          padding: 10px var(--space-2xl); background: var(--color-neutral-50);
          border-bottom: 1px solid var(--color-neutral-200);
          font-size: var(--font-size-sm); color: var(--color-neutral-600);
        }
        .booking-client-strip strong { color: var(--color-secondary-700); }
        .booking-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); padding: var(--space-xl) var(--space-2xl); }
        @media (max-width: 600px) { .booking-form-grid { grid-template-columns: 1fr; } }
        .bf-group-full { grid-column: 1 / -1; }
        .bf-label { display: flex; align-items: center; font-weight: 600; color: var(--color-secondary-700); margin-bottom: 6px; font-size: var(--font-size-sm); }
        .bf-required { color: var(--color-error); margin-left: 2px; }
        .bf-input {
          width: 100%; padding: 12px 17px; border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: inherit;
          outline: none; transition: border-color var(--transition-base);
          background: white; color: var(--color-text); box-sizing: border-box;
        }
        .bf-input:focus { border-color: var(--color-primary-500); }
        .bf-textarea { resize: vertical; }
        .bf-time-subrow { display: flex; align-items: center; gap: 10px; }
        .bf-time-subrow + .bf-time-subrow { margin-top: 8px; }
        .bf-time-subrow-label { flex: 0 0 34px; font-size: var(--font-size-xs); font-weight: 600; color: var(--color-neutral-500); }
        .bf-time-row { display: flex; gap: 8px; flex: 1; }
        .bf-select { flex: 1 1 0; min-width: 0; padding-left: 10px; padding-right: 6px; cursor: pointer; }
        .bf-select-ampm { flex: 0 0 78px; font-weight: 600; padding-left: 8px; padding-right: 6px; }
        .bf-hint { margin-top: 4px; font-size: var(--font-size-xs); color: var(--color-neutral-500); text-align: right; }
        .bf-hint-warn { color: var(--color-error); }

        .bf-location-modes { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: var(--space-sm); }
        .bf-loc-mode-btn {
          padding: 7px 16px; border-radius: var(--radius-full);
          border: 1.5px solid var(--color-neutral-200); background: white;
          color: var(--color-neutral-600); font-size: var(--font-size-xs); font-weight: 600;
          cursor: pointer; font-family: inherit; transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .bf-loc-mode-btn:hover { border-color: var(--color-primary-400); }
        .bf-loc-mode-active { background: var(--color-primary-600); border-color: var(--color-primary-600); color: white; }
        .bf-location-custom { display: flex; flex-direction: column; }
        .bf-location-display {
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; padding: 12px 17px;
          background: var(--color-neutral-50); border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); flex-wrap: wrap;
        }
        .bf-location-display.bf-location-warn { background: #fffbeb; border-color: #fde68a; }
        .bf-location-text { font-size: var(--font-size-sm); color: var(--color-neutral-600); flex: 1; }
        .bf-loc-alt-btn {
          display: flex; align-items: center; padding: 6px 14px;
          background: var(--color-primary-600); color: white; border: none;
          border-radius: var(--radius-md); font-size: var(--font-size-xs); font-weight: 600;
          cursor: pointer; white-space: nowrap; font-family: inherit; text-decoration: none;
        }
        .bf-loc-alt-btn:hover { background: var(--color-primary-700); }

        .bf-upload-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 22px; background: var(--color-primary-50);
          border: 1.5px dashed var(--color-primary-300); border-radius: var(--radius-md);
          font-size: var(--font-size-sm); font-weight: 600; color: var(--color-primary-700);
          cursor: pointer; font-family: inherit; transition: background 0.15s, border-color 0.15s;
          width: 100%;
        }
        .bf-upload-btn:hover { background: var(--color-primary-100); border-color: var(--color-primary-500); }

        .bf-photo-previews { display: flex; gap: 14px; margin-top: 14px; flex-wrap: wrap; }
        .bf-photo-thumb { position: relative; width: 96px; height: 96px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid var(--color-primary-200); }
        .bf-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .bf-photo-remove {
          position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%;
          background: rgba(0,0,0,0.65); color: white; border: none; font-size: 17px; line-height: 1;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }

        .bf-error { margin: 0 var(--space-2xl) var(--space-md); padding: 10px 14px; background: var(--color-error-bg); color: var(--color-error); border-radius: var(--radius-md); font-size: var(--font-size-sm); }

        .pbm-confirm {
          padding: var(--space-lg) var(--space-2xl) var(--space-xl);
          border-top: 1px solid var(--color-neutral-200); background: var(--color-neutral-50);
          border-radius: 0 0 var(--radius-xl) var(--radius-xl);
        }
        .pbm-confirm-note { margin: 0 0 var(--space-md); font-size: var(--font-size-sm); color: var(--color-neutral-500); line-height: 1.6; }
        .pbm-actions { display: flex; gap: var(--space-md); justify-content: flex-end; }

        @media (max-width: 480px) {
          .pbm-header { padding: var(--space-lg) var(--space-lg) var(--space-md); }
          .booking-form-grid { padding: var(--space-lg); }
          .booking-client-strip { padding: 10px var(--space-lg); }
          .pbm-confirm { padding: var(--space-md) var(--space-lg) var(--space-lg); }
          .pbm-actions { flex-direction: column-reverse; }
          .pbm-actions .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
