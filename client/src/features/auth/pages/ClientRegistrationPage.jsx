import ClientRegistrationForm from '../components/ClientRegistrationForm.jsx';
import { REGISTER_CLIENT_HERO_IMAGE_URL } from '../../../constants/pageImages.js';
import { IconHome } from '../../../components/common/icons.jsx';

export default function ClientRegistrationPage() {
  return (
    <div className="register-page">
      <div
        className="register-page-bg"
        style={{ backgroundImage: `url(${REGISTER_CLIENT_HERO_IMAGE_URL})` }}
        role="img"
        aria-label="A sage-green living room with lush plants and warm wood furniture"
      />
      <div className="register-page-overlay" aria-hidden="true" />
      <div className="container register-page-inner">
        <div className="text-center register-page-heading animate-fade-in-up">
          <div className="hh-float-gentle">
            <span className="hh-eyebrow"><IconHome size={16} /> Client Sign Up</span>
            <h1 className="register-page-title">Create Your Client Account</h1>
            <p className="register-page-subtitle">Tell us a bit about yourself and pin your home so trusted providers can find you.</p>
          </div>
        </div>

        <ClientRegistrationForm />
      </div>
    </div>
  );
}
