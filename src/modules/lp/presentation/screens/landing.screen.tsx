import { AboutSection } from '../components/landing/about-section';
import { GuaranteesSection } from '../components/landing/guarantees-section';
import { HeroSection } from '../components/landing/hero-section';
import { OfflineUsageSection } from '../components/landing/offline-usage-section';
import { ToolIndexSection } from '../components/landing/tool-index-section';

export function LandingScreen() {
  return (
    <>
      <HeroSection />
      <ToolIndexSection />
      <GuaranteesSection />
      <OfflineUsageSection />
      <AboutSection />
    </>
  );
}
