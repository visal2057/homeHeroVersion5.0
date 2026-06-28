import FormInput from '../../../components/common/FormInput.jsx';
import FormSelect from '../../../components/common/FormSelect.jsx';
import FormTextarea from '../../../components/common/FormTextarea.jsx';
import PasswordInput from '../../../components/common/PasswordInput.jsx';
import CategorySelector from './CategorySelector.jsx';

export default function ProviderPersonalForm({ form, errors, districts, categories, onChange, onCategoriesChange, onNext }) {
  function handleChange(event) {
    const { name, value } = event.target;
    onChange({ ...form, [name]: value });
  }

  return (
    <div className="card auth-card animate-fade-in-up" style={{ padding: 'var(--space-xl)', maxWidth: 640, margin: '0 auto' }}>
      <h3>Step 1: Personal & Service Information</h3>

      <FormInput label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} />
      <FormInput label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} />
      <FormInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
      <FormInput label="Phone Number" name="phone" placeholder="07XXXXXXXX" value={form.phone} onChange={handleChange} error={errors.phone} />

      <div className="form-row">
        <PasswordInput label="Password" name="password" value={form.password} onChange={handleChange} error={errors.password} />
        <PasswordInput label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
      </div>

      <CategorySelector categories={categories} selectedIds={form.serviceCategoryIds} onChange={onCategoriesChange} error={errors.serviceCategoryIds} />

      <div className="form-row">
        <FormSelect
          label="Home District"
          name="homeDistrictId"
          value={form.homeDistrictId}
          onChange={handleChange}
          error={errors.homeDistrictId}
          placeholder="Select district"
          options={districts.map((d) => ({ value: d.district_id, label: d.district_name }))}
        />
        <FormSelect
          label="Service District"
          name="serviceDistrictId"
          value={form.serviceDistrictId}
          onChange={handleChange}
          error={errors.serviceDistrictId}
          placeholder="Select district"
          options={districts.map((d) => ({ value: d.district_id, label: d.district_name }))}
        />
      </div>

      <FormInput
        label="Estimated Hourly Charge (LKR)"
        name="hourlyChargeEstimate"
        type="number"
        min="0"
        value={form.hourlyChargeEstimate}
        onChange={handleChange}
        error={errors.hourlyChargeEstimate}
      />
      <FormTextarea label="Bio" name="bio" rows={3} value={form.bio} onChange={handleChange} error={errors.bio} />
      <FormTextarea label="Work Hours & Details" name="workHoursDetails" rows={2} value={form.workHoursDetails} onChange={handleChange} error={errors.workHoursDetails} />

      <button type="button" className="btn btn-primary btn-block" onClick={onNext}>
        Continue to Verification
      </button>
    </div>
  );
}
