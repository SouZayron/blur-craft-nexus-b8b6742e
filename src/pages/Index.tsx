import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { ToolButton } from "@/components/ToolButton";
import { Palette, Sparkles, Dices, Download, Smile, UserCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";

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
    {
      name: "Editor de Avatar",
      icon: UserCircle,
      onClick: () => navigate("/avatar-editor"),
      gradient: "purple" as const,
    },
  ], [t, navigate]);

  const shopServices = useMemo(() => [
    { key: "fundos", price: "1000 xats" },
    { key: "pcbacks", price: "400 xats" },
    { key: "xatspace", price: "1500 xats" },
    { key: "logotipo", price: "1500 xats" },
    { key: "pstyle", price: "350 xats" },
    { key: "xmoji", price: "400 xats" },
  ], []);

  return (
    <div className="animated-gradient-bg min-h-screen relative">
      <Header />

      {/* Floating Blobs - decorative, lazy rendered. Fixed so they stay in viewport while scrolling */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <FloatingBlob color="blue" size="xl" position={{ top: "5%", left: "-5%" }} animation="float" />
        <FloatingBlob color="purple" size="lg" position={{ top: "15%", right: "5%" }} animation="float-delayed" />
        <FloatingBlob color="pink" size="md" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />
        <FloatingBlob color="green" size="lg" position={{ bottom: "15%", right: "-5%" }} animation="float" />
        <FloatingBlob color="lilac" size="md" position={{ top: "45%", left: "60%" }} animation="float-delayed" />
      </div>

      {/* Main Content - flows naturally, AdSense ads can be placed inline */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-28 pb-16">
        {/* Two Column Layout */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          {/* Left Column - Último Power */}
          <div className="fade-in-up">
            <GlassCard className="p-5 md:p-6 h-full flex flex-col">
              <div className="flex items-start gap-4 mb-5">
                <img
                  src="https://gs.xat.com/a_(leafy)_40"
                  alt="Power Leafy do xat"
                  width={80}
                  height={80}
                  className="rounded-xl object-contain bg-background/30 shadow-lg p-2 shrink-0"
                  style={{ width: 80, height: 80, aspectRatio: "1 / 1" }}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-labxat-purple font-semibold mb-1">
                    {t("ultimoPower")}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Leafy</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                <div className="bg-labxat-blue/15 border border-labxat-blue/25 rounded-lg p-2.5">
                  <p className="text-[10px] text-foreground/70 uppercase tracking-wider mb-0.5">{t("status")}</p>
                  <p className="text-foreground text-sm font-medium">Ilimitado</p>
                </div>
                <div className="bg-labxat-purple/15 border border-labxat-purple/25 rounded-lg p-2.5">
                  <p className="text-[10px] text-foreground/70 uppercase tracking-wider mb-0.5">{t("group")}</p>
                  <p className="text-foreground text-sm font-medium">❌</p>
                </div>
                <div className="bg-labxat-pink/15 border border-labxat-pink/25 rounded-lg p-2.5">
                  <p className="text-[10px] text-foreground/70 uppercase tracking-wider mb-0.5">{t("epic")}</p>
                  <p className="text-foreground text-sm font-medium">❌</p>
                </div>
                <div className="bg-labxat-green/15 border border-labxat-green/25 rounded-lg p-2.5">
                  <p className="text-[10px] text-foreground/70 uppercase tracking-wider mb-0.5">{t("storePrice")}</p>
                  <p className="text-foreground text-sm font-medium">220 xats</p>
                </div>
                <div className="bg-labxat-lilac/15 border border-labxat-lilac/25 rounded-lg p-2.5">
                  <p className="text-[10px] text-foreground/70 uppercase tracking-wider mb-0.5">{t("tradePrice")}</p>
                  <p className="text-foreground text-sm font-medium">180 - 200 xats</p>
                </div>
                <div className="bg-labxat-blue/15 border border-labxat-blue/25 rounded-lg p-2.5">
                  <p className="text-[10px] text-foreground/70 uppercase tracking-wider mb-0.5">{t("tradeDays")}</p>
                  <p className="text-foreground text-sm font-medium">12 - 15 days</p>
                </div>
              </div>

              <div className="bg-background/20 rounded-xl p-3 mt-auto">
                <p className="text-xs text-foreground/70 font-medium mb-2 uppercase tracking-wider">
                  {t("smiliesOfPower")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["(leafy)", "(leafycb)", "(leafyhair)", "(leafymb)", "(leafydt)"].map((s) => (
                    <span key={s} className="bg-labxat-purple/20 text-labxat-purple px-2 py-0.5 rounded-md text-xs font-mono">
                      {s}
                    </span>
                  ))}
                </div>
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
                  className="bg-background/30 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10 hover:border-labxat-purple/50 transition-all duration-300"
                >
                  <h3 className="text-foreground font-semibold text-sm md:text-base mb-1">
                    {t(service.key)}
                  </h3>
                  <p className="text-labxat-purple text-xs font-semibold">
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
              aria-label="Fale comigo no xat.com/mixhits (abre em nova aba)"
              className="bg-[hsl(280_85%_42%)] hover:bg-[hsl(280_85%_36%)] text-white font-bold text-lg px-12 py-4 rounded-xl transition-colors duration-300 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labxat-pink focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("contact")}
            </a>
          </div>
        </section>

        {/* Footer inline */}
        <footer className="mt-12 text-center pb-6">
          <p className="text-foreground/70 text-xs">
            Feito por{" "}
            <a
              href="https://xat.com/mixhits"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Perfil de Zaru no xat (abre em nova aba)"
              className="text-labxat-purple hover:underline font-semibold"
            >
              Zaru
            </a>{" "}
            - 2025 · {t("copyright")}
          </p>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <Link to="/privacidade" className="text-foreground/70 hover:text-labxat-purple transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link to="/termos" className="text-foreground/70 hover:text-labxat-purple transition-colors">
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

    </div>
  );
};

export default Index;
