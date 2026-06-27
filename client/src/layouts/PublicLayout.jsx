import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/navigation/PublicHeader.jsx';
import Footer from '../components/navigation/Footer.jsx';

export default function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
