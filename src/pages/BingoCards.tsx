import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { FloatingBlob } from "@/components/FloatingBlob";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LayoutGrid, Shuffle, Link2, Copy, Check, ArrowLeft, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface GeneratedCard {
  id: string;
  cardNumber: number;
  numbers: number[];
  userName: string;
  title: string;
  subtitle: string;
  theme: string;
}

// Theme configurations
export const cardThemes = {
  purple: {
    name: "Roxo",
    cardBg: "from-labxat-purple/10 via-labxat-pink/10 to-labxat-blue/10",
    numberBg: "from-labxat-blue/20 to-labxat-purple/20",
    numberHover: "hover:from-labxat-blue/30 hover:to-labxat-purple/30",
    markedBg: "from-labxat-purple/80 to-labxat-pink/80",
    preview: "from-purple-500 to-pink-500",
  },
  blue: {
    name: "Azul",
    cardBg: "from-blue-500/10 via-cyan-500/10 to-blue-600/10",
    numberBg: "from-blue-400/20 to-cyan-400/20",
    numberHover: "hover:from-blue-400/30 hover:to-cyan-400/30",
    markedBg: "from-blue-500/80 to-cyan-500/80",
    preview: "from-blue-500 to-cyan-500",
  },
  pink: {
    name: "Rosa",
    cardBg: "from-pink-500/10 via-rose-400/10 to-pink-600/10",
    numberBg: "from-pink-400/20 to-rose-400/20",
    numberHover: "hover:from-pink-400/30 hover:to-rose-400/30",
    markedBg: "from-pink-500/80 to-rose-500/80",
    preview: "from-pink-500 to-rose-500",
  },
  rainbow: {
    name: "RGB",
    cardBg: "from-red-500/10 via-green-500/10 to-blue-500/10",
    numberBg: "from-red-400/20 via-yellow-400/20 to-blue-400/20",
    numberHover: "hover:from-red-400/30 hover:via-yellow-400/30 hover:to-blue-400/30",
    markedBg: "from-red-500/80 via-yellow-500/80 to-blue-500/80",
    preview: "from-red-500 via-yellow-500 to-blue-500",
  },
  christmas: {
    name: "🎄 Natal",
    cardBg: "from-red-600/10 via-green-600/10 to-red-600/10",
    numberBg: "from-red-500/20 to-green-500/20",
    numberHover: "hover:from-red-500/30 hover:to-green-500/30",
    markedBg: "from-red-600/80 to-green-600/80",
    preview: "from-red-600 to-green-600",
  },
  newyear: {
    name: "🎆 Ano Novo",
    cardBg: "from-yellow-500/10 via-amber-400/10 to-yellow-600/10",
    numberBg: "from-yellow-400/20 to-amber-400/20",
    numberHover: "hover:from-yellow-400/30 hover:to-amber-400/30",
    markedBg: "from-yellow-500/80 to-amber-500/80",
    preview: "from-yellow-500 to-amber-500",
  },
  halloween: {
    name: "🎃 Halloween",
    cardBg: "from-orange-500/10 via-purple-900/10 to-orange-600/10",
    numberBg: "from-orange-500/20 to-purple-900/20",
    numberHover: "hover:from-orange-500/30 hover:to-purple-900/30",
    markedBg: "from-orange-500/80 to-purple-900/80",
    preview: "from-orange-500 to-purple-900",
  },
  mothers: {
    name: "💐 Dia das Mães",
    cardBg: "from-pink-400/10 via-rose-300/10 to-pink-500/10",
    numberBg: "from-pink-300/20 to-rose-300/20",
    numberHover: "hover:from-pink-300/30 hover:to-rose-300/30",
    markedBg: "from-pink-400/80 to-rose-400/80",
    preview: "from-pink-400 to-rose-400",
  },
  valentines: {
    name: "❤️ Namorados",
    cardBg: "from-red-500/10 via-pink-500/10 to-red-600/10",
    numberBg: "from-red-400/20 to-pink-400/20",
    numberHover: "hover:from-red-400/30 hover:to-pink-400/30",
    markedBg: "from-red-500/80 to-pink-500/80",
    preview: "from-red-500 to-pink-500",
  },
  green: {
    name: "Verde",
    cardBg: "from-green-500/10 via-emerald-400/10 to-green-600/10",
    numberBg: "from-green-400/20 to-emerald-400/20",
    numberHover: "hover:from-green-400/30 hover:to-emerald-400/30",
    markedBg: "from-green-500/80 to-emerald-500/80",
    preview: "from-green-500 to-emerald-500",
  },
};

export type ThemeKey = keyof typeof cardThemes;

// Generate unique random numbers between 1 and 90
function generateCardNumbers(): number[] {
  const numbers: number[] = [];
  while (numbers.length < 25) {
    const num = Math.floor(Math.random() * 90) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

// Normalize username for URL (remove special chars, lowercase)
function normalizeUserName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Get card URL
function getCardPath(userName: string, cardNumber: number): string {
  return `/bingo/cartela/${normalizeUserName(userName)}/${cardNumber}`;
}

export function BingoCards() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [title, setTitle] = useState("Bingo xat");
  const [subtitle, setSubtitle] = useState("Boa sorte!");
  const [quantity, setQuantity] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("purple");
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!userName.trim()) {
      toast.error("Digite o nome do usuário");
      return;
    }

    setIsGenerating(true);
    const normalizedName = normalizeUserName(userName.trim());
    const cardTitle = title.trim() || "Bingo xat";
    const cardSubtitle = subtitle.trim() || "Boa sorte!";

    try {
      const cardsToInsert = [];
      for (let i = 0; i < quantity; i++) {
        cardsToInsert.push({
          user_name: normalizedName,
          card_number: i + 1,
          title: cardTitle,
          subtitle: cardSubtitle,
          numbers: generateCardNumbers(),
          marked_numbers: [],
          theme: selectedTheme,
        });
      }

      // Delete existing cards for this user
      await supabase
        .from("bingo_cards")
        .delete()
        .eq("user_name", normalizedName);

      // Insert new cards
      const { data, error } = await supabase
        .from("bingo_cards")
        .insert(cardsToInsert)
        .select();

      if (error) {
        console.error("Error saving cards:", error);
        toast.error("Erro ao salvar cartelas");
        return;
      }

      const cards: GeneratedCard[] = (data || []).map((card) => ({
        id: card.id,
        cardNumber: card.card_number,
        numbers: card.numbers,
        userName: card.user_name,
        title: card.title,
        subtitle: card.subtitle,
        theme: card.theme,
      }));

      setGeneratedCards(cards);
      toast.success(`${quantity} cartela${quantity > 1 ? "s" : ""} gerada${quantity > 1 ? "s" : ""} com tema ${cardThemes[selectedTheme].name}!`);
    } catch (err) {
      console.error("Error generating cards:", err);
      toast.error("Erro ao gerar cartelas");
    } finally {
      setIsGenerating(false);
    }
  };

  const getCardUrl = (card: GeneratedCard) => {
    return `${window.location.origin}${getCardPath(card.userName, card.cardNumber)}`;
  };

  const copyLink = async (card: GeneratedCard) => {
    const url = getCardUrl(card);
    await navigator.clipboard.writeText(url);
    setCopiedId(card.id);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCard = (card: GeneratedCard) => {
    navigate(getCardPath(card.userName, card.cardNumber));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-x-hidden">
      <FloatingBlob color="blue" size="lg" position={{ top: "-10%", left: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="md" position={{ top: "30%", right: "-10%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="sm" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Header />

        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-labxat-blue via-labxat-purple to-labxat-pink bg-clip-text text-transparent mb-2">
            Gerador de Cartelas
          </h1>
          <p className="text-muted-foreground">
            Crie cartelas personalizadas para o Bingo xat
          </p>
        </div>

        <GlassCard className="p-6 mb-8">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="userName" className="text-foreground">Nome do usuário</Label>
              <Input
                id="userName"
                placeholder="Digite seu nome..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-foreground">Título da cartela</Label>
                <Input
                  id="title"
                  placeholder="Bingo xat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subtitle" className="text-foreground">Subtítulo</Label>
                <Input
                  id="subtitle"
                  placeholder="Boa sorte!"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>

            {/* Theme Selector */}
            <div className="grid gap-3">
              <Label className="text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Tema das cartelas
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {(Object.entries(cardThemes) as [ThemeKey, typeof cardThemes[ThemeKey]][]).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTheme(key)}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2",
                      selectedTheme === key
                        ? "border-white/50 scale-105 shadow-lg"
                        : "border-transparent hover:border-white/20 hover:scale-102"
                    )}
                  >
                    <div className={cn(
                      "w-full h-8 rounded-md bg-gradient-to-r",
                      theme.preview
                    )} />
                    <span className="text-xs font-medium text-foreground whitespace-nowrap">
                      {theme.name}
                    </span>
                    {selectedTheme === key && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-background" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Quantidade de cartelas</Label>
                <span className="text-lg font-bold text-labxat-purple">{quantity}</span>
              </div>
              <Slider
                value={[quantity]}
                onValueChange={(value) => setQuantity(value[0])}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-labxat-blue to-labxat-purple hover:brightness-110 text-white font-semibold py-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Shuffle className="w-5 h-5 mr-2" />
                  Gerar Cartelas
                </>
              )}
            </Button>
          </div>
        </GlassCard>

        {generatedCards.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-labxat-purple" />
              Cartelas Geradas ({generatedCards.length})
            </h2>

            <div className="grid gap-4">
              {generatedCards.map((card) => {
                const theme = cardThemes[card.theme as ThemeKey] || cardThemes.purple;
                return (
                  <GlassCard key={card.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold",
                          theme.preview
                        )}>
                          #{card.cardNumber}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{card.title}</p>
                          <p className="text-sm text-muted-foreground">{card.userName} • {theme.name}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(card)}
                          className="flex-1 sm:flex-none"
                        >
                          {copiedId === card.id ? (
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          Copiar Link
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openCard(card)}
                          className={cn(
                            "flex-1 sm:flex-none bg-gradient-to-r text-white",
                            theme.preview
                          )}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Abrir
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {card.numbers.slice(0, 10).map((num) => (
                        <span
                          key={num}
                          className={cn(
                            "w-8 h-8 rounded bg-gradient-to-br flex items-center justify-center text-xs font-medium text-foreground",
                            theme.numberBg
                          )}
                        >
                          {num}
                        </span>
                      ))}
                      <span className={cn(
                        "w-8 h-8 rounded bg-gradient-to-br flex items-center justify-center text-xs font-medium text-foreground",
                        theme.numberBg
                      )}>
                        ...
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
