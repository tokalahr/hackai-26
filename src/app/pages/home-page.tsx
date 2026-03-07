import { HeroSection } from "../components/hero-section";
import { FeaturesSection } from "../components/features-section";
import { DashboardPreviewSection } from "../components/dashboard-preview-section";
import { HowItWorksSection } from "../components/how-it-works-section";

type HomePageProps = {
  onNavigate: (path: string) => void;
};

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <>
      <HeroSection onNavigate={onNavigate} />
      <FeaturesSection />
      <DashboardPreviewSection />
      <HowItWorksSection />
    </>
  );
}
