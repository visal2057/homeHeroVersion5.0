import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/navigation/PublicHeader.jsx';
import Footer from '../components/navigation/Footer.jsx';

export default function ClientLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      {/* .client-scale bumps element sizing ~20% for the Client operation
          pages only (see global.css) — the header/footer stay outside it so
          they stay the same size everywhere, including the public Home page
          the Client also uses, which is rendered outside this layout. */}
      <main className="client-scale" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
