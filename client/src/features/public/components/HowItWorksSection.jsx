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
    <section className="section lr-timeline-section">
      <span className="lr-spot" style={{ top: -80, right: '10%', width: 380, height: 320, background: 'radial-gradient(ellipse, rgba(16,185,129,0.24), transparent 64%)' }} />
      <span className="lr-spot" style={{ bottom: -100, left: '6%', width: 260, height: 240, background: 'radial-gradient(circle, rgba(6,78,59,0.20), transparent 62%)' }} />

      <div className="container lr-timeline-grid">
        <div className="lr-timeline-intro animate-fade-in-up">
          <h2>How It Works</h2>
          <p>Booking a HomeHero service takes three simple, stress-free steps.</p>
        </div>

        <div className="lr-timeline-rail">
          {STEPS.map((step, index) => (
            <div key={step.title} className={`lr-timeline-step animate-fade-in-up delay-${index + 1}`}>
              <span className="lr-timeline-dot" aria-hidden="true"><step.Icon size={20} /></span>
              <h3>{step.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 0 }}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
