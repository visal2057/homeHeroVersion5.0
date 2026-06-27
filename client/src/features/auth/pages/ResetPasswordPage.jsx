import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import PasswordInput from '../../../components/common/PasswordInput.jsx';
import { useAlert } from '../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { validatePassword, validateConfirmPassword } from '../authValidation.js';
import { resetPassword } from '../authApi.js';
import { ROUTES } from '../../../constants/routes.js';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    const activeErrors = Object.fromEntries(Object.entries(nextErrors).filter(([, value]) => value));
    setErrors(activeErrors);
    if (Object.keys(activeErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      showSuccess('Your password has been reset successfully.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="container section text-center">
        <h1 className="section-title">Invalid Reset Link</h1>
        <p>This password reset link is missing or invalid. Please request a new one.</p>
        <Link to={ROUTES.FORGOT_PASSWORD} className="btn btn-primary">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section-title text-center">Reset Your Password</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-xl)', maxWidth: 420, margin: '0 auto' }}>
        <PasswordInput label="New Password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} />
        <PasswordInput label="Confirm New Password" name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={errors.confirmPassword} />
        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
