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
      <ConfidenceHeatmap />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <LeaguesSection />
      <div className="relative overflow-hidden border-y border-border/60 bg-secondary/10">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative">
          <PricingSection />
          <TestimonialsSection />
          <FAQSection />
        </div>
      </div>
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
