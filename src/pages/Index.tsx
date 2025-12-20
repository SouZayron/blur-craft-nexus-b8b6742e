import { HeroSection } from "@/components/HeroSection";
import { ToolsSection } from "@/components/ToolsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen animated-gradient-bg overflow-x-hidden">
      <HeroSection />
      <ToolsSection />
      <Footer />
    </main>
  );
};

export default Index;
