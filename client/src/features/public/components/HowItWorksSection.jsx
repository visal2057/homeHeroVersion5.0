import { IconClipboardList, IconUserCheck, IconHome } from '../../../components/common/icons.jsx';

const STEPS = [
  {
    Icon: IconClipboardList,
    title: 'Choose a service',
    description: 'Pick from gardening, cleaning, pet care, plumbing or AC repair.',
  },
  {
    Icon: IconUserCheck,
    title: 'Book a verified hero',
    description: 'Compare reviews and pick a trusted provider near you.',
  },
  {
    Icon: IconHome,
    title: 'Relax, it’s done',
    description: 'Your hero arrives, gets the job done, and you pay securely.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="section hh-steps-section">
      <div className="container">
        <div className="text-center" style={{ maxWidth: 640, margin: '0 auto var(--space-xl)' }}>
          <span className="hh-section-kicker">Simple by design</span>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Booking a HomeHero service takes three simple, stress-free steps.
          </p>
        </div>

        <div className="hh-steps-grid">
          {STEPS.map((step, index) => (
            <div key={step.title} className={`hh-step-card animate-fade-in-up delay-${index + 1}`}>
              <div className="hh-step-icon-ring">
                <step.Icon size={30} aria-hidden="true" />
                <span className="hh-step-number">{index + 1}</span>
              </div>
              <h3>{step.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 0 }}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
