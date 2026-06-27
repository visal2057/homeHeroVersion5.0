import { useState } from 'react';
import FormInput from '../../../components/common/FormInput.jsx';
import FormTextarea from '../../../components/common/FormTextarea.jsx';
import { useAlert } from '../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { submitContactMessage } from '../publicApi.js';

const initialForm = { fullName: '', email: '', subject: '', messageBody: '' };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useAlert();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (!form.subject.trim()) nextErrors.subject = 'Subject is required';
    if (form.messageBody.trim().length < 10) nextErrors.messageBody = 'Message must be at least 10 characters';
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await submitContactMessage(form);
      showSuccess('Your message has been sent. We will get back to you soon.');
      setForm(initialForm);
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="theme-glass-card animate-fade-in-up delay-2"
      style={{ flex: '1 1 320px', maxWidth: 520 }}
    >
      <span className="hh-section-kicker">Send a message</span>
      <h3 style={{ marginBottom: 'var(--space-lg)' }}>Contact form</h3>
      <FormInput label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} />
      <FormInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
      <FormInput label="Subject" name="subject" value={form.subject} onChange={handleChange} error={errors.subject} />
      <FormTextarea label="Message" name="messageBody" rows={5} value={form.messageBody} onChange={handleChange} error={errors.messageBody} />
      <button type="submit" className="btn btn-primary btn-block btn-shine" disabled={isSubmitting}>
        {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
