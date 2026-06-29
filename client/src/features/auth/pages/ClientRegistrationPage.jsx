import ClientRegistrationForm from '../components/ClientRegistrationForm.jsx';
import { REGISTER_CLIENT_HERO_IMAGE_URL } from '../../../constants/pageImages.js';
import { IconHome } from '../../../components/common/icons.jsx';

export default function ClientRegistrationPage() {
  return (
    <div>
      <section className="glass-hero register-hero">
        <div
          className="glass-hero-bg"
          style={{ backgroundImage: `url(${REGISTER_CLIENT_HERO_IMAGE_URL})` }}
          role="img"
          aria-label="A homeowner relaxing comfortably in a tidy living room"
        />
        <div className="glass-hero-overlay" aria-hidden="true" />
        <div className="container glass-hero-inner">
          <div className="glass-panel glass-hero-panel text-center animate-fade-in-up" style={{ margin: '0 auto' }}>
            <div className="hh-float-gentle">
              <span className="hh-eyebrow"><IconHome size={16} /> Client Sign Up</span>
              <h1 className="register-hero-title">Create Your Client Account</h1>
              <p>Book trusted service providers in minutes.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container section">
        <ClientRegistrationForm />
      </div>
    </div>
  );
}
