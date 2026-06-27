import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { CTA_COLLAGE_PHOTOS } from '../../../constants/serviceCategories.js';

export default function GetStartedSection() {
  return (
    <section className="collage-cta">
      <div className="collage-cta-grid" aria-hidden="true">
        {CTA_COLLAGE_PHOTOS.map((photoUrl) => (
          <div key={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        ))}
      </div>
      <div className="collage-cta-overlay" aria-hidden="true" />

      <div className="container">
        <div className="glass-panel collage-cta-panel animate-fade-in-up">
          <div className="hh-cta-icon" aria-hidden="true">
            🏡
          </div>
          <h2>Ready to feel at home again?</h2>
          <p>
            Join thousands of homeowners who trust HomeHero for fast, reliable, verified home services —
            because every home deserves to feel cared for.
          </p>
          <Link
            to={ROUTES.REGISTER_ROLE}
            className="btn btn-primary btn-shine"
            style={{ backgroundColor: 'var(--color-neutral-0)', color: 'var(--color-secondary-700)' }}
          >
            Get Started
          </Link>
          <div className="hh-cta-trust-row">
            <span>✅ Verified providers</span>
            <span>🔒 Secure payments</span>
            <span>⭐ Real reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
