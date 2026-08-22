import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { useLanguage } from "@/contexts/LanguageContext";

export const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen zgames-page zgames-grid-line relative overflow-hidden">
      <Header />
      
      <FloatingBlob 
        color="purple" 
        size="xl" 
        position={{ top: "5rem", left: "-12rem" }} 
      />
      <FloatingBlob 
        color="blue" 
        size="lg" 
        position={{ bottom: "5rem", right: "-10rem" }} 
        animation="float-delayed"
      />

      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-black text-gradient mb-8">
              {t("aboutTitle")}
            </h1>
            
            <div className="space-y-6 text-foreground/80 leading-relaxed">
              <p>
                {t("aboutIntro")}
              </p>
              
              <p>
                {t("aboutObjective")}
              </p>
              
              <p>
                {t("aboutMission")}
              </p>
              
              <p className="text-sm text-foreground/60 italic">
                {t("aboutDisclaimer")}
              </p>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};
