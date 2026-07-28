import LoginForm from '../components/LoginForm.jsx';
import { LOGIN_SIDE_IMAGE_URL } from '../../../constants/pageImages.js';
import { useSiteImage } from '../../../hooks/useSiteImage.js';
import { IconLock, IconShield } from '../../../components/common/icons.jsx';

export default function LoginPage() {
  const loginImageUrl = useSiteImage('LOGIN_SIDE_IMAGE', LOGIN_SIDE_IMAGE_URL);

  return (
    <div className="register-page">
      <div
        className="register-page-bg"
        style={{ backgroundImage: `url(${loginImageUrl})` }}
        role="img"
        aria-label="A green-toned living room with a lush couch, plants and warm natural light"
      />
      <div className="register-page-overlay" aria-hidden="true" />
      <div className="container register-page-inner">
        <div className="login-grid">
          <div className="login-heading-block animate-fade-in-up">
            <div className="hh-float-gentle">
              <span className="hh-eyebrow"><IconLock size={16} /> Member Login</span>
              <h1 className="register-page-title login-intro-title">Welcome Back</h1>
              <p className="register-page-subtitle login-intro-subtitle">
                Log in to your HomeHero account to manage your bookings, services and more.
              </p>
            </div>
          </div>

          <LoginForm />

          <div className="login-tip-box animate-fade-in-up delay-1">
            <div className="register-glass-box-header">
              <span className="register-glass-box-icon"><IconShield size={20} /></span>
              <div>
                <h3>Good to know</h3>
              </div>
            </div>
            <p>
              HomeHero staff will never ask for your password. Avoid logging in on shared or public
              devices, and always log out once you&apos;re done to keep your account secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
