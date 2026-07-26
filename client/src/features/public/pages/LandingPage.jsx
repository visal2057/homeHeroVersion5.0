import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection.jsx';
import ServicesSection from '../components/ServicesSection.jsx';
import HowItWorksSection from '../components/HowItWorksSection.jsx';
import GetStartedSection from '../components/GetStartedSection.jsx';

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Lets other pages (e.g. Explore's "Back to Categories") navigate here
  // with `state: { scrollTo: '<element id>' }` and land smoothly scrolled to
  // that section, instead of just dropping the visitor at the top. Deferred
  // a tick so it runs after ScrollToTop's instant jump-to-0 on this same
  // route change, and the state is cleared via replace so revisiting via
  // browser back/forward doesn't unexpectedly replay the scroll.
  useEffect(() => {
    const targetId = location.state?.scrollTo;
    if (!targetId) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    navigate(location.pathname, { replace: true, state: {} });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <GetStartedSection />
    </>
  );
}
