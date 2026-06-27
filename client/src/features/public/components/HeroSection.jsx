import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { HERO_IMAGE_URL, HERO_VISUAL_PHOTOS } from '../../../constants/serviceCategories.js';

export default function HeroSection() {
  const [gardener, labrador, technician] = HERO_VISUAL_PHOTOS;

  return (
    <section className="glass-hero hh-home-hero">
      <div
        className="glass-hero-bg"
        style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        role="img"
        aria-label="Cozy home exterior with a well-kept garden"
      />
      <div className="glass-hero-overlay" aria-hidden="true" />

      <div className="container glass-hero-inner">
        <div className="hh-hero-grid">
          <div className="glass-panel glass-hero-panel animate-fade-in-up">
            <span className="hh-eyebrow">🏡 Sri Lanka&apos;s home services, made simple</span>
            <h1 className="hh-hero-title">Trusted hands for the home you love coming back to.</h1>
            <p className="hh-hero-subtitle">
              HomeHero connects Sri Lankan homeowners with verified gardening, cleaning, pet care,
              plumbing and AC repair professionals — booked in minutes, backed by real reviews, so your
              home always feels warm, safe and cared for.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <Link
                to={ROUTES.REGISTER_CLIENT}
                className="btn btn-primary btn-shine"
                style={{ backgroundColor: 'var(--color-neutral-0)', color: 'var(--color-secondary-700)' }}
              >
                Book a Service
              </Link>
              <Link
                to={ROUTES.REGISTER_PROVIDER}
                className="btn btn-outline"
                style={{ borderColor: 'var(--color-neutral-0)', color: 'var(--color-neutral-0)' }}
              >
                Become a Provider
              </Link>
            </div>

            <div className="hh-trust-row">
              <span className="hh-trust-chip">🌿 <strong>5</strong> trusted services</span>
              <span className="hh-trust-chip">✅ <strong>Verified</strong> heroes only</span>
              <span className="hh-trust-chip">🔒 <strong>Secure</strong> payments</span>
            </div>
          </div>

          <div className="hh-hero-visual" aria-hidden="true">
            <div className="hh-hero-photo hh-hero-photo-main">
              <img src={gardener.url} alt="" loading="eager" />
            </div>
            <div className="hh-hero-photo hh-hero-photo-secondary">
              <img src={labrador.url} alt="" loading="lazy" />
            </div>
            <div className="hh-hero-photo hh-hero-photo-accent">
              <img src={technician.url} alt="" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
