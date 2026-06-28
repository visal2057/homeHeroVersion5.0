import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm.jsx';
import { ROUTES } from '../../../constants/routes.js';
import { LOGIN_SIDE_IMAGE_URL } from '../../../constants/pageImages.js';
import { useSiteImage } from '../../../hooks/useSiteImage.js';

export default function LoginPage() {
  const loginImageUrl = useSiteImage('LOGIN_SIDE_IMAGE', LOGIN_SIDE_IMAGE_URL);

  return (
    <div className="login-split">
      <div
        className="login-image-col"
        style={{ backgroundImage: `url(${loginImageUrl})` }}
        role="img"
        aria-label="A gardener's trowel and tools resting in fresh potting soil"
      >
        <div className="login-image-overlay" aria-hidden="true" />
        <div className="glass-panel login-image-tile animate-fade-in-up">
          <div className="hh-float-gentle">
            <h3>Verified heroes, ready to help</h3>
            <p>Every gardener, cleaner and technician on HomeHero is identity-checked and reviewed, so your home is always in trusted hands.</p>
          </div>
        </div>
      </div>

      <div className="login-form-col">
        <div className="login-form-col-inner">
          <h1 className="section-title text-center">Welcome Back</h1>
          <p className="section-subtitle text-center">Log in to your HomeHero account.</p>
          <LoginForm />
          <p className="text-center" style={{ marginTop: 'var(--space-lg)' }}>
            Don't have an account? <Link to={ROUTES.REGISTER_ROLE}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
