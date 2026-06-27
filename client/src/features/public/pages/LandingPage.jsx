import HeroSection from '../components/HeroSection.jsx';
import ServicesSection from '../components/ServicesSection.jsx';
import HowItWorksSection from '../components/HowItWorksSection.jsx';
import GetStartedSection from '../components/GetStartedSection.jsx';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <GetStartedSection />
    </>
  );
}
