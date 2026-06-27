import { useState } from 'react';
import FormInput from '../../../components/common/FormInput.jsx';
import { useAlert } from '../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { forgotPassword } from '../authApi.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useAlert();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (apiError) {
      showError(extractErrorMessage(apiError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container section">
      <h1 className="section-title text-center">Forgot Password</h1>
      <p className="section-subtitle text-center">Enter your registered email to receive a reset link.</p>

      <div className="card" style={{ padding: 'var(--space-xl)', maxWidth: 420, margin: '0 auto' }}>
        {isSubmitted ? (
          <p>If an account with that email exists, a password reset link has been sent.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={error}
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
