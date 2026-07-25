import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { REGISTER_ROLE_HERO_IMAGE_URL } from '../../../constants/pageImages.js';
import { IconSprout, IconHome, IconHardHat } from '../../../components/common/icons.jsx';

export default function RegistrationRolePage() {
  return (
    <div className="register-page">
      <div
        className="register-page-bg"
        style={{ backgroundImage: `url(${REGISTER_ROLE_HERO_IMAGE_URL})` }}
        role="img"
        aria-label="A welcoming green front door framed by leaves"
      />
      <div className="register-page-overlay" aria-hidden="true" />
      <div className="container register-page-inner">
        <div className="text-center register-page-heading animate-fade-in-up">
          <div className="hh-float-gentle">
            <span className="hh-eyebrow"><IconSprout size={16} /> Join HomeHero</span>
            <h1 className="register-page-title">Tell us how you&apos;d like to use HomeHero</h1>
            <p className="register-page-subtitle">Pick a path below and we&apos;ll get you set up in just a couple of minutes.</p>
          </div>
        </div>

        <div className="register-glass-grid">
          <Link to={ROUTES.REGISTER_CLIENT} className="register-glass-box register-role-card animate-fade-in-up delay-1">
            <div className="register-glass-box-header">
              <span className="register-glass-box-icon"><IconHome size={20} /></span>
              <div>
                <h3>I&apos;m a Client</h3>
                <p>Book trusted service providers</p>
              </div>
            </div>
            <p className="register-role-desc">
              Find verified, background-checked professionals for gardening, cleaning, pet care, plumbing and
              AC repair — all in one place, all treating your home like their own.
            </p>
            <span className="register-role-cta">Get Started <span className="register-role-arrow">→</span></span>
          </Link>

          <Link to={ROUTES.REGISTER_PROVIDER} className="register-glass-box register-role-card animate-fade-in-up delay-2">
            <div className="register-glass-box-header">
              <span className="register-glass-box-icon"><IconHardHat size={20} /></span>
              <div>
                <h3>I&apos;m a Service Provider</h3>
                <p>Offer your skills, grow your business</p>
              </div>
            </div>
            <p className="register-role-desc">
              Join a trusted network of verified professionals, set your own hours and rates, and get booked
              by homeowners who need exactly what you offer.
            </p>
            <span className="register-role-cta">Get Started <span className="register-role-arrow">→</span></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
