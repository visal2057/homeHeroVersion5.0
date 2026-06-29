import { useState, useEffect } from 'react';

const SERVICE_CATEGORIES = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting',
  'Cleaning', 'Gardening', 'AC Repair', 'Roofing',
  'Tiling', 'Pest Control',
];

export default function ProviderProfileForm({ profile, onSave, saving, error, success }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    service_categories: [],
    experience_years: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name:               profile.name               ?? '',
        phone:              profile.phone              ?? '',
        location:           profile.location           ?? '',
        bio:                profile.bio                ?? '',
        service_categories: profile.service_categories ?? [],
        experience_years:   profile.experience_years   ?? '',
      });
    }
  }, [profile]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toggleCategory(cat) {
    setForm((f) => {
      const selected = f.service_categories;
      if (selected.includes(cat)) {
        return { ...f, service_categories: selected.filter((c) => c !== cat) };
      }
      if (selected.length >= 2) return f; // max 2
      return { ...f, service_categories: [...selected, cat] };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const initials = form.name
    ? form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SP';

  return (
    <form onSubmit={handleSubmit}>
      {/* Avatar */}
      <div className="provider-avatar-upload">
        <div className="provider-avatar-placeholder">{initials}</div>
        <div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-secondary-700)' }}>
            Profile Photo
          </p>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Avatar upload coming soon
          </p>
        </div>
      </div>

      {error && <div className="provider-alert error">⚠️ {error}</div>}
      {success && <div className="provider-alert success">✓ {success}</div>}

      <div className="provider-form-grid">
        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="pf-name">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="pf-name"
            name="name"
            className="provider-form-input"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="pf-email">Email</label>
          <input
            id="pf-email"
            className="provider-form-input"
            value={profile?.email ?? ''}
            disabled
            title="Email cannot be changed"
          />
          <span className="provider-form-hint">Email address cannot be changed.</span>
        </div>

        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="pf-phone">Phone</label>
          <input
            id="pf-phone"
            name="phone"
            className="provider-form-input"
            value={form.phone}
            onChange={handleChange}
            type="tel"
          />
        </div>

        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="pf-location">Location</label>
          <input
            id="pf-location"
            name="location"
            className="provider-form-input"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Colombo, Western Province"
          />
        </div>

        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="pf-exp">Years of Experience</label>
          <input
            id="pf-exp"
            name="experience_years"
            className="provider-form-input"
            value={form.experience_years}
            onChange={handleChange}
            type="number"
            min="0"
            max="60"
          />
        </div>

        <div className="provider-form-group full">
          <label className="provider-form-label" htmlFor="pf-bio">Bio / About</label>
          <textarea
            id="pf-bio"
            name="bio"
            className="provider-form-textarea"
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell clients a bit about yourself and your experience..."
          />
        </div>

        <div className="provider-form-group full">
          <label className="provider-form-label">
            Service Categories <span className="required">*</span>
            <span className="provider-form-hint" style={{ marginLeft: 8 }}>
              (max 2 selected: {form.service_categories.length}/2)
            </span>
          </label>
          <div className="provider-category-grid">
            {SERVICE_CATEGORIES.map((cat) => {
              const selected = form.service_categories.includes(cat);
              const disabled = !selected && form.service_categories.length >= 2;
              return (
                <label
                  key={cat}
                  className={`provider-category-chip${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
                  style={disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={disabled}
                    onChange={() => toggleCategory(cat)}
                    style={{ display: 'none' }}
                  />
                  {selected ? '✓ ' : ''}{cat}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <span className="btn-spinner" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
