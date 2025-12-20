import { useState } from "react";
import { Header } from "@/components/Header";
import { FloatingBlob } from "@/components/FloatingBlob";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ParsedPalette {
  name: string;
  glowColor: string;
  angle: number;
  colors: string[];
  animation: string;
  animationSpeed: number;
}

const parsePaletteCode = (line: string): ParsedPalette | null => {
  try {
    const match = line.match(/^(\d+)\.\s*(.+?):\s*\((.+)\)$/);
    if (!match) return null;

    const [, , name, code] = match;
    const parts = code.split("#").filter(Boolean);

    let glowColor = "#FFFFFF";
    let angle = 45;
    const colors: string[] = [];
    let animation = "normal";
    let animationSpeed = 4;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.startsWith("glow")) {
        glowColor = "#" + parts[i + 1];
        i++;
      } else if (part.startsWith("grad")) {
        const angleMatch = parts[i + 1]?.match(/r(\d+)/);
        if (angleMatch) {
          angle = parseInt(angleMatch[1]);
          i++;
        }
      } else if (part.match(/^[A-Fa-f0-9]{6}$/)) {
        colors.push("#" + part);
      } else if (part.match(/^o[1-3]$/)) {
        animation = "fast";
        animationSpeed = part === "o1" ? 3 : part === "o2" ? 2 : 1;
      } else if (part.match(/^f[1-4]$/)) {
        animation = "slow";
        animationSpeed = part === "f1" ? 6 : part === "f3" ? 8 : 10;
      }
    }

    if (colors.length < 2) return null;

    return { name, glowColor, angle, colors, animation, animationSpeed };
  } catch {
    return null;
  }
};

const PalettePreview = ({ palette }: { palette: ParsedPalette }) => {
  const [copied, setCopied] = useState(false);
  
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
    const code = `(glow${palette.glowColor}#grad#r${palette.angle}#${palette.colors.map(c => c.slice(1)).join("#")}#${palette.animation === "fast" ? "o" : "f"}${palette.animationSpeed})`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-4 group hover:scale-[1.02] transition-all duration-300">
      <div className="relative overflow-hidden rounded-xl p-6 bg-background/50 mb-3">
        <h3 
          className="text-2xl md:text-3xl font-bold text-center"
          style={gradientStyle}
        >
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
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyCode}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copiar código
          </>
        )}
      </Button>
    </div>
  );
};

const ColorGenerator = () => {
  const [theme, setTheme] = useState("");
  const [palettes, setPalettes] = useState<ParsedPalette[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePalettes = async () => {
    if (!theme.trim()) {
      toast({
        title: "Digite um tema",
        description: "Por favor, insira um tema para gerar as paletas.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPalettes([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-palettes", {
        body: { theme: theme.trim() },
      });

      if (error) throw error;

      const lines = data.palettes.split("\n").filter((line: string) => line.trim());
      const parsed = lines
        .map((line: string) => parsePaletteCode(line))
        .filter((p: ParsedPalette | null): p is ParsedPalette => p !== null);

      if (parsed.length === 0) {
        toast({
          title: "Erro ao processar",
          description: "Não foi possível processar as paletas. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setPalettes(parsed);
    } catch (error: any) {
      console.error("Error generating palettes:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar paletas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient-bg">
      <Header />
      
      {/* Background blobs */}
      <FloatingBlob color="blue" size="xl" position={{ top: "10%", left: "-10%" }} animation="float" />
      <FloatingBlob color="purple" size="lg" position={{ bottom: "20%", right: "-5%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="md" position={{ top: "50%", right: "10%" }} animation="float-slow" />

      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12 fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gradient mb-4">
              Gerador de Cores
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Digite um tema e deixe a IA criar paletas de cores incríveis para você
            </p>
          </div>

          {/* Input Section */}
          <GlassCard className="max-w-xl mx-auto mb-12 fade-in-up-delayed">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Digite um tema (ex: praia, fogo, floresta...)"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generatePalettes()}
                className="flex-1 bg-white/50 border-white/30 text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <Button
                onClick={generatePalettes}
                disabled={isLoading}
                className="gradient-btn text-white font-semibold px-6 glow-hover"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar
                  </>
                )}
              </Button>
            </div>
          </GlassCard>

          {/* Palettes Grid */}
          {palettes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-up">
              {palettes.map((palette, index) => (
                <div
                  key={index}
                  className="scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PalettePreview palette={palette} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && palettes.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Digite um tema acima para gerar paletas de cores personalizadas</p>
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