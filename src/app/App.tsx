import { Navigation } from "./components/navigation";
import { HeroSection } from "./components/hero-section";
import { FeaturesSection } from "./components/features-section";
import { DashboardPreviewSection } from "./components/dashboard-preview-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { OpenSourceSection } from "./components/open-source-section";
import { Footer } from "./components/footer";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white dark">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DashboardPreviewSection />
        <HowItWorksSection />
        <OpenSourceSection />
      </main>
      <Footer />
    </div>
  );
}
