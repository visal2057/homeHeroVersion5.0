import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../components/common/FormInput.jsx';
import PasswordInput from '../../../components/common/PasswordInput.jsx';
import MapPicker from '../../../components/common/MapPicker.jsx';
import { IconUser, IconMapPin } from '../../../components/common/icons.jsx';
import { useAlert } from '../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { ROUTES } from '../../../constants/routes.js';
import { registerClient } from '../authApi.js';
import {
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
} from '../authValidation.js';

const initialForm = {
  username: '',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  addressText: '',
  latitude: null,
  longitude: null,
};

export default function ClientRegistrationForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleLocationChange({ latitude, longitude }) {
    setForm((prev) => ({ ...prev, latitude, longitude }));
  }

  function validate() {
    return {
      username: validateUsername(form.username),
      fullName: validateRequired(form.fullName, 'Full name'),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
      addressText: validateRequired(form.addressText, 'Address'),
      location: form.latitude && form.longitude ? null : 'Please select your location on the map',
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate();
    const activeErrors = Object.fromEntries(Object.entries(validationErrors).filter(([, value]) => value));
    setErrors(activeErrors);
    if (Object.keys(activeErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await registerClient(form);
      showSuccess('Registration completed successfully. Please log in.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="register-glass-grid animate-fade-in-up">
      <div className="register-glass-box">
        <div className="register-glass-box-header">
          <span className="register-glass-box-icon"><IconUser size={20} /></span>
          <div>
            <h3>Account Details</h3>
            <p>Your login credentials &amp; contact info</p>
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

      <div className="register-glass-box">
        <div className="register-glass-box-header">
          <span className="register-glass-box-icon"><IconMapPin size={20} /></span>
          <div>
            <h3>Address &amp; Location</h3>
            <p>Where should providers find you?</p>
          </div>
        </div>

        <FormInput
          label="Address"
          name="addressText"
          placeholder="House number, street, city"
          value={form.addressText}
          onChange={handleChange}
          error={errors.addressText}
        />

        <div className="form-group register-map-group">
          <label className="form-label">Pin Your Location</label>
          <MapPicker latitude={form.latitude} longitude={form.longitude} onChange={handleLocationChange} />
          {errors.location && <div className="form-error">{errors.location}</div>}
        </div>
      </div>

      <div className="register-submit-row">
        <button type="submit" className="btn btn-primary btn-shine" disabled={isSubmitting}>
          {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
          {isSubmitting ? 'Creating account...' : 'Create Client Account'}
        </button>
      </div>
    </form>
  );
}
