import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { FloatingBlob } from "@/components/FloatingBlob";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CardData {
  numbers: number[];
  userName: string;
  title: string;
  subtitle: string;
  id: number;
}

// Decode card data from URL
function decodeCardData(encoded: string): CardData | null {
  try {
    const decoded = JSON.parse(atob(encoded));
    return {
      numbers: decoded.n,
      userName: decoded.u,
      title: decoded.t,
      subtitle: decoded.s,
      id: decoded.i,
    };
  } catch {
    return null;
  }
}

// Get storage key for this card
function getStorageKey(encoded: string): string {
  return `bingo-card-${encoded}`;
}

export function BingoCardView() {
  const { encoded } = useParams<{ encoded: string }>();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!encoded) {
      navigate("/cartelas");
      return;
    }

    const data = decodeCardData(encoded);
    if (!data) {
      toast.error("Cartela inválida");
      navigate("/cartelas");
      return;
    }

    setCardData(data);

    // Load saved marks from localStorage
    const storageKey = getStorageKey(encoded);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedMarks = JSON.parse(saved);
        setMarkedNumbers(new Set(savedMarks));
      } catch {
        // Ignore invalid saved data
      }
    }
  }, [encoded, navigate]);

  // Save marks to localStorage whenever they change
  useEffect(() => {
    if (encoded && markedNumbers.size > 0) {
      const storageKey = getStorageKey(encoded);
      localStorage.setItem(storageKey, JSON.stringify([...markedNumbers]));
    }
  }, [markedNumbers, encoded]);

  const toggleNumber = (num: number) => {
    setMarkedNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  };

  const resetCard = () => {
    setMarkedNumbers(new Set());
    if (encoded) {
      const storageKey = getStorageKey(encoded);
      localStorage.removeItem(storageKey);
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
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  if (!cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-x-hidden">
      {/* Background Effects */}
      <FloatingBlob color="blue" size="lg" position={{ top: "-10%", left: "-5%" }} animation="float" />
      <FloatingBlob color="purple" size="md" position={{ top: "30%", right: "-10%" }} animation="float-delayed" />
      <FloatingBlob color="pink" size="sm" position={{ bottom: "20%", left: "10%" }} animation="float-slow" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
        <Header />

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/cartelas")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Card Header */}
        <div className="text-center mb-6">
          <p className="text-sm text-labxat-purple font-medium mb-1">
            Cartela #{cardData.id} • {cardData.userName}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-labxat-blue via-labxat-purple to-labxat-pink bg-clip-text text-transparent">
            {cardData.title}
          </h1>
          <p className="text-muted-foreground mt-1">{cardData.subtitle}</p>
        </div>

        {/* Bingo Card Grid */}
        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-5 gap-2">
            {cardData.numbers.map((num, index) => {
              const isMarked = markedNumbers.has(num);
              return (
                <button
                  key={`${num}-${index}`}
                  onClick={() => toggleNumber(num)}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-300 relative overflow-hidden",
                    "backdrop-blur-sm border",
                    isMarked
                      ? "bg-gradient-to-br from-labxat-purple to-labxat-pink text-white border-white/30 scale-95"
                      : "bg-background/30 text-foreground border-border/50 hover:bg-background/50 hover:scale-105"
                  )}
                >
                  <span className={cn(isMarked && "opacity-30")}>{num}</span>
                  {isMarked && (
                    <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white animate-scale-in">
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
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button
            onClick={shareCard}
            className="flex-1 bg-gradient-to-r from-labxat-blue to-labxat-purple text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Progress */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Números marcados: <span className="font-bold text-labxat-purple">{markedNumbers.size}</span> / 25
          </p>
        </div>
      </div>
    </div>
  );
}
