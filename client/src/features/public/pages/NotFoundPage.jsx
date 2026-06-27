import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

export default function NotFoundPage() {
  return (
    <div className="container section text-center">
      <h1 className="section-title">404 - Page Not Found</h1>
      <p className="section-subtitle">The page you are looking for does not exist.</p>
      <Link to={ROUTES.HOME} className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
