import { useState } from 'react';
import Modal from '../../../../components/common/Modal.jsx';
import FormInput from '../../../../components/common/FormInput.jsx';
import PasswordInput from '../../../../components/common/PasswordInput.jsx';
import MapPicker from '../../../../components/common/MapPicker.jsx';
import { IconUser, IconMapPin } from '../../../../components/common/icons.jsx';
import { registerClient } from '../../../auth/authApi.js';
import {
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
} from '../../../auth/authValidation.js';
import { useAlert } from '../../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../../api/apiErrorHandler.js';

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

// Same fields, validation and registerClient() call as the real public
// sign-up form (ClientRegistrationForm.jsx) -- just laid out in a single
// column to fit the admin modal, and reporting back to the admin instead
// of navigating to the login page.
export default function AddClientModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useAlert();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleLocationChange({ latitude, longitude }) {
    setForm((prev) => ({ ...prev, latitude, longitude }));
  }

  function resetAndClose() {
    setForm(initialForm);
    setErrors({});
    onClose();
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
      location: form.latitude && form.longitude ? null : "Please pin the client's location on the map",
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
      showSuccess('Successfully created a new client account.');
      setForm(initialForm);
      setErrors({});
      onCreated?.();
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Add Client" maxWidth={640}>
      <form onSubmit={handleSubmit}>
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
            <span className="admin-form-section-icon"><IconMapPin size={18} /></span>
            <div>
              <h4>Address &amp; Location</h4>
              <p>Where should providers find them?</p>
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

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pin Location</label>
            <MapPicker latitude={form.latitude} longitude={form.longitude} onChange={handleLocationChange} height={240} />
            {errors.location && <div className="form-error">{errors.location}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
          <button type="button" className="btn btn-ghost" onClick={resetAndClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
            {isSubmitting ? 'Creating...' : 'Create Client Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
