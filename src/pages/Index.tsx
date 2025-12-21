import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { ToolButton } from "@/components/ToolButton";
import { Palette, Sparkles, Dices, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const tools = [
    {
      name: t("nickGenerator"),
      icon: Sparkles,
      onClick: () => navigate("/nicks"),
      gradient: "blue" as const,
    },
    {
      name: t("colorGenerator"),
      icon: Palette,
      onClick: () => navigate("/cores"),
      gradient: "purple" as const,
    },
    {
      name: t("bingoGame"),
      icon: Dices,
      onClick: () => navigate("/bingo"),
      gradient: "pink" as const,
    },
    {
      name: "Graphics FREE",
      icon: Download,
      onClick: () => navigate("/graphics"),
      gradient: "green" as const,
    },
  ];

  return (
    <div className="h-screen overflow-hidden animated-gradient-bg">
      <Header />

      {/* Floating Blobs */}
      <FloatingBlob color="blue" size="xl" position={{ top: "5%", left: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="lg" position={{ top: "15%", right: "5%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="md" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />
      <FloatingBlob color="green" size="lg" position={{ bottom: "15%", right: "-5%" }} animation="float" />
      <FloatingBlob color="lilac" size="md" position={{ top: "45%", left: "60%" }} animation="float-delayed" />

      {/* Main Content */}
      <main className="relative z-10 h-full flex flex-col items-center justify-start px-4 pt-28 pb-16 overflow-y-auto">
        {/* News Block - Ultimo Power */}
        <div className="w-full max-w-2xl mb-8 md:mb-12">
          <GlassCard className="fade-in-up p-5 md:p-6">
            {/* Header with Image and Title */}
            <div className="flex items-start gap-4 mb-5">
              <img 
                src="https://xatimg.com/image/YuaLbdfuX4Q8.png" 
                alt="Ratmas Power" 
                className="w-20 h-20 rounded-xl object-cover shadow-lg"
              />
              <div className="flex-1">
                <p className="text-sm uppercase tracking-wider text-labxat-purple font-semibold mb-1">
                  {t("ultimoPower")}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Ratmas <span className="text-foreground/60 text-base">(ID: 734)</span>
                </h2>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
              <div className="bg-background/30 rounded-lg p-2.5">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-0.5">{t("status")}</p>
                <p className="text-foreground font-medium text-sm">{t("unlimited")}</p>
              </div>
              <div className="bg-background/30 rounded-lg p-2.5">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-0.5">{t("group")}</p>
                <p className="text-foreground font-medium text-sm">❌</p>
              </div>
              <div className="bg-background/30 rounded-lg p-2.5">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-0.5">{t("epic")}</p>
                <p className="text-foreground font-medium text-sm">❌</p>
              </div>
              <div className="bg-background/30 rounded-lg p-2.5">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-0.5">{t("storePrice")}</p>
                <p className="text-foreground font-medium text-sm">25 days</p>
              </div>
              <div className="bg-background/30 rounded-lg p-2.5">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-0.5">{t("tradePrice")}</p>
                <p className="text-foreground font-medium text-sm">300 - 375 xats</p>
              </div>
              <div className="bg-background/30 rounded-lg p-2.5">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-0.5">{t("tradeDays")}</p>
                <p className="text-foreground font-medium text-sm">21 - 24 days</p>
              </div>
            </div>

            {/* Smilies Section */}
            <div className="bg-background/20 rounded-xl p-3">
              <p className="text-xs text-foreground/70 font-medium mb-2 uppercase tracking-wider">
                {t("smiliesOfPower")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["(ratmas)", "(rmblanket)", "(rmgift)", "(rmelf)", "(rmblanketop)", "(rmlightstop)", "(rmreindeertop)", "(rmornamentback)", "(rmlights)", "(rmornament)", "(rmbow)", "(rmantlers)", "(rmsanta)", "(rmstocking)", "(rmmtoe)", "(rmback)"].map((smiley, index) => (
                  <span 
                    key={index}
                    className="bg-labxat-purple/20 text-labxat-purple px-2 py-0.5 rounded-md text-xs font-mono"
                  >
                    {smiley}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tools Section */}
        <div className="w-full max-w-4xl fade-in-up-delayed mb-8 md:mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {tools.map((tool, index) => (
              <div
                key={tool.name}
                className="scale-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <ToolButton 
                  onClick={tool.onClick} 
                  gradient={tool.gradient} 
                  icon={tool.icon}
                  label={tool.name}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer inline */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <p className="text-muted-foreground text-xs">Feito com amor Zayron - 2025 · {t("copyright")}</p>
          <div className="mt-2 flex justify-center gap-1">
            <div className="w-8 h-0.5 rounded-full bg-labxat-blue/50" />
            <div className="w-8 h-0.5 rounded-full bg-labxat-purple/50" />
            <div className="w-8 h-0.5 rounded-full bg-labxat-pink/50" />
          </div>
        </div>
      </main>

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-labxat-blue/50 float" />
      <div className="absolute top-3/4 right-1/4 w-4 h-4 rounded-full bg-labxat-pink/50 float-delayed" />
      <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-labxat-purple/50 float-slow" />
    </div>
  );
};

export default Index;