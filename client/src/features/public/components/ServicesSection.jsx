import { useNavigate } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../../../constants/serviceCategories.js';
import { ROUTES } from '../../../constants/routes.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { ROLES } from '../../../constants/roles.js';

export default function ServicesSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleServiceClick(slug) {
    // A Service Provider whose verification is still PENDING may also
    // browse into Explore (view-only - see ProtectedRoute's
    // `allowPendingProvider`), same as a Client. A logged-out visitor may
    // browse in too (see ProtectedRoute's `allowGuest`) - they're only sent
    // to client signup once they try to actually book a provider.
    const isPendingProvider = user?.role === ROLES.SERVICE_PROVIDER && user?.verificationStatus === 'PENDING';
    const isGuest = !user;
    if (user?.role === ROLES.CLIENT || isPendingProvider || isGuest) {
      navigate(ROUTES.CLIENT_EXPLORE.replace(':category', slug));
    } else {
      navigate(ROUTES.REGISTER_CLIENT);
    }
  }

  return (
    <section id="hh-services-section" className="section lr-services">
      <span className="lr-spot" style={{ top: -40, left: -100, width: 340, height: 280, background: 'radial-gradient(ellipse, rgba(16,185,129,0.24), transparent 64%)' }} />
      <span className="lr-spot" style={{ bottom: -120, right: -80, width: 460, height: 420, background: 'radial-gradient(ellipse, rgba(6,78,59,0.20), transparent 64%)' }} />
      <span className="lr-spot" style={{ top: '30%', right: '30%', width: 200, height: 160, background: 'radial-gradient(circle, rgba(52,211,153,0.22), transparent 62%)' }} />

      <div className="container">
        <div className="text-center lr-section-header">
          <h2 className="section-title lr-section-title">Our Services</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Five trusted household services, each backed by verified professionals who treat your home
            like their own.
          </p>
        </div>

        <div className="lr-film-strip">
          {SERVICE_CATEGORIES.map((category, index) => (
            <button
              key={category.code}
              type="button"
              onClick={() => handleServiceClick(category.slug)}
              className={`lr-film-card animate-fade-in-up delay-${Math.min(index + 1, 5)}`}
              aria-label={category.name}
            >
              <img src={category.image} alt="" loading="lazy" />
              <span className="lr-film-scrim" aria-hidden="true" />
              <span className="lr-film-body">
                <span className="lr-film-name">{category.name}</span>
                <span className="lr-film-desc">{category.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
