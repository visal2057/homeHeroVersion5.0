import { useNavigate } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../../../constants/serviceCategories.js';
import {
  ABOUT_HERO_IMAGE_URL,
  ABOUT_BROWSING_IMAGE_URL,
  ABOUT_HOMEOWNERS_IMAGE_URL,
  ABOUT_PROFESSIONAL_IMAGE_URL,
  ABOUT_TRUST_BG_IMAGE_URL,
} from '../../../constants/pageImages.js';
import { ROUTES } from '../../../constants/routes.js';
import ServiceCard from '../components/ServiceCard.jsx';

export default function AboutUsPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Compact glass hero band - same recipe as the homepage hero
          (background photo + tinted overlay + frosted panel), just
          shorter, so the page still feels like part of the same site. */}
      <section className="glass-hero theme-page-hero">
        <div
          className="glass-hero-bg"
          style={{ backgroundImage: `url(${ABOUT_HERO_IMAGE_URL})` }}
          role="img"
          aria-label="A cozy home with a covered porch"
        />
        <div className="glass-hero-overlay" aria-hidden="true" />
        <div className="container glass-hero-inner">
          <div className="glass-panel glass-hero-panel animate-fade-in-up">
            <span className="hh-eyebrow">🏡 About HomeHero</span>
            <h1 className="theme-page-hero-title">Built for the way Sri Lankans care for their homes</h1>
            <p className="theme-page-hero-subtitle">
              We connect homeowners with verified, trustworthy professionals - so your home always feels safe,
              cared for, and a little more like home.
            </p>
          </div>
        </div>
      </section>

      <section className="section theme-section-white">
        <div className="container" style={{ display: 'grid', gap: 'var(--space-2xl)' }}>
          <div className="split-row animate-fade-in-up">
            <div className="theme-photo-frame">
              <img src={ABOUT_BROWSING_IMAGE_URL} alt="Homeowners browsing services together on a laptop" />
            </div>
            <div className="split-row-text">
              <span className="hh-section-kicker">What we are</span>
              <h3>A household services booking platform</h3>
              <p>
                HomeHero is a household services booking platform that connects homeowners across Sri Lanka
                with verified, professional service providers in five categories: gardening, cleaning, pet
                care, plumbing and air conditioner repair - all from one simple, trustworthy place.
              </p>
            </div>
          </div>

          <div className="theme-glass-card animate-fade-in-up delay-2">
            <span className="hh-section-kicker">The problem we solve</span>
            <h3>Finding someone you can trust shouldn't be hard</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 0 }}>
              Finding a reliable, background-checked service professional is hard - unreliable contacts,
              no-shows, and no way to know who actually does good work. HomeHero removes the guesswork by
              verifying every provider's identity and police report before they can accept a single booking,
              and by giving homeowners transparent ratings and reviews from real completed jobs.
            </p>
          </div>
        </div>
      </section>

      {/* "Our purpose" - its own dedicated, clearly-labelled section so the
          platform's purpose is unmistakable, not folded into other text. */}
      <section className="section theme-section-tint">
        <div className="container text-center" style={{ maxWidth: 720, margin: '0 auto' }}>
          <span className="hh-section-kicker">Our purpose</span>
          <h2 className="section-title">Making trustworthy home care effortless</h2>
          <p className="section-subtitle">
            HomeHero exists to close the gap between homeowners who need reliable help and skilled local
            professionals who deserve steady, fairly-paid work - matched quickly, verified properly, and paid
            for safely, every time.
          </p>
        </div>
      </section>

      <section className="section theme-section-white">
        <div className="container">
          <div className="text-center" style={{ maxWidth: 640, margin: '0 auto var(--space-xl)' }}>
            <span className="hh-section-kicker">What we offer</span>
            <h2 className="section-title">Five supported services</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Every booking on HomeHero falls into one of these five trusted categories.
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
                animationDelayClass={`delay-${Math.min(index + 1, 5)}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section theme-section-tint">
        <div className="container" style={{ display: 'grid', gap: 'var(--space-2xl)' }}>
          <div className="split-row animate-fade-in-up">
            <div className="theme-photo-frame">
              <img src={ABOUT_HOMEOWNERS_IMAGE_URL} alt="A happy couple relaxing comfortably at home" />
            </div>
            <div className="split-row-text">
              <span className="hh-section-kicker">For homeowners</span>
              <h3>How we help homeowners</h3>
              <p>
                Browse providers by category and district, compare ratings and hourly rates, book in a few
                clicks, and pay by cash or card with a transparent 5% platform fee on card payments - no
                guesswork, no surprises.
              </p>
            </div>
          </div>

          <div className="split-row reverse animate-fade-in-up delay-2">
            <div className="theme-photo-frame">
              <img src={ABOUT_PROFESSIONAL_IMAGE_URL} alt="A tradesperson organizing tools in their workshop" />
            </div>
            <div className="split-row-text">
              <span className="hh-section-kicker">For service providers</span>
              <h3>How we support local professionals</h3>
              <p>
                Service providers build a public portfolio from completed jobs, receive booking requests
                directly in their district, and grow their reputation through verified client reviews -
                turning good work into a steady stream of new clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="theme-image-cta">
        <div className="theme-image-cta-bg" style={{ backgroundImage: `url(${ABOUT_TRUST_BG_IMAGE_URL})` }} aria-hidden="true" />
        <div className="theme-image-cta-overlay" aria-hidden="true" />
        <div className="container">
          <div className="glass-panel collage-cta-panel animate-fade-in-up" style={{ margin: '0 auto' }}>
            <div className="hh-cta-icon" aria-hidden="true">
              🛡️
            </div>
            <h2>Built on trust, convenience and quality</h2>
            <p>
              Every Service Provider submits identity documents and a police report before they can go live,
              and our Verification Admin team personally reviews every application before approval. Provider
              verification isn't an afterthought - it's the foundation everything else on HomeHero is built
              on, alongside our commitment to convenience and quality at every step.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
