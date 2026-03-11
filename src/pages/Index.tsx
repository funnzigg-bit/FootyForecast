import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TrendingPredictions from "@/components/landing/TrendingPredictions";
import ConfidenceHeatmap from "@/components/landing/ConfidenceHeatmap";
import LeaguesSection from "@/components/landing/LeaguesSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const SectionDivider = () => (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="section-divider" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SectionDivider />
      <TrendingPredictions />
      <SectionDivider />
      <ConfidenceHeatmap />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <LeaguesSection />
      <SectionDivider />
      <PricingSection />
      <SectionDivider />
      <TestimonialsSection />
      <SectionDivider />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
