import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

export default function RegistrationRolePage() {
  return (
    <div className="container section text-center">
      <h1 className="section-title">Join HomeHero</h1>
      <p className="section-subtitle">Tell us how you'd like to use HomeHero.</p>

      <div style={{ display: 'flex', gap: 'var(--space-xl)', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* "card-interactive" gives these clickable cards a hover lift,
            and removing the underline keeps them looking like buttons
            instead of plain text links. */}
        <Link
          to={ROUTES.REGISTER_CLIENT}
          className="card card-interactive animate-fade-in-up delay-1"
          style={{ padding: 'var(--space-xl)', width: 280, textDecoration: 'none' }}
        >
          <div style={{ fontSize: '3rem' }}>🏠</div>
          <h3>I'm a Client</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Book trusted service providers for your home.</p>
        </Link>

        <Link
          to={ROUTES.REGISTER_PROVIDER}
          className="card card-interactive animate-fade-in-up delay-2"
          style={{ padding: 'var(--space-xl)', width: 280, textDecoration: 'none' }}
        >
          <div style={{ fontSize: '3rem' }}>🧑‍🔧</div>
          <h3>I'm a Service Provider</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Offer your services and grow your business.</p>
        </Link>
      </div>
    </div>
  );
}
