import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { SERVICE_CATEGORIES } from '../../../constants/serviceCategories.js';
import { CAREERS_HERO_IMAGE_URL, CAREERS_GROWTH_BG_IMAGE_URL } from '../../../constants/pageImages.js';
import ServiceCard from './ServiceCard.jsx';

const BENEFITS = [
  { icon: '📩', title: 'Direct booking requests', text: 'Receive booking requests directly from homeowners in your district.' },
  { icon: '🖼️', title: 'Public portfolio', text: 'Build a public portfolio that showcases your completed work.' },
  { icon: '⭐', title: 'Verified reviews', text: 'Grow your reputation with verified client reviews and ratings.' },
  { icon: '🧰', title: 'Choose your trade', text: 'Choose one or two of five high-demand service categories.' },
  { icon: '🕒', title: 'Flexible availability', text: 'Manage your own availability and go online or offline anytime.' },
];

const REQUIRED_DOCUMENTS = [
  'A clear face photograph',
  'Front image of your National Identity Card',
  'Back image of your National Identity Card',
  'A recent police report (JPG, JPEG, PNG or PDF), with the issuing station and date',
];

const STEPS = [
  {
    icon: '📝',
    title: 'Register & submit documents',
    description: 'Create your account, choose up to two service categories, and upload your verification documents.',
  },
  {
    icon: '✅',
    title: 'Get verified',
    description: 'Our Verification Admin team reviews your application and documents, then approves your account.',
  },
  {
    icon: '🚀',
    title: 'Purchase membership & go online',
    description: 'Pay your monthly membership, go online, and start receiving booking requests from homeowners.',
  },
];

export default function CareersProviderSection() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="glass-hero theme-page-hero">
        <div
          className="glass-hero-bg"
          style={{ backgroundImage: `url(${CAREERS_HERO_IMAGE_URL})` }}
          role="img"
          aria-label="An electrician working on a wiring installation"
        />
        <div className="glass-hero-overlay" aria-hidden="true" />
        <div className="container glass-hero-inner">
          <div className="glass-panel glass-hero-panel animate-fade-in-up">
            <span className="hh-eyebrow">🧰 Careers at HomeHero</span>
            <h1 className="theme-page-hero-title">Build your home services business with HomeHero</h1>
            <p className="theme-page-hero-subtitle">
              Grow your business with a steady stream of verified clients - and a platform that takes
              verification, payments and reputation seriously.
            </p>
            <Link
              to={ROUTES.REGISTER_PROVIDER}
              className="btn btn-primary btn-shine"
              style={{ backgroundColor: 'var(--color-neutral-0)', color: 'var(--color-secondary-700)' }}
            >
              Register as a Service Provider
            </Link>
          </div>
        </div>
      </section>

      <section className="section theme-section-white">
        <div className="container">
          <div className="text-center" style={{ maxWidth: 640, margin: '0 auto var(--space-xl)' }}>
            <span className="hh-section-kicker">Why join HomeHero</span>
            <h2 className="section-title">Everything you need to grow</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              A platform built to send you real work, not just leads.
            </p>
          </div>
          <div className="hh-services-grid">
            {BENEFITS.map((benefit, index) => (
              <div key={benefit.title} className={`theme-glass-card text-center animate-fade-in-up delay-${Math.min(index + 1, 5)}`}>
                <div className="hh-step-icon-ring" style={{ fontSize: '1.6rem' }} aria-hidden="true">
                  {benefit.icon}
                </div>
                <h4 style={{ marginTop: 'var(--space-md)' }}>{benefit.title}</h4>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 0 }}>{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section theme-section-tint">
        <div className="container">
          <div className="text-center" style={{ maxWidth: 640, margin: '0 auto var(--space-xl)' }}>
            <span className="hh-section-kicker">Service categories</span>
            <h2 className="section-title">Choose one or two categories</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              HomeHero currently supports five household service categories - you may register for a maximum
              of two.
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
                onClick={() => navigate(ROUTES.REGISTER_PROVIDER)}
                animationDelayClass={`delay-${Math.min(index + 1, 5)}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section theme-section-white">
        <div className="container" style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div className="theme-glass-card animate-fade-in-up" style={{ flex: '1 1 320px' }}>
            <span className="hh-section-kicker">Verification</span>
            <h3>Why we verify every provider</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Verification protects both homeowners and providers. Every applicant must pass identity and
              police-report verification before they can go online or receive a single booking - this is
              what makes clients trust HomeHero providers from day one.
            </p>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Documents you'll need</h4>
            <ul className="theme-check-list">
              {REQUIRED_DOCUMENTS.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </div>

          <div className="theme-glass-card animate-fade-in-up delay-2" style={{ flex: '1 1 280px' }}>
            <span className="hh-section-kicker">Membership</span>
            <h3>Simple monthly pricing</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              A membership is required to go online and receive bookings, even after verification is
              approved.
            </p>
            <div className="theme-glass-card" style={{ background: 'var(--color-primary-50)', textAlign: 'center', padding: 'var(--space-lg)' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-secondary-700)' }}>
                LKR 4,999<span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>/month</span>
              </div>
              <p style={{ marginBottom: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                per service category - two categories renew at a discounted combined rate
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section hh-steps-section">
        <div className="container">
          <div className="text-center" style={{ maxWidth: 640, margin: '0 auto var(--space-xl)' }}>
            <span className="hh-section-kicker">How to register</span>
            <h2 className="section-title">Become a HomeHero provider in three steps</h2>
          </div>
          <div className="hh-steps-grid">
            {STEPS.map((step, index) => (
              <div key={step.title} className={`hh-step-card animate-fade-in-up delay-${index + 1}`}>
                <div className="hh-step-icon-ring">
                  <span aria-hidden="true">{step.icon}</span>
                  <span className="hh-step-number">{index + 1}</span>
                </div>
                <h3>{step.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 0 }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="theme-image-cta">
        <div className="theme-image-cta-bg" style={{ backgroundImage: `url(${CAREERS_GROWTH_BG_IMAGE_URL})` }} aria-hidden="true" />
        <div className="theme-image-cta-overlay" aria-hidden="true" />
        <div className="container">
          <div className="glass-panel collage-cta-panel animate-fade-in-up" style={{ margin: '0 auto' }}>
            <div className="hh-cta-icon" aria-hidden="true">
              🧑‍🔧
            </div>
            <h2>Ready to grow your business?</h2>
            <p>Join HomeHero today and start receiving verified booking requests from homeowners near you.</p>
            <Link
              to={ROUTES.REGISTER_PROVIDER}
              className="btn btn-primary btn-shine"
              style={{ backgroundColor: 'var(--color-neutral-0)', color: 'var(--color-secondary-700)' }}
            >
              Register as a Service Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
