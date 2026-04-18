import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const SMILIES = ["(kitsune)", "(kitchat)", "(kitdance)", "(kitheaven)", "(kitwind)", "(kitstorm)", "(kitnight)", "(kitcool)", "(kitaqua)", "(kitfire)", "(kitice)", "(kitlove)", "(kitnature)", "(kithalo)", "(kitmask)", "(kitraio)", "(kitread)", "(kitninja)", "(kitpirate)", "(kitcowboy)"];

export const UltimoPower = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen animated-gradient-bg">
      <Header />

      <FloatingBlob color="blue" size="xl" position={{ top: "5%", left: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="lg" position={{ top: "15%", right: "5%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="md" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />

      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-16">
        <div className="fade-in-up">
          <GlassCard className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <img
                src="https://xatimg.com/image/jgvHDBjhBNhQ.gif"
                alt="Kitsune Power"
                width={96}
                height={96}
                className="w-24 h-24 rounded-xl object-cover shadow-lg"
              />
              <div className="flex-1">
                <p className="text-sm uppercase tracking-wider text-labxat-purple font-semibold mb-1">
                  {t("ultimoPower")}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Kitsune <span className="text-foreground/60 text-xl">(ID: 737)</span>
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-background/30 rounded-lg p-3">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">{t("status")}</p>
                <p className="text-foreground font-medium">Limited</p>
              </div>
              <div className="bg-background/30 rounded-lg p-3">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">{t("group")}</p>
                <p className="text-foreground font-medium">❌</p>
              </div>
              <div className="bg-background/30 rounded-lg p-3">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">{t("epic")}</p>
                <p className="text-foreground font-medium">❌</p>
              </div>
              <div className="bg-background/30 rounded-lg p-3">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">{t("storePrice")}</p>
                <p className="text-foreground font-medium">333 xats</p>
              </div>
              <div className="bg-background/30 rounded-lg p-3">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">{t("tradePrice")}</p>
                <p className="text-foreground font-medium">1,500 - 2,500 xats</p>
              </div>
              <div className="bg-background/30 rounded-lg p-3">
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">{t("tradeDays")}</p>
                <p className="text-foreground font-medium">111 - 185 days</p>
              </div>
            </div>

            <div className="bg-background/20 rounded-xl p-4">
              <p className="text-sm text-foreground/70 font-medium mb-3 uppercase tracking-wider">
                {t("smiliesOfPower")}
              </p>
              <div className="flex flex-wrap gap-2">
                {SMILIES.map((s, i) => (
                  <span key={i} className="bg-labxat-purple/20 text-labxat-purple px-2.5 py-1 rounded-md text-sm font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          <div className="mt-6 text-center">
            <Link to="/" className="text-labxat-purple hover:underline text-sm">← {t("home")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UltimoPower;
