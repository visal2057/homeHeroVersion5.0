import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { CTA_COLLAGE_PHOTOS } from '../../../constants/serviceCategories.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { IconHome, IconCheckCircle, IconLock, IconStar } from '../../../components/common/icons.jsx';

export default function GetStartedSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Logged out: send the visitor to log in. Logged in: there's nothing left
  // to "get started" with signup-wise, so bring the service category cards
  // already on this page into view instead.
  function handleGetStarted() {
    if (user) {
      document.getElementById('hh-services-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(ROUTES.LOGIN);
    }
  }

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
            <IconHome size={32} />
          </div>
          <h2>Ready to feel at home again?</h2>
          <p>
            Join thousands of homeowners who trust HomeHero for fast, reliable, verified home services —
            because every home deserves to feel cared for.
          </p>
          <button
            type="button"
            onClick={handleGetStarted}
            className="btn btn-primary btn-shine"
            style={{ backgroundColor: 'var(--color-neutral-0)', color: 'var(--color-secondary-700)' }}
          >
            Get Started
          </button>
          <div className="hh-cta-trust-row">
            <span><IconCheckCircle size={16} /> Verified providers</span>
            <span><IconLock size={16} /> Secure payments</span>
            <span><IconStar size={16} /> Real reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
