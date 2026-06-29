import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ProviderSidebar from '../components/navigation/ProviderSidebar.jsx';
import ProviderTopbar from '../components/navigation/ProviderTopbar.jsx';
import '../styles/provider.css';

export default function ProviderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="provider-shell">
      <ProviderSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="provider-main">
        <ProviderTopbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
