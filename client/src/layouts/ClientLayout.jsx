import { Outlet } from 'react-router-dom';
import ClientHeader from '../components/navigation/ClientHeader.jsx';
import Footer from '../components/navigation/Footer.jsx';

export default function ClientLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ClientHeader />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
