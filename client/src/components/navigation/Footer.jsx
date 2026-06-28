import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-secondary-700)',
        color: 'var(--color-primary-100)',
        marginTop: 'auto',
        // A thin gradient line ties the footer back to the brand colors
        // used in the header and buttons, instead of a plain flat edge.
        borderTop: '3px solid transparent',
        borderImage: 'linear-gradient(90deg, var(--color-primary-400), var(--color-primary-700)) 1',
      }}
    >
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
        <div style={{ maxWidth: 320 }}>
          <h3 style={{ color: 'var(--color-neutral-0)' }}>HomeHero</h3>
          <p style={{ color: 'var(--color-primary-100)' }}>
            Connecting Sri Lankan homeowners with trusted, verified service professionals.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'var(--color-neutral-0)' }}>Company</h4>
          <p><Link to={ROUTES.ABOUT}>About Us</Link></p>
          <p><Link to={ROUTES.CAREERS}>Careers</Link></p>
          <p><Link to={ROUTES.CONTACT}>Contact Us</Link></p>
        </div>

        <div>
          <h4 style={{ color: 'var(--color-neutral-0)' }}>Get Started</h4>
          <p><Link to={ROUTES.REGISTER_CLIENT}>Book a Service</Link></p>
          <p><Link to={ROUTES.REGISTER_PROVIDER}>Become a Provider</Link></p>
          <p><Link to={ROUTES.LOGIN}>Login</Link></p>
        </div>

        <div>
          <h4 style={{ color: 'var(--color-neutral-0)' }}>Contact</h4>
          <p>support@homehero.lk</p>
          <p>+94 11 234 5678</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: 'var(--space-md)', borderTop: '1px solid rgba(255,255,255,0.12)', fontSize: 'var(--font-size-sm)' }}>
        © {new Date().getFullYear()} HomeHero. All rights reserved.
      </div>
    </footer>
  );
}
