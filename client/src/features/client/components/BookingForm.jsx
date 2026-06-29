import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { bookingApi } from '../bookingApi.js';

export default function BookingForm({ provider, client }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    serviceDate: '',
    serviceTime: '',
    jobDescription: '',
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasLocation = client?.location?.latitude != null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handlePhotosChange(e) {
    setPhotos(Array.from(e.target.files ?? []).slice(0, 3));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.serviceDate || !form.serviceTime || !form.jobDescription) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!hasLocation) {
      setError('Please set your location in your profile before booking.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('providerUserId', provider.providerId ?? provider.id);
      formData.append('serviceCategoryId', provider.serviceCategoryId ?? provider.categoryId);
      formData.append('jobDescription', form.jobDescription);
      formData.append('scheduledAt', new Date(`${form.serviceDate}T${form.serviceTime}`).toISOString());
      photos.forEach((file) => formData.append('jobPhotos', file));

      await bookingApi.createBooking(formData);
      navigate(ROUTES.CLIENT_BOOKING_SENT);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      {/* Auto-filled provider info */}
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
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>Estimated Rate</div>
            <div style={{ fontWeight: 700, color: 'var(--color-primary-700)', fontSize: 'var(--font-size-lg)' }}>Rs. {provider.hourlyRate}/hr</div>
          </div>
        )}
      </div>

      <div className="booking-form-grid">
        <div className="bf-group">
          <label className="bf-label">Service Date <span className="bf-required">*</span></label>
          <input type="date" name="serviceDate" min={today} value={form.serviceDate} onChange={handleChange} className="bf-input" required />
        </div>
        <div className="bf-group">
          <label className="bf-label">Service Time <span className="bf-required">*</span></label>
          <input type="time" name="serviceTime" value={form.serviceTime} onChange={handleChange} className="bf-input" required />
        </div>

        <div className="bf-group bf-group-full">
          <label className="bf-label">Your Location</label>
          <div className="bf-input" style={{ background: 'var(--color-neutral-50)', color: 'var(--color-neutral-600)' }}>
            {hasLocation
              ? client.location.addressText ?? `${client.location.latitude}, ${client.location.longitude}`
              : 'No location saved — please set it on your Profile page first.'}
          </div>
        </div>

        <div className="bf-group bf-group-full">
          <label className="bf-label">Job Description <span className="bf-required">*</span></label>
          <textarea name="jobDescription" rows={3} placeholder="Describe what you need done..." value={form.jobDescription} onChange={handleChange} className="bf-input bf-textarea" required />
        </div>

        <div className="bf-group bf-group-full">
          <label className="bf-label">Job Photos (up to 3)</label>
          <input type="file" accept="image/jpeg,image/png" multiple onChange={handlePhotosChange} className="bf-input" />
        </div>
      </div>

      {error && <div className="bf-error">{error}</div>}

      <div className="bf-actions">
        <button type="button" className="btn btn-outline" onClick={() => window.history.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-shine" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Confirm Booking Request'}
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
        .booking-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);
          padding: var(--space-xl);
        }
        @media (max-width: 600px) { .booking-form-grid { grid-template-columns: 1fr; } }
        .bf-group-full { grid-column: 1 / -1; }
        .bf-label { display: block; font-weight: 600; color: var(--color-secondary-700); margin-bottom: 6px; font-size: var(--font-size-sm); }
        .bf-required { color: var(--color-error); }
        .bf-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid var(--color-neutral-200);
          border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: inherit;
          outline: none; transition: border-color var(--transition-base);
          background: white; color: var(--color-text); box-sizing: border-box;
        }
        .bf-input:focus { border-color: var(--color-primary-500); }
        .bf-textarea { resize: vertical; }
        .bf-error { margin: 0 var(--space-xl) var(--space-md); padding: 10px 14px; background: var(--color-error-bg); color: var(--color-error); border-radius: var(--radius-md); font-size: var(--font-size-sm); }
        .bf-actions { display: flex; gap: var(--space-md); justify-content: flex-end; padding: 0 var(--space-xl) var(--space-xl); }
      `}</style>
    </form>
  );
}
