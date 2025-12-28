import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/GlassCard";
import { FloatingBlob } from "@/components/FloatingBlob";
import { Button } from "@/components/ui/button";
import { RotateCcw, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { cardThemes, ThemeKey } from "./BingoCards";

interface CardData {
  id: string;
  numbers: number[];
  userName: string;
  title: string;
  subtitle: string;
  cardNumber: number;
  markedNumbers: number[];
  theme: ThemeKey;
}

export function BingoCardView() {
  const { userName, cardId } = useParams<{ userName: string; cardId: string }>();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userName || !cardId) {
      navigate("/cartelas");
      return;
    }

    loadCard();
  }, [userName, cardId, navigate]);

  const loadCard = async () => {
    if (!userName || !cardId) return;

    try {
      const { data, error } = await supabase
        .from("bingo_cards")
        .select("*")
        .eq("user_name", userName)
        .eq("card_number", parseInt(cardId))
        .maybeSingle();

      if (error) {
        console.error("Error loading card:", error);
        setNotFound(true);
        return;
      }

      if (!data) {
        setNotFound(true);
        return;
      }

      setCardData({
        id: data.id,
        numbers: data.numbers,
        userName: data.user_name,
        title: data.title,
        subtitle: data.subtitle,
        cardNumber: data.card_number,
        markedNumbers: data.marked_numbers || [],
        theme: (data.theme as ThemeKey) || "purple",
      });

      setMarkedNumbers(new Set(data.marked_numbers || []));
    } catch (err) {
      console.error("Error loading card:", err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNumber = async (num: number) => {
    const newMarked = new Set(markedNumbers);
    if (newMarked.has(num)) {
      newMarked.delete(num);
    } else {
      newMarked.add(num);
    }
    setMarkedNumbers(newMarked);

    if (cardData) {
      const { error } = await supabase
        .from("bingo_cards")
        .update({ marked_numbers: [...newMarked] })
        .eq("id", cardData.id);

      if (error) {
        console.error("Error saving marks:", error);
      }
    }
  };

  const resetCard = async () => {
    setMarkedNumbers(new Set());
    
    if (cardData) {
      const { error } = await supabase
        .from("bingo_cards")
        .update({ marked_numbers: [] })
        .eq("id", cardData.id);

      if (error) {
        console.error("Error resetting card:", error);
      }
    }
    
    toast.success("Cartela resetada!");
  };

  const shareCard = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: cardData?.title || "Cartela de Bingo",
          text: `Confira minha cartela de bingo!`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-labxat-purple" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-x-hidden flex items-center justify-center">
        <FloatingBlob color="blue" size="lg" position={{ top: "-10%", left: "-5%" }} animation="float" />
        <FloatingBlob color="purple" size="md" position={{ top: "30%", right: "-10%" }} animation="float-delayed" />
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Cartela não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            Esta cartela não existe ou ainda não foi gerada.
          </p>
          <Button onClick={() => navigate("/cartelas")}>
            Ir para o gerador
          </Button>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return null;
  }

  const theme = cardThemes[cardData.theme] || cardThemes.purple;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-x-hidden flex flex-col items-center justify-center p-4">
      <FloatingBlob color="blue" size="lg" position={{ top: "-10%", left: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="md" position={{ top: "30%", right: "-10%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="sm" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Card Number */}
        <div className="text-center mb-4">
          <span className={cn(
            "inline-block px-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r text-white mb-3",
            theme.preview
          )}>
            Cartela #{cardData.cardNumber}
          </span>
          
          {/* Title with gradient */}
          <h1 className={cn(
            "text-3xl md:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
            theme.preview
          )}>
            {cardData.title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-muted-foreground mt-2 text-lg">{cardData.subtitle}</p>
        </div>

        {/* Bingo Card Grid */}
        <GlassCard className={cn("p-3 mb-4 bg-gradient-to-br", theme.cardBg)}>
          <div className="grid grid-cols-5 gap-1.5">
            {cardData.numbers.map((num, index) => {
              const isMarked = markedNumbers.has(num);
              return (
                <button
                  key={`${num}-${index}`}
                  onClick={() => toggleNumber(num)}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-base sm:text-lg font-bold transition-all duration-300 relative overflow-hidden",
                    "backdrop-blur-sm border",
                    isMarked
                      ? cn("bg-gradient-to-br text-white border-white/30 scale-95", theme.markedBg)
                      : cn("bg-gradient-to-br text-foreground border-white/20 hover:scale-105 active:scale-95", theme.numberBg, theme.numberHover)
                  )}
                >
                  <span className={cn(isMarked && "opacity-50")}>{num}</span>
                  {isMarked && (
                    <span className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-black text-white/50 animate-scale-in">
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={resetCard}
            className="flex-1 py-5"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button
            onClick={shareCard}
            className={cn("flex-1 py-5 bg-gradient-to-r text-white", theme.preview)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Progress */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Marcados: <span className={cn("font-bold bg-gradient-to-r bg-clip-text text-transparent", theme.preview)}>{markedNumbers.size}</span> / 25
          </p>
        </div>
      </div>
    </div>
  );
}
