import { useState, useEffect, useRef } from 'react';
import { providerApi } from '../providerApi.js';
import { getAssetUrl } from '../../../utils/storageUtils.js';
import { IconCheck, IconImage } from '../../../components/common/icons.jsx';
import AlertMessage from '../../../components/common/AlertMessage.jsx';

function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.newPassword !== form.confirmNewPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await providerApi.changePassword(form);
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not update password. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="provider-card" style={{ marginTop: 'var(--space-xl)' }}>
      <div className="provider-card-header" style={{ cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <h2 className="provider-card-title">Change Password</h2>
        <span className="provider-form-hint">{open ? 'Hide' : 'Show'}</span>
      </div>
      {open && (
        <div className="provider-card-body">
          <form onSubmit={handleSubmit}>
            {error && <AlertMessage type="error" message={error} />}
            {success && <AlertMessage type="success" message={success} />}

            <div className="provider-form-grid">
              <div className="provider-form-group full">
                <label className="provider-form-label" htmlFor="pf-current-pw">Current Password <span className="required">*</span></label>
                <input id="pf-current-pw" name="currentPassword" type="password" className="provider-form-input" value={form.currentPassword} onChange={handleChange} required />
              </div>
              <div className="provider-form-group">
                <label className="provider-form-label" htmlFor="pf-new-pw">New Password <span className="required">*</span></label>
                <input id="pf-new-pw" name="newPassword" type="password" className="provider-form-input" value={form.newPassword} onChange={handleChange} required />
                <span className="provider-form-hint">At least 8 characters, including a letter and a number.</span>
              </div>
              <div className="provider-form-group">
                <label className="provider-form-label" htmlFor="pf-confirm-pw">Confirm New Password <span className="required">*</span></label>
                <input id="pf-confirm-pw" name="confirmNewPassword" type="password" className="provider-form-input" value={form.confirmNewPassword} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-lg)' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving && <span className="btn-spinner" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ProviderProfileForm({ profile, onSave, onImageUploaded, saving, error, success }) {
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    username: '',
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
        username: profile.username ?? '',
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

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    setUploadingImage(true);
    try {
      const res = await providerApi.updateProfileImage(file);
      const profileImageUrl = res.data?.data?.profileImageUrl ?? res.data?.profileImageUrl;
      onImageUploaded?.(profileImageUrl);
    } catch (err) {
      setImageError(err.response?.data?.message ?? 'Could not upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const initials = form.fullName
    ? form.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SP';

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="provider-avatar-upload">
          {profile?.profileImageUrl ? (
            <img src={getAssetUrl(profile.profileImageUrl)} alt={form.fullName} className="provider-avatar-preview" />
          ) : (
            <div className="provider-avatar-placeholder">{initials}</div>
          )}
          <div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-secondary-700)' }}>
              Profile Photo
            </p>
            <p style={{ margin: '0 0 6px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Token: {profile?.userToken ?? '—'}
            </p>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: 'var(--font-size-xs)', padding: '5px 12px' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              <IconImage size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              {uploadingImage ? 'Uploading…' : 'Change Photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              style={{ display: 'none' }}
              onChange={handleImagePick}
            />
            {imageError && <p style={{ margin: '6px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>{imageError}</p>}
          </div>
        </div>

        {error && <AlertMessage type="error" message={error} />}
        {success && <AlertMessage type="success" message={success} />}

        <div className="provider-form-grid">
          <div className="provider-form-group">
            <label className="provider-form-label" htmlFor="pf-username">
              Username <span className="required">*</span>
            </label>
            <input
              id="pf-username"
              name="username"
              className="provider-form-input"
              value={form.username}
              onChange={handleChange}
              required
            />
            <span className="provider-form-hint">3-30 characters: letters, numbers or underscore.</span>
          </div>

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
                    {selected && <IconCheck size={13} style={{ marginRight: 4, verticalAlign: -2 }} />}
                    {cat.category_name}
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

      <ChangePasswordSection />
    </>
  );
}
