import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles/global.css';
import './styles/forms.css';
import './styles/alerts.css';
import './styles/tables.css';
import './styles/responsive.css';
import './styles/homepage.css';
import './styles/admin.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
