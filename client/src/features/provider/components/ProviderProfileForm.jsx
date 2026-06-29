import { useState, useEffect } from 'react';
import { providerApi } from '../providerApi.js';

export default function ProviderProfileForm({ profile, onSave, saving, error, success }) {
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    bio: '',
    workHoursDetails: '',
    hourlyChargeEstimate: '',
    homeDistrictId: '',
    serviceDistrictId: '',
    serviceCategoryIds: [],
  });

  useEffect(() => {
    Promise.all([providerApi.getDistricts(), providerApi.getServiceCategories()])
      .then(([districtsRes, categoriesRes]) => {
        setDistricts(districtsRes.data?.data ?? []);
        setCategories(categoriesRes.data?.data ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
        workHoursDetails: profile.workHoursDetails ?? '',
        hourlyChargeEstimate: profile.hourlyChargeEstimate ?? '',
        homeDistrictId: profile.homeDistrictId ?? '',
        serviceDistrictId: profile.serviceDistrictId ?? '',
        serviceCategoryIds: profile.categories?.map((c) => c.serviceCategoryId) ?? [],
      });
    }
  }, [profile]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toggleCategory(categoryId) {
    setForm((f) => {
      const selected = f.serviceCategoryIds;
      if (selected.includes(categoryId)) {
        return { ...f, serviceCategoryIds: selected.filter((id) => id !== categoryId) };
      }
      if (selected.length >= 2) return f; // max 2
      return { ...f, serviceCategoryIds: [...selected, categoryId] };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, hourlyChargeEstimate: Number(form.hourlyChargeEstimate) });
  }

  const initials = form.fullName
    ? form.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SP';

  return (
    <form onSubmit={handleSubmit}>
      <div className="provider-avatar-upload">
        <div className="provider-avatar-placeholder">{initials}</div>
        <div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-secondary-700)' }}>
            Profile Photo
          </p>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Token: {profile?.userToken ?? '—'}
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
            name="fullName"
            className="provider-form-input"
            value={form.fullName}
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
          <label className="provider-form-label" htmlFor="pf-phone">Phone <span className="required">*</span></label>
          <input
            id="pf-phone"
            name="phone"
            className="provider-form-input"
            value={form.phone}
            onChange={handleChange}
            type="tel"
            required
          />
        </div>

        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="pf-rate">Hourly Charge (LKR) <span className="required">*</span></label>
          <input
            id="pf-rate"
            name="hourlyChargeEstimate"
            className="provider-form-input"
            value={form.hourlyChargeEstimate}
            onChange={handleChange}
            type="number"
            min="0"
            required
          />
        </div>

        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="pf-home-district">District <span className="required">*</span></label>
          <select id="pf-home-district" name="homeDistrictId" className="provider-form-input" value={form.homeDistrictId} onChange={handleChange} required>
            <option value="">Select district...</option>
            {districts.map((d) => (
              <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
            ))}
          </select>
        </div>

        <div className="provider-form-group">
          <label className="provider-form-label" htmlFor="pf-service-district">Service Area <span className="required">*</span></label>
          <select id="pf-service-district" name="serviceDistrictId" className="provider-form-input" value={form.serviceDistrictId} onChange={handleChange} required>
            <option value="">Select district...</option>
            {districts.map((d) => (
              <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
            ))}
          </select>
        </div>

        <div className="provider-form-group full">
          <label className="provider-form-label" htmlFor="pf-hours">Work Hours &amp; Details <span className="required">*</span></label>
          <input
            id="pf-hours"
            name="workHoursDetails"
            className="provider-form-input"
            value={form.workHoursDetails}
            onChange={handleChange}
            placeholder="e.g. Mon-Sat 7am-5pm"
            required
          />
        </div>

        <div className="provider-form-group full">
          <label className="provider-form-label" htmlFor="pf-bio">Bio / About <span className="required">*</span></label>
          <textarea
            id="pf-bio"
            name="bio"
            className="provider-form-textarea"
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell clients a bit about yourself and your experience..."
            required
          />
        </div>

        <div className="provider-form-group full">
          <label className="provider-form-label">
            Service Categories <span className="required">*</span>
            <span className="provider-form-hint" style={{ marginLeft: 8 }}>
              (max 2 selected: {form.serviceCategoryIds.length}/2)
            </span>
          </label>
          <div className="provider-category-grid">
            {categories.map((cat) => {
              const selected = form.serviceCategoryIds.includes(cat.service_category_id);
              const disabled = !selected && form.serviceCategoryIds.length >= 2;
              return (
                <label
                  key={cat.service_category_id}
                  className={`provider-category-chip${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
                  style={disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={disabled}
                    onChange={() => toggleCategory(cat.service_category_id)}
                    style={{ display: 'none' }}
                  />
                  {selected ? '✓ ' : ''}{cat.category_name}
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
