import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingBlob } from "@/components/FloatingBlob";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { useLanguage } from "@/contexts/LanguageContext";

const TOTAL_BALLS = 90;
const DRAW_INTERVAL = 4500;

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

// Animated ball inside globe - smooth floating animation
const GlobeBall = ({ index, color }: { index: number; color: string }) => {
  const size = 8 + (index % 3) * 2; // Varied sizes: 8, 10, 12px
  const duration = 3 + (index % 4); // Varied durations: 3-6s
  const delay = index * 0.3;
  
  return (
    <div
      className={cn("absolute rounded-full opacity-80", color)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${20 + (index * 7) % 60}%`,
        top: `${20 + (index * 11) % 60}%`,
        animation: `float-ball-${index % 4} ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

export const Bingo = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const drawnNumbersRef = useRef<number[]>([]);
  const audioEnabledRef = useRef(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePrintPanel = async () => {
    if (!panelRef.current) return;
    
    setIsUploading(true);
    try {
      // Capture the panel as canvas
      const canvas = await html2canvas(panelRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
      });
      
      // Convert to base64
      const base64Image = canvas.toDataURL('image/png');
      
      // Upload to ImgBB via edge function
      const { data, error } = await supabase.functions.invoke('upload-imgbb', {
        body: { image: base64Image }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.success && data?.url) {
        setImageUrl(data.url);
        toast({
          title: t("printGenerated"),
          description: t("printGeneratedDesc"),
        });
      } else {
        throw new Error(data?.error || 'Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Error capturing panel:', error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("printError"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Keep refs in sync with state
  useEffect(() => {
    drawnNumbersRef.current = drawnNumbers;
  }, [drawnNumbers]);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  const getAvailableNumbers = useCallback(() => {
    return Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1).filter(
      (n) => !drawnNumbersRef.current.includes(n)
    );
  }, []);

  const lastTenBalls = drawnNumbers.slice(-10);

  const drawBall = useCallback(() => {
    const available = getAvailableNumbers();
    
    if (available.length === 0) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const newNumber = smartRandomDraw(available, drawnNumbersRef.current);
    if (newNumber === -1) return;

    setIsAnimating(true);
    setCurrentBall(newNumber);
    
    // Speak the number
    speakNumber(newNumber, audioEnabledRef.current);

    // Add to drawn numbers after animation
    setTimeout(() => {
      setDrawnNumbers((prev) => [...prev, newNumber]);
      setIsAnimating(false);
    }, 800);
  }, [getAvailableNumbers]);

  // Handle play/pause - only this effect manages the interval
  useEffect(() => {
    if (isPlaying) {
      // Wait 4 seconds before drawing first ball
      const initialTimeout = window.setTimeout(() => {
        drawBall();
        
        // Set interval for subsequent balls
        intervalRef.current = window.setInterval(() => {
          drawBall();
        }, DRAW_INTERVAL);
      }, DRAW_INTERVAL);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Clear interval when paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying]); // Only depend on isPlaying!

  const availableNumbers = Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1).filter(
    (n) => !drawnNumbers.includes(n)
  );

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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDrawnNumbers([]);
    drawnNumbersRef.current = [];
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
          <span>{t("back")}</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gradient mb-2">
            {t("bingoTitle")}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Left Panel - Ball Grid */}
          <div className="glass-card p-4 md:p-6 flex-1">
            <h2 className="text-lg font-bold text-foreground mb-4 text-center">
              {t("verificationPanel")}
            </h2>
            <div 
              ref={panelRef}
              className="grid grid-cols-9 md:grid-cols-10 gap-2 md:gap-2.5 bg-background p-4 rounded-lg"
            >
              {Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1).map((num) => {
                const isDrawn = drawnNumbers.includes(num);
                const isJustDrawn = currentBall === num && isAnimating;
                
                return (
                  <div
                    key={num}
                    className={cn(
                      "w-9 h-9 md:w-11 md:h-11 rounded-lg flex items-center justify-center text-sm md:text-base font-bold transition-all duration-300",
                      isDrawn
                        ? "bg-red-500 text-white shadow-lg scale-105"
                        : "bg-muted/50 text-muted-foreground",
                      isJustDrawn && "animate-pulse ring-4 ring-red-300"
                    )}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
            
            {/* Print Button */}
            <div className="mt-4 flex flex-col gap-3">
              <Button
                onClick={handlePrintPanel}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    {t("takeScreenshot")}
                  </>
                )}
              </Button>
              
              {imageUrl && (
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground text-center">{t("imageLink")}</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={imageUrl} 
                      readOnly 
                      className="flex-1 text-xs bg-background px-2 py-1.5 rounded border border-border truncate"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(imageUrl);
                        toast({ title: t("linkCopied") });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(imageUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Globe and Controls */}
          <div className="glass-card p-4 md:p-6 w-full lg:w-96 flex flex-col items-center">
            {/* Bingo Globe */}
            <div className="relative mb-6">
              <style>{`
                @keyframes float-ball-0 {
                  0%, 100% { transform: translate(0, 0); }
                  25% { transform: translate(10px, -8px); }
                  50% { transform: translate(-5px, 5px); }
                  75% { transform: translate(8px, 10px); }
                }
                @keyframes float-ball-1 {
                  0%, 100% { transform: translate(0, 0); }
                  25% { transform: translate(-12px, 6px); }
                  50% { transform: translate(8px, -10px); }
                  75% { transform: translate(-6px, 8px); }
                }
                @keyframes float-ball-2 {
                  0%, 100% { transform: translate(0, 0); }
                  25% { transform: translate(6px, 12px); }
                  50% { transform: translate(-10px, -5px); }
                  75% { transform: translate(5px, -8px); }
                }
                @keyframes float-ball-3 {
                  0%, 100% { transform: translate(0, 0); }
                  25% { transform: translate(-8px, -10px); }
                  50% { transform: translate(12px, 8px); }
                  75% { transform: translate(-5px, 6px); }
                }
              `}</style>
              
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-4 border-white/20 shadow-2xl relative overflow-hidden flex items-center justify-center">
                {/* Animated balls inside globe */}
                {globeColors.map((color, i) => (
                  <GlobeBall key={i} index={i} color={color} />
                ))}
                {globeColors.slice(0, 5).map((color, i) => (
                  <GlobeBall key={`extra-${i}`} index={i + 9} color={color} />
                ))}
                
                {/* Glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full pointer-events-none" />
                
                {/* Center highlight */}
                <div className="absolute top-4 left-4 w-6 h-6 bg-white/20 rounded-full blur-sm" />

                {/* Current Ball - centered in globe */}
                {currentBall && (
                  <div
                    className={cn(
                      "relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-2xl transition-all duration-500",
                      `bg-gradient-to-br ${getBallColor(currentBall)}`,
                      isAnimating ? "scale-110" : "scale-100"
                    )}
                    style={{
                      boxShadow: "0 0 30px rgba(255,255,255,0.5), 0 10px 40px rgba(0,0,0,0.3)"
                    }}
                  >
                    {currentBall}
                  </div>
                )}
              </div>
            </div>

            {/* History - Last 10 balls */}
            <div className="w-full mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
                {t("last10Balls")}
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
                  {t("play")}
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-6"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  {t("pause")}
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

        {/* Progress Block */}
        <div className="glass-card p-4 md:p-6 max-w-7xl mx-auto mt-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary/50 animate-ping" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                {t("drawn")} {drawnNumbers.length} {t("of")} {TOTAL_BALLS} {t("balls")}
              </p>
              {isPlaying && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-md h-3 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${(drawnNumbers.length / TOTAL_BALLS) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {t("remaining")} {availableNumbers.length} {t("balls")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Bingo;
