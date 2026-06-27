import ContactForm from '../components/ContactForm.jsx';
import { CONTACT_HERO_IMAGE_URL } from '../../../constants/pageImages.js';

const CONTACT_DETAILS = [
  { icon: '📧', label: 'General Support', value: 'support@homehero.lk' },
  { icon: '📞', label: 'Phone', value: '+94 11 234 5678' },
];

const OFFICE_ADDRESS = 'Sathara Building, Maharagama, Sri Lanka';
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}&output=embed`;

export default function ContactUsPage() {
  return (
    <div>
      <section className="glass-hero theme-page-hero">
        <div
          className="glass-hero-bg"
          style={{ backgroundImage: `url(${CONTACT_HERO_IMAGE_URL})` }}
          role="img"
          aria-label="A friendly support agent ready to help"
        />
        <div className="glass-hero-overlay" aria-hidden="true" />
        <div className="container glass-hero-inner">
          <div className="glass-panel glass-hero-panel animate-fade-in-up">
            <span className="hh-eyebrow">💬 Contact Us</span>
            <h1 className="theme-page-hero-title">We're happy to help</h1>
            <p className="theme-page-hero-subtitle">
              Questions about booking, becoming a provider, or anything else? Reach out and our team will get
              back to you.
            </p>
          </div>
        </div>
      </section>

      <section className="section theme-section-tint">
        <div className="container" style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div className="theme-glass-card animate-fade-in-up" style={{ flex: '1 1 280px' }}>
            <span className="hh-section-kicker">Get in touch</span>
            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Contact information</h3>
            {CONTACT_DETAILS.map((detail) => (
              <div key={detail.label} className="icon-badge-row">
                <span className="hh-step-icon-ring" style={{ width: 48, height: 48, fontSize: '1.2rem', margin: 0 }} aria-hidden="true">
                  {detail.icon}
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-secondary-700)' }}>{detail.label}</div>
                  <div style={{ color: 'var(--color-text-muted)' }}>{detail.value}</div>
                </div>
              </div>
            ))}

            <div className="theme-map-wrap">
              <iframe
                className="theme-map-frame"
                src={MAP_EMBED_SRC}
                title="HomeHero office location on Google Maps"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="theme-map-label">📍 {OFFICE_ADDRESS}</div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
