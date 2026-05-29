import { useState } from "react";
import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Copy, Check, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { searchPalettes, PALETTE_THEMES, PALETTE_CATEGORIES, type StaticPalette } from "@/data/staticPalettes";

interface ParsedPalette {
  name: string;
  code: string;
  glowColor: string;
  angle: number;
  colors: string[];
  animationSpeed: number;
}

const parsePaletteCode = (name: string, code: string): ParsedPalette | null => {
  try {
    const inner = code.replace(/^\(|\)$/g, "");
    const parts = inner.split("#").filter(Boolean);

    let glowColor = "#FFFFFF";
    let angle = 45;
    const colors: string[] = [];
    let animationSpeed = 4;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith("glow")) {
        glowColor = "#" + part.slice(4);
      } else if (part === "grad") {
        // next will be rXX
      } else if (/^r\d+$/.test(part)) {
        angle = parseInt(part.slice(1));
      } else if (/^[A-Fa-f0-9]{6}$/.test(part)) {
        colors.push("#" + part);
      } else if (/^o[1-3]$/.test(part)) {
        animationSpeed = part === "o1" ? 3 : part === "o2" ? 2 : 1;
      } else if (/^f[1-4]$/.test(part)) {
        animationSpeed = part === "f1" ? 6 : part === "f3" ? 8 : 10;
      }
    }

    if (colors.length < 2) return null;
    return { name, code, glowColor, angle, colors, animationSpeed };
  } catch {
    return null;
  }
};

const PalettePreview = ({ palette }: { palette: ParsedPalette }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const gradientStyle = {
    background: `linear-gradient(${palette.angle}deg, ${palette.colors.join(", ")})`,
    backgroundSize: "200% 200%",
    animation: `gradient-flow ${palette.animationSpeed}s ease infinite`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textShadow: `0 0 30px ${palette.glowColor}40`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(palette.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-4 group hover:scale-[1.02] transition-all duration-300">
      <div className="relative overflow-hidden rounded-xl p-6 bg-background/50 mb-3">
        <h3 className="text-2xl md:text-3xl font-bold text-center" style={gradientStyle}>
          {palette.name}
        </h3>
      </div>

      <div className="flex gap-1 justify-center mb-3">
        {palette.colors.map((color, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-lg shadow-md"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div
        className="bg-background/60 border border-white/30 rounded-lg p-2 mb-2 font-mono text-xs break-all text-foreground/80 cursor-pointer select-all"
        onClick={copyCode}
        title={t("copyCode")}
      >
        {palette.code}
      </div>

      <Button variant="ghost" size="sm" className="w-full" onClick={copyCode}>
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            {t("copied")}
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            {t("copyCode")}
          </>
        )}
      </Button>
    </div>
  );
};

const ColorGenerator = () => {
  const [theme, setTheme] = useState("");
  const [palettes, setPalettes] = useState<ParsedPalette[]>([]);
  const [searched, setSearched] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLanguage();

  const runSearch = (query: string) => {
    const q = query.trim();
    if (!q) {
      toast({
        title: t("enterTheme"),
        description: t("enterThemeDesc"),
        variant: "destructive",
      });
      return;
    }
    const results: StaticPalette[] = searchPalettes(q, 10);
    const parsed = results
      .map((r) => parsePaletteCode(r.name, r.code))
      .filter((p): p is ParsedPalette => p !== null);

    setPalettes(parsed);
    setSearched(true);

    if (parsed.length === 0) {
      toast({
        title: t("processingError") || "Nenhum resultado",
        description: "Tente outro tema, ex: azul claro, rosa, neon, fogo, oceano...",
        variant: "destructive",
      });
    }
  };

  const handleQuickTheme = (themeName: string) => {
    setTheme(themeName);
    runSearch(themeName);
  };

  return (
    <div className="min-h-screen animated-gradient-bg">
      <Header />

      <FloatingBlob color="blue" size="xl" position={{ top: "10%", left: "-10%" }} animation="float" />
      <FloatingBlob color="purple" size="lg" position={{ bottom: "20%", right: "-5%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="md" position={{ top: "50%", right: "10%" }} animation="float-slow" />

      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gradient mb-4">
              {t("colorTitle")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Clique em um tema e receba 10 códigos prontos para copiar.
            </p>
          </div>

          <GlassCard className="max-w-xl mx-auto mb-10 fade-in-up-delayed">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="ex: azul claro, rosa, neon, fogo..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch(theme)}
                className="flex-1 bg-white/50 border-white/30 text-foreground placeholder:text-muted-foreground"
              />
              <Button
                onClick={() => runSearch(theme)}
                className="gradient-btn text-white font-semibold px-6 glow-hover"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </div>
          </GlassCard>

          {/* Results appear here, right after search */}
          {palettes.length > 0 && (
            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-up">
              {palettes.map((palette, index) => (
                <div key={index} className="scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <PalettePreview palette={palette} />
                </div>
              ))}
            </div>
          )}

          {/* All themes grouped by category — single step */}
          <div className="space-y-8">
            {PALETTE_CATEGORIES.map((cat) => {
              const catThemes = PALETTE_THEMES.filter((th) => th.category === cat);
              return (
                <section key={cat} className="fade-in-up">
                  <h2 className="text-xl md:text-2xl font-bold text-gradient mb-3 px-1">
                    {cat}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {catThemes.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => handleQuickTheme(th.name)}
                        className="px-3 py-1.5 text-sm rounded-full bg-white/50 hover:bg-white/80 border border-white/40 text-foreground transition-all hover:scale-105"
                      >
                        {th.name}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>



          {palettes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-up">
              {palettes.map((palette, index) => (
                <div key={index} className="scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <PalettePreview palette={palette} />
                </div>
              ))}
            </div>
          )}

          {!searched && palettes.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Escolha um tema acima ou digite uma cor para começar.</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default ColorGenerator;
