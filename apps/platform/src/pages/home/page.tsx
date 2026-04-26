import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import HeroSection from "./components/HeroSection";
import StatsBar from "./components/StatsBar";
import SectorSection from "./components/SectorSection";
import JobsSection from "./components/JobsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import AffiliateSection from "./components/AffiliateSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CTASection from "./components/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* 1. Hero com busca */}
        <HeroSection />

        {/* 2. Barra de números */}
        <StatsBar />

        {/* 3. Explorar por setor ou função */}
        <SectorSection />

        {/* 4. Vagas disponíveis hoje (Supabase real + fallback) */}
        <JobsSection />

        {/* 5. Como funciona */}
        <HowItWorksSection />

        {/* 6. Cursos afiliados */}
        <AffiliateSection />

        {/* 7. Depoimentos */}
        <TestimonialsSection />

        {/* 8. CTA final */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
