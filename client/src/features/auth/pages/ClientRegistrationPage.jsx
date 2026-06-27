import ClientRegistrationForm from '../components/ClientRegistrationForm.jsx';

export default function ClientRegistrationPage() {
  return (
    <div className="container section">
      <h1 className="section-title text-center">Create Your Client Account</h1>
      <p className="section-subtitle text-center">Book trusted service providers in minutes.</p>
      <ClientRegistrationForm />
    </div>
  );
}
