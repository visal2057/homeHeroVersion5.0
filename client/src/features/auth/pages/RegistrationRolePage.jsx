import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { REGISTER_ROLE_HERO_IMAGE_URL } from '../../../constants/pageImages.js';
import { IconSprout, IconHome, IconHardHat } from '../../../components/common/icons.jsx';

export default function RegistrationRolePage() {
  return (
    <div>
      <section className="glass-hero register-hero">
        <div
          className="glass-hero-bg"
          style={{ backgroundImage: `url(${REGISTER_ROLE_HERO_IMAGE_URL})` }}
          role="img"
          aria-label="A welcoming front door surrounded by greenery"
        />
        <div className="glass-hero-overlay" aria-hidden="true" />
        <div className="container glass-hero-inner">
          <div className="glass-panel glass-hero-panel text-center animate-fade-in-up" style={{ margin: '0 auto' }}>
            <div className="hh-float-gentle">
              <span className="hh-eyebrow"><IconSprout size={16} /> Join HomeHero</span>
              <h1 className="register-hero-title">Tell us how you'd like to use HomeHero</h1>
              <p>Pick a path below and we'll get you set up in just a couple of minutes.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container section text-center">
        <div style={{ display: 'flex', gap: 'var(--space-xl)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* "card-interactive" gives these clickable cards a hover lift,
              and removing the underline keeps them looking like buttons
              instead of plain text links. */}
          <Link
            to={ROUTES.REGISTER_CLIENT}
            className="card card-interactive role-pick-card animate-fade-in-up delay-1"
            style={{ padding: 'var(--space-xl)', width: 280, textDecoration: 'none' }}
          >
            <div className="hh-float-gentle">
              <div className="role-pick-icon" aria-hidden="true"><IconHome size={32} /></div>
              <h3>I'm a Client</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Book trusted service providers for your home.</p>
            </div>
          </Link>

          <Link
            to={ROUTES.REGISTER_PROVIDER}
            className="card card-interactive role-pick-card animate-fade-in-up delay-2"
            style={{ padding: 'var(--space-xl)', width: 280, textDecoration: 'none' }}
          >
            <div className="hh-float-gentle" style={{ animationDelay: '0.6s' }}>
              <div className="role-pick-icon" aria-hidden="true"><IconHardHat size={32} /></div>
              <h3>I'm a Service Provider</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Offer your services and grow your business.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
