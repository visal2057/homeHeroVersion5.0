import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import AppProviders from './AppProviders.jsx';
import AppRouter from './router.jsx';
import AlertMessage from '../components/common/AlertMessage.jsx';
import { useAlert } from '../hooks/useAlert.js';

function AlertHost() {
  const { alerts, dismissAlert } = useAlert();

  return (
    <div className="alert-stack">
      {alerts.map((alert) => (
        <AlertMessage key={alert.id} type={alert.type} message={alert.message} onDismiss={() => dismissAlert(alert.id)} />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AlertHost />
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}
