import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { bookingApi } from '../bookingApi.js';
import MapPicker from '../../../components/common/MapPicker.jsx';
import { IconCalendar, IconClock, IconMapPin, IconCheckCircle, IconImage } from '../../../components/common/icons.jsx';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '15', '30', '45'];

function buildScheduledAt(date, hour, minute, ampm) {
  let h = parseInt(hour, 10);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return new Date(`${date}T${String(h).padStart(2, '0')}:${minute}:00`).toISOString();
}

export default function BookingForm({ provider, client }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({ serviceDate: '', hour: '9', minute: '00', ampm: 'AM', jobDescription: '' });
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Custom location state (for this booking only — does NOT change profile)
  const [useCustomLoc, setUseCustomLoc] = useState(false);
  const [customCoords, setCustomCoords] = useState(null);
  const [customAddress, setCustomAddress] = useState('');
  const [locSaved, setLocSaved] = useState(false);

  const profileLocation = client?.location;
  const hasProfileLocation = profileLocation?.latitude != null;

  // Effective location shown / submitted
  const effectiveLocation = useCustomLoc && locSaved && customCoords
    ? { ...customCoords, addressText: customAddress.trim() || `${customCoords.latitude.toFixed(5)}, ${customCoords.longitude.toFixed(5)}` }
    : profileLocation;
  const hasEffectiveLocation = effectiveLocation?.latitude != null;

  // Revoke object URLs when photos change to avoid memory leaks
  useEffect(() => {
    return () => photoUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [photoUrls]);

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

  function handleSaveCustomLocation() {
    if (!customCoords) {
      setError('Please click the map to pin your location first.');
      return;
    }
    setLocSaved(true);
    setUseCustomLoc(true);
    setError('');
  }

  function handleCancelCustomLocation() {
    setUseCustomLoc(false);
    setLocSaved(false);
    setCustomCoords(null);
    setCustomAddress('');
  }

  function handleRequestConfirm(e) {
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
    if (!hasEffectiveLocation) {
      setError('Please set your location in your profile or choose a different location below.');
      return;
    }
    setShowConfirm(true);
  }

  async function handleConfirmedSubmit() {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const scheduledAt = buildScheduledAt(form.serviceDate, form.hour, form.minute, form.ampm);
      const formData = new FormData();
      formData.append('providerUserId', provider.providerId ?? provider.id);
      formData.append('serviceCategoryId', provider.serviceCategoryId ?? provider.categoryId);
      formData.append('jobDescription', form.jobDescription);
      formData.append('scheduledAt', scheduledAt);
      if (effectiveLocation?.latitude) {
        formData.append('locationLatitude', effectiveLocation.latitude);
        formData.append('locationLongitude', effectiveLocation.longitude);
        formData.append('locationAddress', effectiveLocation.addressText ?? '');
      }
      photos.forEach((file) => formData.append('jobPhotos', file));

      const res = await bookingApi.createBooking(formData);
      const bookingId = res.data?.data?.bookingId ?? res.data?.bookingId;
      navigate(ROUTES.CLIENT_BOOKING_SENT, { state: { bookingId } });
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const formattedTime = `${form.hour}:${form.minute} ${form.ampm}`;

  return (
    <>
      <form className="booking-form" onSubmit={handleRequestConfirm}>
        {/* Provider strip */}
        <div className="booking-provider-strip">
          <div className="bps-avatar">
            {provider.profilePhoto
              ? <img src={provider.profilePhoto} alt="" />
              : <span>{(provider.name ?? 'P')[0]}</span>}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-secondary-700)' }}>{provider.name}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>{provider.category}</div>
          </div>
          {provider.hourlyRate && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>Estimated Rate</div>
              <div style={{ fontWeight: 700, color: 'var(--color-primary-700)', fontSize: 'var(--font-size-lg)' }}>
                Rs. {provider.hourlyRate}/hr
              </div>
            </div>
          )}
        </div>

        <div className="booking-form-grid">
          {/* Date */}
          <div className="bf-group">
            <label className="bf-label">
              <IconCalendar size={14} style={{ marginRight: 6 }} />
              Service Date <span className="bf-required">*</span>
            </label>
            <input type="date" name="serviceDate" min={today} value={form.serviceDate} onChange={handleChange} className="bf-input" required />
          </div>

          {/* Time */}
          <div className="bf-group">
            <label className="bf-label">
              <IconClock size={14} style={{ marginRight: 6 }} />
              Service Time <span className="bf-required">*</span>
            </label>
            <div className="bf-time-row">
              <select name="hour" value={form.hour} onChange={handleChange} className="bf-input bf-select">
                {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <select name="minute" value={form.minute} onChange={handleChange} className="bf-input bf-select">
                {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select name="ampm" value={form.ampm} onChange={handleChange} className="bf-input bf-select bf-select-ampm">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="bf-group bf-group-full">
            <label className="bf-label">
              <IconMapPin size={14} style={{ marginRight: 6 }} />
              Service Location
            </label>

            {/* Profile location display */}
            <div className={`bf-location-display${hasEffectiveLocation ? '' : ' bf-location-warn'}`}>
              <div className="bf-location-text">
                {hasEffectiveLocation
                  ? (effectiveLocation.addressText ?? `${effectiveLocation.latitude?.toFixed(5)}, ${effectiveLocation.longitude?.toFixed(5)}`)
                  : 'No location set — please update your Profile or use a different location below.'}
              </div>
              {hasProfileLocation && !useCustomLoc && (
                <button
                  type="button"
                  className="bf-loc-alt-btn"
                  onClick={() => { setUseCustomLoc(true); setLocSaved(false); }}
                >
                  <IconMapPin size={12} style={{ marginRight: 4 }} />
                  Use Different Location
                </button>
              )}
              {useCustomLoc && locSaved && (
                <button type="button" className="bf-loc-cancel-btn" onClick={handleCancelCustomLocation}>
                  Use Profile Location
                </button>
              )}
            </div>

            {/* Inline map for custom location (expanded when button clicked) */}
            {useCustomLoc && !locSaved && (
              <div className="bf-custom-loc">
                <p className="bf-custom-loc-hint">
                  Pin the exact location for this booking. This will not change your profile location.
                </p>
                <MapPicker
                  latitude={profileLocation?.latitude}
                  longitude={profileLocation?.longitude}
                  height={260}
                  draggable
                  onChange={(coords) => setCustomCoords(coords)}
                />
                <div className="bf-custom-loc-addr">
                  <label className="bf-label" style={{ marginBottom: 6 }}>Address / Landmark</label>
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="bf-input"
                    placeholder="e.g. 14 Flower Road, Colombo 03"
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn btn-primary" onClick={handleSaveCustomLocation}>
                    Save This Location
                  </button>
                  <button type="button" className="btn btn-outline" onClick={handleCancelCustomLocation}>
                    Cancel
                  </button>
                </div>
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

          {/* Photos — styled upload button + thumbnails */}
          <div className="bf-group bf-group-full">
            <label className="bf-label">
              <IconImage size={14} style={{ marginRight: 6 }} />
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
            <button
              type="button"
              className="bf-upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconImage size={16} style={{ color: 'var(--color-primary-600)' }} />
              {photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? 's' : ''} selected — click to change` : 'Choose Photos'}
            </button>

            {/* Preview thumbnails */}
            {photoUrls.length > 0 && (
              <div className="bf-photo-previews">
                {photoUrls.map((url, i) => (
                  <div key={url} className="bf-photo-thumb">
                    <img src={url} alt={`Preview ${i + 1}`} />
                    <button
                      type="button"
                      className="bf-photo-remove"
                      onClick={() => removePhoto(i)}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <div className="bf-error">{error}</div>}

        <div className="bf-actions">
          <button type="button" className="btn btn-outline" onClick={() => window.history.back()}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-shine" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Review & Confirm'}
          </button>
        </div>

        <style>{`
          .booking-form { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-neutral-200); overflow: hidden; }
          .booking-provider-strip {
            display: flex; align-items: center; gap: var(--space-md);
            padding: var(--space-lg); background: var(--color-primary-50);
            border-bottom: 1px solid var(--color-neutral-200);
          }
          .bps-avatar {
            width: 52px; height: 52px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
            background: var(--color-primary-200); display: flex; align-items: center;
            justify-content: center; font-size: 1.25rem; font-weight: 700; color: var(--color-primary-700);
          }
          .bps-avatar img { width: 100%; height: 100%; object-fit: cover; }
          .booking-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); padding: var(--space-xl); }
          @media (max-width: 600px) { .booking-form-grid { grid-template-columns: 1fr; } }
          .bf-group-full { grid-column: 1 / -1; }
          .bf-label { display: flex; align-items: center; font-weight: 600; color: var(--color-secondary-700); margin-bottom: 6px; font-size: var(--font-size-sm); }
          .bf-required { color: var(--color-error); margin-left: 2px; }
          .bf-input {
            width: 100%; padding: 10px 14px; border: 1.5px solid var(--color-neutral-200);
            border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: inherit;
            outline: none; transition: border-color var(--transition-base);
            background: white; color: var(--color-text); box-sizing: border-box;
          }
          .bf-input:focus { border-color: var(--color-primary-500); }
          .bf-textarea { resize: vertical; }
          .bf-time-row { display: flex; gap: 8px; }
          .bf-select { flex: 1; padding-left: 10px; padding-right: 10px; cursor: pointer; }
          .bf-select-ampm { flex: 0 0 70px; font-weight: 600; }
          .bf-hint { margin-top: 4px; font-size: var(--font-size-xs); color: var(--color-neutral-500); text-align: right; }
          .bf-hint-warn { color: var(--color-error); }

          /* Location */
          .bf-location-display {
            display: flex; align-items: center; justify-content: space-between;
            gap: 12px; padding: 10px 14px;
            background: var(--color-neutral-50); border: 1.5px solid var(--color-neutral-200);
            border-radius: var(--radius-md); flex-wrap: wrap;
          }
          .bf-location-display.bf-location-warn { background: #fffbeb; border-color: #fde68a; }
          .bf-location-text { font-size: var(--font-size-sm); color: var(--color-neutral-600); flex: 1; }
          .bf-loc-alt-btn {
            display: flex; align-items: center; padding: 5px 12px;
            background: var(--color-primary-600); color: white; border: none;
            border-radius: var(--radius-md); font-size: var(--font-size-xs); font-weight: 600;
            cursor: pointer; white-space: nowrap; font-family: inherit;
          }
          .bf-loc-alt-btn:hover { background: var(--color-primary-700); }
          .bf-loc-cancel-btn {
            padding: 5px 12px; background: none; border: 1.5px solid var(--color-neutral-300);
            border-radius: var(--radius-md); font-size: var(--font-size-xs); font-weight: 600;
            color: var(--color-neutral-600); cursor: pointer; white-space: nowrap; font-family: inherit;
          }
          .bf-loc-cancel-btn:hover { border-color: var(--color-primary-400); color: var(--color-primary-700); }
          .bf-custom-loc {
            margin-top: var(--space-md); padding: var(--space-lg);
            background: var(--color-neutral-50); border: 1.5px solid var(--color-primary-200);
            border-radius: var(--radius-md);
          }
          .bf-custom-loc-hint { font-size: var(--font-size-xs); color: var(--color-neutral-500); margin-bottom: var(--space-md); }
          .bf-custom-loc-addr { margin-top: var(--space-md); }

          /* Upload button */
          .bf-upload-btn {
            display: flex; align-items: center; gap: 8px;
            padding: 10px 18px; background: var(--color-primary-50);
            border: 1.5px dashed var(--color-primary-300); border-radius: var(--radius-md);
            font-size: var(--font-size-sm); font-weight: 600; color: var(--color-primary-700);
            cursor: pointer; font-family: inherit; transition: background 0.15s, border-color 0.15s;
            width: 100%;
          }
          .bf-upload-btn:hover { background: var(--color-primary-100); border-color: var(--color-primary-500); }

          /* Photo previews */
          .bf-photo-previews { display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
          .bf-photo-thumb {
            position: relative; width: 90px; height: 90px;
            border-radius: var(--radius-md); overflow: hidden;
            border: 2px solid var(--color-primary-200);
          }
          .bf-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
          .bf-photo-remove {
            position: absolute; top: 3px; right: 3px;
            width: 20px; height: 20px; border-radius: 50%;
            background: rgba(0,0,0,0.65); color: white;
            border: none; font-size: 14px; line-height: 1; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
          }

          .bf-error { margin: 0 var(--space-xl) var(--space-md); padding: 10px 14px; background: var(--color-error-bg); color: var(--color-error); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
          .bf-actions { display: flex; gap: var(--space-md); justify-content: flex-end; padding: 0 var(--space-xl) var(--space-xl); }
        `}</style>
      </form>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="bf-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="bf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bf-modal-icon">
              <IconCheckCircle size={40} style={{ color: 'var(--color-primary-600)' }} />
            </div>
            <h2 className="bf-modal-title">Confirm Your Booking</h2>
            <div className="bf-modal-details">
              <div className="bf-modal-row"><span>Provider</span><strong>{provider.name}</strong></div>
              <div className="bf-modal-row"><span>Service</span><strong>{provider.category}</strong></div>
              <div className="bf-modal-row">
                <span>Date</span>
                <strong>{new Date(form.serviceDate).toLocaleDateString('en-LK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong>
              </div>
              <div className="bf-modal-row"><span>Time</span><strong>{formattedTime}</strong></div>
              <div className="bf-modal-row">
                <span>Location</span>
                <strong style={{ maxWidth: 200, textAlign: 'right', wordBreak: 'break-word' }}>
                  {effectiveLocation?.addressText ?? `${effectiveLocation?.latitude?.toFixed(4)}, ${effectiveLocation?.longitude?.toFixed(4)}`}
                </strong>
              </div>
              {provider.hourlyRate && (
                <div className="bf-modal-row"><span>Rate</span><strong>Rs. {provider.hourlyRate}/hr</strong></div>
              )}
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
              The provider will review and respond within 24 hours.
            </p>
            <div className="bf-modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowConfirm(false)}>Go Back</button>
              <button type="button" className="btn btn-primary btn-shine" disabled={submitting} onClick={handleConfirmedSubmit}>
                {submitting ? 'Submitting…' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bf-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: var(--space-lg);
        }
        .bf-modal {
          background: white; border-radius: var(--radius-xl);
          padding: var(--space-2xl); max-width: 460px; width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .bf-modal-icon { display: flex; justify-content: center; margin-bottom: var(--space-lg); }
        .bf-modal-title { text-align: center; font-size: var(--font-size-xl); color: var(--color-secondary-700); margin-bottom: var(--space-lg); font-weight: 700; }
        .bf-modal-details { background: var(--color-neutral-50); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); display: flex; flex-direction: column; gap: 10px; }
        .bf-modal-row { display: flex; justify-content: space-between; font-size: var(--font-size-sm); gap: 12px; }
        .bf-modal-row span { color: var(--color-neutral-500); flex-shrink: 0; }
        .bf-modal-row strong { color: var(--color-secondary-700); }
        .bf-modal-actions { display: flex; gap: var(--space-md); justify-content: center; }
      `}</style>
    </>
  );
}
