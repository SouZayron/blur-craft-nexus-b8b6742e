import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { ToolButton } from "@/components/ToolButton";
import { Palette, Sparkles, Dices, Download, Smile } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { memo, useMemo } from "react";

// Memoized smilies component to prevent re-renders
const SmiliesList = memo(({ smilies }: { smilies: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {smilies.map((smiley, index) => (
      <span 
        key={index}
        className="bg-labxat-purple/20 text-labxat-purple px-2 py-0.5 rounded-md text-xs font-mono"
      >
        {smiley}
      </span>
    ))}
  </div>
));
SmiliesList.displayName = "SmiliesList";

const SMILIES = ["(ratmas)", "(rmblanket)", "(rmgift)", "(rmelf)", "(rmblanketop)", "(rmlightstop)", "(rmreindeertop)", "(rmornamentback)", "(rmlights)", "(rmornament)", "(rmbow)", "(rmantlers)", "(rmsanta)", "(rmstocking)", "(rmmtoe)", "(rmback)"];

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const tools = useMemo(() => [
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
      name: t("graphicsFree"),
      icon: Download,
      onClick: () => navigate("/graphics"),
      gradient: "green" as const,
    },
    {
      name: "Emojis",
      icon: Smile,
      onClick: () => navigate("/emojis"),
      gradient: "blue" as const,
    },
  ], [t, navigate]);

  const shopServices = useMemo(() => [
    { key: "fundos", price: "600 xats" },
    { key: "pcbacks", price: "400 xats" },
    { key: "xatspace", price: "1500 xats" },
    { key: "logotipo", price: "1500 xats" },
    { key: "pstyle", price: "350 xats" },
    { key: "xmoji", price: "400 xats" },
  ], []);

  return (
    <div className="h-screen overflow-hidden animated-gradient-bg">
      <Header />

      {/* Floating Blobs - decorative, lazy rendered */}
      <FloatingBlob color="blue" size="xl" position={{ top: "5%", left: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="lg" position={{ top: "15%", right: "5%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="md" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />
      <FloatingBlob color="green" size="lg" position={{ bottom: "15%", right: "-5%" }} animation="float" />
      <FloatingBlob color="lilac" size="md" position={{ top: "45%", left: "60%" }} animation="float-delayed" />

      {/* Main Content */}
      <main className="relative z-10 h-full flex flex-col items-center justify-start px-4 pt-28 pb-16 overflow-y-auto">
        {/* Two Column Layout */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          {/* Left Column - News Block */}
          <div className="fade-in-up">
            <GlassCard className="p-5 md:p-6 h-full">
              {/* Header with Image and Title */}
              <div className="flex items-start gap-4 mb-5">
                {/* LCP Image - optimized with explicit dimensions and fetchpriority */}
                <img 
                  src="https://xatimg.com/image/YuaLbdfuX4Q8.png" 
                  alt="Ratmas Power" 
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-xl object-cover shadow-lg"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-wider text-labxat-purple font-semibold mb-1">
                    {t("ultimoPower")}
                  </p>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    Ratmas <span className="text-foreground/60 text-base">(ID: 734)</span>
                  </h1>
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
                <SmiliesList smilies={SMILIES} />
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Tools */}
          <div className="fade-in-up-delayed flex flex-col gap-4">
            {tools.map((tool, index) => (
              <div
                key={tool.name}
                className="scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
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

        {/* ShopLAB Section */}
        <section className="w-full max-w-6xl mt-6 fade-in-up" aria-labelledby="shoplab-title">
          <GlassCard className="p-5 md:p-6">
            <h2 id="shoplab-title" className="text-xl md:text-2xl font-bold text-foreground mb-5 text-center">
              Shop<span className="text-labxat-purple">LAB</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {shopServices.map((service) => (
                <div
                  key={service.key}
                  className="bg-background/30 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10 hover:border-labxat-purple/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <h3 className="text-foreground font-semibold text-sm md:text-base mb-1">
                    {t(service.key)}
                  </h3>
                  <p className="text-labxat-purple text-xs font-medium">
                    {service.price}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
          
          {/* Contact Button */}
          <div className="mt-4 flex justify-center">
            <a
              href="https://xat.com/mixhits"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-labxat-purple hover:bg-labxat-purple/80 text-white font-bold text-lg px-12 py-4 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-labxat-purple/30 animate-pulse-scale"
            >
              {t("contact")}
            </a>
          </div>
        </section>

        {/* Footer inline */}
        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <p className="text-muted-foreground text-xs">Feito com amor Zayron - 2025 · {t("copyright")}</p>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <Link to="/privacidade" className="text-muted-foreground hover:text-labxat-purple transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link to="/termos" className="text-muted-foreground hover:text-labxat-purple transition-colors">
              {t("termsOfService")}
            </Link>
          </div>
          <div className="mt-2 flex justify-center gap-1" aria-hidden="true">
            <div className="w-8 h-0.5 rounded-full bg-labxat-blue/50" />
            <div className="w-8 h-0.5 rounded-full bg-labxat-purple/50" />
            <div className="w-8 h-0.5 rounded-full bg-labxat-pink/50" />
          </div>
        </footer>
      </main>

      {/* Decorative circles - hidden from accessibility tree */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-labxat-blue/50 float" aria-hidden="true" />
      <div className="absolute top-3/4 right-1/4 w-4 h-4 rounded-full bg-labxat-pink/50 float-delayed" aria-hidden="true" />
      <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-labxat-purple/50 float-slow" aria-hidden="true" />
    </div>
  );
};

export default Index;
