import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { HERO_IMAGE_URL, HERO_VISUAL_PHOTOS } from '../../../constants/serviceCategories.js';
import { useSiteImage } from '../../../hooks/useSiteImage.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { IconHome, IconLeaf, IconCheckCircle, IconLock } from '../../../components/common/icons.jsx';

export default function HeroSection() {
  const [gardener, labrador, technician] = HERO_VISUAL_PHOTOS;
  const heroImageUrl = useSiteImage('HOME_HERO_IMAGE', HERO_IMAGE_URL);
  const { user } = useAuth();

  // Once logged in, "Book a Service" no longer needs to route through client
  // signup - it brings the service category cards already on this page into
  // view instead. "Become a Provider" is dropped entirely at that point since
  // an already-authenticated visitor here is a Client (or a still-PENDING
  // provider), never a fresh signup prospect.
  function scrollToServices() {
    document.getElementById('hh-services-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="glass-hero hh-home-hero">
      <div
        className="glass-hero-bg"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
        role="img"
        aria-label="Cozy home exterior with a well-kept garden"
      />
      <div className="glass-hero-overlay" aria-hidden="true" />

      <div className="container glass-hero-inner">
        <div className="hh-hero-grid">
          <div className="glass-panel glass-hero-panel animate-fade-in-up">
            <span className="hh-eyebrow"><IconHome size={16} /> Sri Lanka&apos;s home services, made simple</span>
            <h1 className="hh-hero-title">Trusted hands for the home you love coming back to.</h1>
            <p className="hh-hero-subtitle">
              HomeHero connects Sri Lankan homeowners with verified gardening, cleaning, pet care,
              plumbing and AC repair professionals — booked in minutes, backed by real reviews, so your
              home always feels warm, safe and cared for.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              {user ? (
                <button
                  type="button"
                  onClick={scrollToServices}
                  className="btn btn-primary btn-shine"
                  style={{ backgroundColor: 'var(--color-neutral-0)', color: 'var(--color-secondary-700)' }}
                >
                  Book a Service
                </button>
              ) : (
                <Link
                  to={ROUTES.REGISTER_CLIENT}
                  className="btn btn-primary btn-shine"
                  style={{ backgroundColor: 'var(--color-neutral-0)', color: 'var(--color-secondary-700)' }}
                >
                  Book a Service
                </Link>
              )}
              {!user && (
                <Link
                  to={ROUTES.REGISTER_PROVIDER}
                  className="btn btn-outline"
                  style={{ borderColor: 'var(--color-neutral-0)', color: 'var(--color-neutral-0)' }}
                >
                  Become a Provider
                </Link>
              )}
            </div>

            <div className="hh-trust-row">
              <span className="hh-trust-chip"><IconLeaf size={16} /> <strong>5</strong> trusted services</span>
              <span className="hh-trust-chip"><IconCheckCircle size={16} /> <strong>Verified</strong> heroes only</span>
              <span className="hh-trust-chip"><IconLock size={16} /> <strong>Secure</strong> payments</span>
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
