import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm.jsx';
import { ROUTES } from '../../../constants/routes.js';

export default function LoginPage() {
  return (
    <div className="container section">
      <h1 className="section-title text-center">Welcome Back</h1>
      <p className="section-subtitle text-center">Log in to your HomeHero account.</p>
      <LoginForm />
      <p className="text-center" style={{ marginTop: 'var(--space-lg)' }}>
        Don't have an account? <Link to={ROUTES.REGISTER_ROLE}>Sign up</Link>
      </p>
    </div>
  );
}
