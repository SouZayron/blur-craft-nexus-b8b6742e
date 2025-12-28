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

// Get storage key for card data
function getCardStorageKey(userName: string, cardId: string): string {
  return `bingo-cartela-${userName}-${cardId}`;
}

// Get storage key for marked numbers
function getMarksStorageKey(userName: string, cardId: string): string {
  return `bingo-marks-${userName}-${cardId}`;
}

export function BingoCardView() {
  const { userName, cardId } = useParams<{ userName: string; cardId: string }>();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(new Set());
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userName || !cardId) {
      navigate("/cartelas");
      return;
    }

    // Load card data from localStorage
    const cardKey = getCardStorageKey(userName, cardId);
    const savedCard = localStorage.getItem(cardKey);
    
    if (!savedCard) {
      setNotFound(true);
      return;
    }

    try {
      const data = JSON.parse(savedCard) as CardData;
      setCardData(data);

      // Load saved marks
      const marksKey = getMarksStorageKey(userName, cardId);
      const savedMarks = localStorage.getItem(marksKey);
      if (savedMarks) {
        setMarkedNumbers(new Set(JSON.parse(savedMarks)));
      }
    } catch {
      setNotFound(true);
    }
  }, [userName, cardId, navigate]);

  // Save marks to localStorage whenever they change
  useEffect(() => {
    if (userName && cardId && markedNumbers.size > 0) {
      const marksKey = getMarksStorageKey(userName, cardId);
      localStorage.setItem(marksKey, JSON.stringify([...markedNumbers]));
    }
  }, [markedNumbers, userName, cardId]);

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
    if (userName && cardId) {
      const marksKey = getMarksStorageKey(userName, cardId);
      localStorage.removeItem(marksKey);
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

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-x-hidden">
        <FloatingBlob color="blue" size="lg" position={{ top: "-10%", left: "-5%" }} animation="float" />
        <FloatingBlob color="purple" size="md" position={{ top: "30%", right: "-10%" }} animation="float-delayed" />
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
          <Header />
          
          <div className="text-center mt-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">Cartela não encontrada</h1>
            <p className="text-muted-foreground mb-6">
              Esta cartela não existe ou foi gerada em outro dispositivo.
            </p>
            <Button onClick={() => navigate("/cartelas")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ir para o gerador
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        <GlassCard className="p-4 mb-6 bg-gradient-to-br from-labxat-purple/10 via-labxat-pink/10 to-labxat-blue/10">
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
                      ? "bg-gradient-to-br from-labxat-purple/80 to-labxat-pink/80 text-white border-white/30 scale-95"
                      : "bg-gradient-to-br from-labxat-blue/20 to-labxat-purple/20 text-foreground border-white/20 hover:from-labxat-blue/30 hover:to-labxat-purple/30 hover:scale-105"
                  )}
                >
                  <span className={cn(isMarked && "opacity-50")}>{num}</span>
                  {isMarked && (
                    <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white/50 animate-scale-in">
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
