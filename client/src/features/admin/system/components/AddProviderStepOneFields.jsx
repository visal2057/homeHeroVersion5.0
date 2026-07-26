import FormInput from '../../../../components/common/FormInput.jsx';
import FormSelect from '../../../../components/common/FormSelect.jsx';
import FormTextarea from '../../../../components/common/FormTextarea.jsx';
import PasswordInput from '../../../../components/common/PasswordInput.jsx';
import CategorySelector from '../../../auth/components/CategorySelector.jsx';
import { IconUser, IconHardHat } from '../../../../components/common/icons.jsx';

// Same fields as the public sign-up flow's step 1 (ProviderPersonalForm.jsx),
// laid out as stacked admin-form-section panels instead of side-by-side
// glass boxes so it fits the modal.
export default function AddProviderStepOneFields({ form, errors, districts, categories, onChange, onCategoriesChange, onNext, onCancel }) {
  function handleChange(event) {
    const { name, value } = event.target;
    onChange({ ...form, [name]: value });
  }

  return (
    <div>
      <div className="admin-form-section">
        <div className="admin-form-section-header">
          <span className="admin-form-section-icon"><IconUser size={18} /></span>
          <div>
            <h4>Account Details</h4>
            <p>Login credentials &amp; contact info</p>
          </div>
        </div>

        <FormInput label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} />
        <FormInput label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} />
        <FormInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormInput label="Phone Number" name="phone" placeholder="07XXXXXXXX" value={form.phone} onChange={handleChange} error={errors.phone} />

        <div className="form-row">
          <PasswordInput label="Password" name="password" value={form.password} onChange={handleChange} error={errors.password} />
          <PasswordInput label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-form-section-header">
          <span className="admin-form-section-icon"><IconHardHat size={18} /></span>
          <div>
            <h4>Service &amp; Availability</h4>
            <p>What they offer and where they work</p>
          </div>
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
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext}>
          Continue to Verification
        </button>
      </div>
    </div>
  );
}
