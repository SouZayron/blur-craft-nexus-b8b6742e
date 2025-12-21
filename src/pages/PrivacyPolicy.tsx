import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Cookie, Link2, FileText } from "lucide-react";

export const PrivacyPolicy = () => {
  const { t } = useLanguage();

  const sections = [
    {
      icon: FileText,
      title: t("privacyCollectionTitle"),
      content: t("privacyCollectionContent")
    },
    {
      icon: Cookie,
      title: t("privacyCookiesTitle"),
      content: t("privacyCookiesContent")
    },
    {
      icon: Shield,
      title: t("privacySharingTitle"),
      content: t("privacySharingContent")
    },
    {
      icon: Link2,
      title: t("privacyLinksTitle"),
      content: t("privacyLinksContent")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
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
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-black text-gradient">
                {t("privacyTitle")}
              </h1>
            </div>
            
            <p className="text-foreground/80 mb-8">
              {t("privacyIntro")}
            </p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="border-l-2 border-primary/30 pl-6">
                  <div className="flex items-center gap-2 mb-3">
                    <section.icon className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-foreground/70 whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-primary/10 rounded-xl">
              <h3 className="font-bold text-foreground mb-2">{t("privacyConsentTitle")}</h3>
              <p className="text-foreground/70 text-sm">
                {t("privacyConsentContent")}
              </p>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};
