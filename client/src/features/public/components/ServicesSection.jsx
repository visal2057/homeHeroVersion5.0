import { useNavigate } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../../../constants/serviceCategories.js';
import { ROUTES } from '../../../constants/routes.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { ROLES } from '../../../constants/roles.js';
import ServiceCard from './ServiceCard.jsx';

export default function ServicesSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleServiceClick(slug) {
    // A Service Provider whose verification is still PENDING may also
    // browse into Explore (view-only - see ProtectedRoute's
    // `allowPendingProvider`), same as a Client.
    const isPendingProvider = user?.role === ROLES.SERVICE_PROVIDER && user?.verificationStatus === 'PENDING';
    if (user?.role === ROLES.CLIENT || isPendingProvider) {
      navigate(ROUTES.CLIENT_EXPLORE.replace(':category', slug));
    } else {
      navigate(ROUTES.REGISTER_CLIENT);
    }
  }

  return (
    <section className="section hh-services-section">
      <div className="container">
        <div className="text-center" style={{ maxWidth: 640, margin: '0 auto var(--space-xl)' }}>
          <span className="hh-section-kicker">What we offer</span>
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Five trusted household services, each backed by verified professionals who treat your home
            like their own.
          </p>
        </div>

        <div className="hh-services-grid">
          {SERVICE_CATEGORIES.map((category, index) => (
            <ServiceCard
              key={category.code}
              icon={category.icon}
              name={category.name}
              description={category.description}
              image={category.image}
              onClick={() => handleServiceClick(category.slug)}
              animationDelayClass={`delay-${Math.min(index + 1, 5)}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
