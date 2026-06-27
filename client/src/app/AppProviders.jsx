import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { AlertProvider } from '../context/AlertContext.jsx';

export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>{children}</AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
