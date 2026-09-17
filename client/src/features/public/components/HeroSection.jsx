import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { HERO_IMAGE_URL, HERO_VISUAL_PHOTOS } from '../../../constants/serviceCategories.js';
import { useSiteImage } from '../../../hooks/useSiteImage.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { IconLeaf, IconCheckCircle, IconLock } from '../../../components/common/icons.jsx';

export default function HeroSection() {
  const [gardener] = HERO_VISUAL_PHOTOS;
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
    <section className="lr-hero">
      <span className="lr-spot" style={{ top: -100, right: -140, width: 520, height: 520, background: 'radial-gradient(circle, rgba(16,185,129,0.30), transparent 62%)' }} />
      <span className="lr-spot" style={{ bottom: -60, left: -90, width: 300, height: 340, background: 'radial-gradient(ellipse, rgba(52,211,153,0.28), transparent 64%)' }} />
      <span className="lr-spot" style={{ top: '40%', left: '44%', width: 180, height: 180, background: 'radial-gradient(circle, rgba(6,78,59,0.16), transparent 65%)' }} />

      <div className="container lr-hero-grid">
        <div className="animate-fade-in-up">
          <span className="lr-eyebrow">
            <IconLeaf size={15} /> Sri Lanka&apos;s home services, made simple
          </span>
          <h1 className="lr-hero-title">Trusted hands for the home you love coming back to.</h1>
          <p className="lr-hero-subtitle">
            HomeHero connects Sri Lankan homeowners with verified gardening, cleaning, pet care,
            plumbing and AC repair professionals — booked in minutes, backed by real reviews.
          </p>

          <div className="lr-hero-actions">
            {user ? (
              <button type="button" onClick={scrollToServices} className="btn btn-primary btn-shine">
                Book a Service
              </button>
            ) : (
              <Link to={ROUTES.REGISTER_CLIENT} className="btn btn-primary btn-shine">
                Book a Service
              </Link>
            )}
            {!user && (
              <Link to={ROUTES.REGISTER_PROVIDER} className="btn btn-outline">
                Become a Provider
              </Link>
            )}
          </div>

          <div className="lr-hero-trust">
            <span><IconLeaf size={15} /> <strong>5</strong>&nbsp;trusted services</span>
            <span><IconCheckCircle size={15} /> <strong>Verified</strong>&nbsp;heroes only</span>
            <span><IconLock size={15} /> <strong>Secure</strong>&nbsp;payments</span>
          </div>
        </div>

        <div className="lr-hero-visual animate-fade-in-up delay-2" aria-hidden="true">
          <div className="lr-blob lr-hero-photo-main">
            <img src={heroImageUrl} alt="" loading="eager" />
          </div>
          <div className="lr-blob2 lr-hero-photo-accent">
            <img src={gardener.url} alt="" loading="lazy" />
          </div>
          <div className="lr-glass lr-hero-badge">
            <span className="lr-hero-badge-icon"><IconCheckCircle size={18} /></span>
            <div>
              <div className="lr-hero-badge-title">Verified heroes</div>
              <div className="lr-hero-badge-sub">Background-checked</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
