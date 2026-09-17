import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { HERO_VISUAL_PHOTOS } from '../../../constants/serviceCategories.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { IconCheckCircle, IconLock, IconStar } from '../../../components/common/icons.jsx';

export default function GetStartedSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Every CTA_COLLAGE_PHOTOS option was rejected in review (index 0 read
  // poorly at this crop, 2 was a cat/flowers shot that didn't fit, 3/4 were
  // too industrial for a warm "feel at home" close). HERO_VISUAL_PHOTOS[1]
  // (a close-up of hands-on repair work) is not used anywhere else on this
  // page and matches the "trusted hands" tagline.
  const ctaPhoto = HERO_VISUAL_PHOTOS[1].url;

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
    <section className="lr-cta">
      <img src={ctaPhoto} alt="" className="lr-cta-photo" aria-hidden="true" />
      <div className="lr-cta-scrim" aria-hidden="true" />

      <div className="container">
        <div className="lr-cta-panel animate-fade-in-up">
          <h2>Ready to feel at home again?</h2>
          <p>
            Join thousands of homeowners who trust HomeHero for fast, reliable, verified home services —
            because every home deserves to feel cared for.
          </p>
          <button type="button" onClick={handleGetStarted} className="btn btn-primary btn-shine lr-cta-btn">
            Get Started
          </button>
          <div className="lr-cta-trust">
            <span><IconCheckCircle size={15} /> Verified providers</span>
            <span><IconLock size={15} /> Secure payments</span>
            <span><IconStar size={15} /> Real reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
