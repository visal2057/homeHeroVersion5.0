import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../../../components/common/FormInput.jsx';
import PasswordInput from '../../../components/common/PasswordInput.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { useAlert } from '../../../hooks/useAlert.js';
import { extractErrorMessage } from '../../../api/apiErrorHandler.js';
import { ROLE_HOME_ROUTE, ROLES } from '../../../constants/roles.js';
import { ROUTES } from '../../../constants/routes.js';
import { IconLock } from '../../../components/common/icons.jsx';

function resolveRedirect(user, fromPath) {
  if (user.role === ROLES.SERVICE_PROVIDER && user.verificationStatus !== 'APPROVED') {
    return user.verificationStatus === 'REJECTED' ? ROUTES.APPLICATION_REJECTED : ROUTES.VERIFICATION_PENDING;
  }
  return fromPath || ROLE_HOME_ROUTE[user.role] || ROUTES.HOME;
}

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!identifier.trim()) nextErrors.identifier = 'Username or email is required';
    if (!password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const user = await login(identifier, password);
      showSuccess('Logged in successfully.');
      const redirectTo = resolveRedirect(user, location.state?.from?.pathname);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      showError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="register-glass-box login-glass-box animate-fade-in-up">
      <div className="register-glass-box-header">
        <span className="register-glass-box-icon"><IconLock size={20} /></span>
        <div>
          <h3>Account Login</h3>
          <p>Enter your username and password</p>
        </div>
      </div>

      <FormInput
        label="Username or Email"
        name="identifier"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        error={errors.identifier}
      />
      <PasswordInput
        label="Password"
        name="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />
      <div className="login-forgot-row">
        <Link to={ROUTES.FORGOT_PASSWORD}>Forgot Password?</Link>
      </div>
      <button type="submit" className="btn btn-primary btn-block btn-shine" disabled={isSubmitting}>
        {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
      <p className="register-submit-hint">
        Don't have an account? <Link to={ROUTES.REGISTER_ROLE}>Sign up</Link>
      </p>
    </form>
  );
}
