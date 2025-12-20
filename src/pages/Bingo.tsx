import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingBlob } from "@/components/FloatingBlob";
import { cn } from "@/lib/utils";

const TOTAL_BALLS = 90;
const DRAW_INTERVAL = 3500; // 3.5 seconds

// Generate vibrant colors for balls based on number ranges
const getBallColor = (num: number): string => {
  if (num <= 10) return "from-red-500 to-red-600";
  if (num <= 20) return "from-orange-500 to-orange-600";
  if (num <= 30) return "from-yellow-500 to-yellow-600";
  if (num <= 40) return "from-green-500 to-green-600";
  if (num <= 50) return "from-teal-500 to-teal-600";
  if (num <= 60) return "from-blue-500 to-blue-600";
  if (num <= 70) return "from-indigo-500 to-indigo-600";
  if (num <= 80) return "from-purple-500 to-purple-600";
  return "from-pink-500 to-pink-600";
};

const getBallSolidColor = (num: number): string => {
  if (num <= 10) return "bg-red-500";
  if (num <= 20) return "bg-orange-500";
  if (num <= 30) return "bg-yellow-500";
  if (num <= 40) return "bg-green-500";
  if (num <= 50) return "bg-teal-500";
  if (num <= 60) return "bg-blue-500";
  if (num <= 70) return "bg-indigo-500";
  if (num <= 80) return "bg-purple-500";
  return "bg-pink-500";
};

// Speak the number using Web Speech API
const speakNumber = (num: number, enabled: boolean) => {
  if (!enabled || !window.speechSynthesis) return;
  
  const utterance = new SpeechSynthesisUtterance(num.toString());
  utterance.lang = "pt-BR";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

// Smart random selection avoiding patterns
const smartRandomDraw = (available: number[], lastDrawn: number[]): number => {
  if (available.length === 0) return -1;
  if (available.length === 1) return available[0];

  const recentNumbers = lastDrawn.slice(-5);
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const randomIndex = Math.floor(Math.random() * available.length);
    const candidate = available[randomIndex];

    // Check for immediate sequence (e.g., 1, 2, 3)
    const hasSequence = recentNumbers.some(
      (n) => Math.abs(candidate - n) === 1
    );

    // Check for same ending pattern (e.g., 11, 21, 31)
    const candidateEnding = candidate % 10;
    const sameEndingCount = recentNumbers.filter(
      (n) => n % 10 === candidateEnding
    ).length;

    // Accept if no pattern issues or we've tried too many times
    if (!hasSequence && sameEndingCount < 2) {
      return candidate;
    }

    attempts++;
  }

  // Fallback to pure random if no good candidate found
  return available[Math.floor(Math.random() * available.length)];
};

// Animated ball inside globe
const GlobeBall = ({ delay, color }: { delay: number; color: string }) => (
  <div
    className={cn(
      "absolute w-4 h-4 rounded-full animate-bounce",
      color
    )}
    style={{
      animationDelay: `${delay}ms`,
      animationDuration: `${1000 + Math.random() * 1000}ms`,
      left: `${15 + Math.random() * 70}%`,
      top: `${15 + Math.random() * 70}%`,
    }}
  />
);

export const Bingo = () => {
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const availableNumbers = Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1).filter(
    (n) => !drawnNumbers.includes(n)
  );

  const lastTenBalls = drawnNumbers.slice(-10);

  const drawBall = useCallback(() => {
    if (availableNumbers.length === 0) {
      setIsPlaying(false);
      return;
    }

    const newNumber = smartRandomDraw(availableNumbers, drawnNumbers);
    if (newNumber === -1) return;

    setIsAnimating(true);
    setCurrentBall(newNumber);
    
    // Speak the number
    speakNumber(newNumber, audioEnabled);

    setTimeout(() => {
      setDrawnNumbers((prev) => [...prev, newNumber]);
      setIsAnimating(false);
    }, 800);
  }, [availableNumbers, drawnNumbers, audioEnabled]);

  useEffect(() => {
    if (isPlaying && availableNumbers.length > 0) {
      // Draw immediately when starting
      if (drawnNumbers.length === 0 || !isAnimating) {
        drawBall();
      }
      
      intervalRef.current = setInterval(() => {
        drawBall();
      }, DRAW_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, drawBall, availableNumbers.length, drawnNumbers.length, isAnimating]);

  const handlePlay = () => {
    if (availableNumbers.length > 0) {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setDrawnNumbers([]);
    setCurrentBall(null);
    setIsAnimating(false);
    window.speechSynthesis?.cancel();
  };

  const globeColors = [
    "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500",
    "bg-teal-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500"
  ];

  return (
    <div className="min-h-screen animated-gradient-bg relative overflow-hidden">
      <FloatingBlob color="purple" size="xl" position={{ top: "10%", left: "-10%" }} />
      <FloatingBlob color="blue" size="lg" position={{ bottom: "20%", right: "-5%" }} animation="float-delayed" />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gradient mb-2">
            Bingo 1-90
          </h1>
          <p className="text-muted-foreground">
            {drawnNumbers.length} de {TOTAL_BALLS} bolas sorteadas
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Left Panel - Ball Grid */}
          <div className="glass-card p-4 md:p-6 flex-1">
            <h2 className="text-lg font-bold text-foreground mb-4 text-center">
              Painel de Conferência
            </h2>
            <div className="grid grid-cols-9 md:grid-cols-10 gap-1.5 md:gap-2">
              {Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1).map((num) => {
                const isDrawn = drawnNumbers.includes(num);
                const isJustDrawn = currentBall === num && isAnimating;
                
                return (
                  <div
                    key={num}
                    className={cn(
                      "w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300",
                      isDrawn
                        ? `bg-gradient-to-br ${getBallColor(num)} text-white shadow-lg scale-110`
                        : "bg-muted/50 text-muted-foreground",
                      isJustDrawn && "animate-pulse ring-4 ring-white/50"
                    )}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Globe and Controls */}
          <div className="glass-card p-4 md:p-6 w-full lg:w-96 flex flex-col items-center">
            {/* Bingo Globe */}
            <div className="relative mb-6">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-4 border-white/20 shadow-2xl relative overflow-hidden">
                {/* Animated balls inside globe */}
                {globeColors.map((color, i) => (
                  <GlobeBall key={i} delay={i * 200} color={color} />
                ))}
                {globeColors.map((color, i) => (
                  <GlobeBall key={`extra-${i}`} delay={i * 150 + 100} color={color} />
                ))}
                
                {/* Glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                
                {/* Center highlight */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-white/30 rounded-full blur-sm" />
              </div>

              {/* Current Ball - exits from globe */}
              {currentBall && (
                <div
                  className={cn(
                    "absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-2xl transition-all duration-500",
                    `bg-gradient-to-br ${getBallColor(currentBall)}`,
                    isAnimating ? "scale-125 animate-bounce" : "scale-100"
                  )}
                  style={{
                    boxShadow: "0 0 30px rgba(255,255,255,0.5), 0 10px 40px rgba(0,0,0,0.3)"
                  }}
                >
                  {currentBall}
                </div>
              )}
            </div>

            {/* Spacer for ball */}
            <div className="h-12" />

            {/* History - Last 10 balls */}
            <div className="w-full mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
                Últimas 10 Bolas
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {[...Array(10)].map((_, i) => {
                  const ball = lastTenBalls[lastTenBalls.length - 1 - i];
                  return (
                    <div
                      key={i}
                      className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all mx-auto",
                        ball
                          ? `bg-gradient-to-br ${getBallColor(ball)} text-white shadow-md`
                          : "bg-muted/30 text-muted-foreground/50"
                      )}
                    >
                      {ball || "-"}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 w-full">
              {!isPlaying ? (
                <Button
                  onClick={handlePlay}
                  disabled={availableNumbers.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  PLAY
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-6"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  PAUSE
                </Button>
              )}
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-2 font-bold py-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                REINICIAR
              </Button>
            </div>

            {/* Audio Toggle */}
            <Button
              onClick={() => setAudioEnabled(!audioEnabled)}
              variant="ghost"
              className="mt-4 text-muted-foreground hover:text-foreground"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-5 h-5 mr-2" />
                  Áudio Ligado
                </>
              ) : (
                <>
                  <VolumeX className="w-5 h-5 mr-2" />
                  Áudio Desligado
                </>
              )}
            </Button>

            {/* Game Status */}
            {availableNumbers.length === 0 && (
              <div className="mt-4 text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <p className="text-green-400 font-bold">🎉 Bingo Completo!</p>
                <p className="text-sm text-muted-foreground">Todas as bolas foram sorteadas</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Bingo;
