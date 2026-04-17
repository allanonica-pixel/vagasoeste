import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import HeroSection from "./components/HeroSection";
import NeighborhoodSection from "./components/NeighborhoodSection";
import JobsSection from "./components/JobsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import TestimonialsSection from "./components/TestimonialsSection";
import AffiliateSection from "./components/AffiliateSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <NeighborhoodSection />
        <JobsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <AffiliateSection />
      </main>
      <Footer />
    </div>
  );
}
