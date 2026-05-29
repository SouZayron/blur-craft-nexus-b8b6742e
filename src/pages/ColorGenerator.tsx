import { useState } from "react";
import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PALETTE_THEMES, PALETTE_CATEGORIES, type StaticPalette } from "@/data/staticPalettes";

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
      <div className="relative overflow-hidden rounded-xl p-5 bg-background/50 mb-3">
        <h3 className="text-xl md:text-2xl font-bold text-center" style={gradientStyle}>
          {palette.name}
        </h3>
      </div>

      <div className="flex gap-1 justify-center mb-3">
        {palette.colors.map((color, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-lg shadow-md"
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
  const [selectedThemeId, setSelectedThemeId] = useState<string>(PALETTE_THEMES[0].id);
  const { t } = useLanguage();

  const selectedTheme = PALETTE_THEMES.find((t) => t.id === selectedThemeId) ?? PALETTE_THEMES[0];
  const palettes: ParsedPalette[] = selectedTheme.palettes
    .map((p: StaticPalette) => parsePaletteCode(p.name, p.code))
    .filter((p): p is ParsedPalette => p !== null);

  return (
    <div className="min-h-screen animated-gradient-bg">
      <Header />

      <FloatingBlob color="blue" size="xl" position={{ top: "10%", left: "-10%" }} animation="float" />
      <FloatingBlob color="purple" size="lg" position={{ bottom: "20%", right: "-5%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="md" position={{ top: "50%", right: "10%" }} animation="float-slow" />

      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-gradient mb-3">
              {t("colorTitle")}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Escolha um tema à esquerda e copie os códigos prontos à direita.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 fade-in-up-delayed">
            {/* Sidebar — themes by category */}
            <aside className="glass-card p-4 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:sticky lg:top-24 self-start">
              <div className="space-y-5">
                {PALETTE_CATEGORIES.map((cat) => {
                  const catThemes = PALETTE_THEMES.filter((th) => th.category === cat);
                  return (
                    <div key={cat}>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                        {cat}
                      </h2>
                      <div className="flex flex-col gap-1">
                        {catThemes.map((th) => {
                          const active = th.id === selectedThemeId;
                          return (
                            <button
                              key={th.id}
                              onClick={() => setSelectedThemeId(th.id)}
                              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                active
                                  ? "gradient-btn text-white shadow-md"
                                  : "bg-white/40 hover:bg-white/70 text-foreground"
                              }`}
                            >
                              {th.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right column — palette previews */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">{selectedTheme.name}</h2>
                <span className="text-sm text-muted-foreground ml-1">
                  · {palettes.length} códigos
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {palettes.map((palette, index) => (
                  <div
                    key={index}
                    className="scale-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <PalettePreview palette={palette} />
                  </div>
                ))}
              </div>
            </section>
          </div>
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
