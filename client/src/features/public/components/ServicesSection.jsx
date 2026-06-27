import { useNavigate } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../../../constants/serviceCategories.js';
import { ROUTES } from '../../../constants/routes.js';
import ServiceCard from './ServiceCard.jsx';

export default function ServicesSection() {
  const navigate = useNavigate();

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
              onClick={() => navigate(ROUTES.REGISTER_CLIENT)}
              // Each card gets a slightly longer delay than the one before
              // it, so they animate in as a left-to-right wave.
              animationDelayClass={`delay-${Math.min(index + 1, 5)}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
