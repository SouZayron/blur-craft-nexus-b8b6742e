import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingBlob } from "@/components/FloatingBlob";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ANIMALS, ANIMAL_EMOJIS } from "@/data/gameData";

const DRAW_INTERVAL = 5000;
const TOTAL_ANIMALS = ANIMALS.length;

const ANIMAL_COLORS = [
  "from-red-500 to-red-600",
  "from-orange-500 to-orange-600",
  "from-yellow-500 to-yellow-600",
  "from-green-500 to-green-600",
  "from-teal-500 to-teal-600",
  "from-blue-500 to-blue-600",
  "from-indigo-500 to-indigo-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
];

const ANIMAL_SOLID_COLORS = [
  "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500",
  "bg-teal-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500",
];

const getAnimalColor = (animal: string): string => {
  const idx = ANIMALS.indexOf(animal);
  return ANIMAL_COLORS[idx % ANIMAL_COLORS.length];
};

const speakAnimal = (name: string, enabled: boolean) => {
  if (!enabled || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(name);
  utterance.lang = "pt-BR";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

const GlobeBall = ({ index, color }: { index: number; color: string }) => {
  const size = 8 + (index % 3) * 2;
  const duration = 3 + (index % 4);
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

export const BingoAnimais = () => {
  const { toast } = useToast();
  const [drawnAnimals, setDrawnAnimals] = useState<string[]>([]);
  const [currentAnimal, setCurrentAnimal] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const drawnRef = useRef<string[]>([]);
  const audioRef = useRef(true);

  useEffect(() => { drawnRef.current = drawnAnimals; }, [drawnAnimals]);
  useEffect(() => { audioRef.current = audioEnabled; }, [audioEnabled]);

  const drawAnimal = useCallback(() => {
    const available = ANIMALS.filter(a => !drawnRef.current.includes(a));
    if (available.length === 0) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    const newAnimal = available[Math.floor(Math.random() * available.length)];
    setIsAnimating(true);
    setCurrentAnimal(newAnimal);
    speakAnimal(newAnimal, audioRef.current);
    setTimeout(() => {
      setDrawnAnimals(prev => [...prev, newAnimal]);
      setIsAnimating(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const initialTimeout = window.setTimeout(() => {
        drawAnimal();
        intervalRef.current = window.setInterval(() => {
          drawAnimal();
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
  }, [isPlaying]);

  const availableAnimals = ANIMALS.filter(a => !drawnAnimals.includes(a));
  const lastFive = drawnAnimals.slice(-5);

  const handlePlay = () => { if (availableAnimals.length > 0) setIsPlaying(true); };
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDrawnAnimals([]);
    drawnRef.current = [];
    setCurrentAnimal(null);
    setIsAnimating(false);
    window.speechSynthesis?.cancel();
  };

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast({ title: "Copiado!", description: text });
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  return (
    <div className="h-screen animated-gradient-bg relative overflow-hidden flex flex-col">
      <FloatingBlob color="purple" size="xl" position={{ top: "10%", left: "-10%" }} />
      <FloatingBlob color="blue" size="lg" position={{ bottom: "20%", right: "-5%" }} animation="float-delayed" />

      <header className="relative z-10 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
        <h1 className="text-xl md:text-2xl font-black text-gradient">🐾 Bingo dos Animais</h1>
        <div className="text-xs text-muted-foreground hidden sm:block">5s/sorteio</div>
      </header>

      <main className="relative z-10 flex-1 min-h-0 px-3 pb-3 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3 h-full max-w-[1600px] mx-auto">
          {/* Left Panel - Animals Grid */}
          <div className="glass-card p-3 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h2 className="text-sm font-bold text-foreground">
                Painel ({drawnAnimals.length}/{TOTAL_ANIMALS})
              </h2>
              <span className="text-xs text-muted-foreground">Restam {availableAnimals.length}</span>
            </div>
            <div className="grid grid-cols-7 sm:grid-cols-8 md:grid-cols-10 gap-1 bg-background/50 p-2 rounded-lg flex-1 min-h-0 overflow-hidden auto-rows-min content-start">
              {ANIMALS.map((animal) => {
                const isDrawn = drawnAnimals.includes(animal);
                const isJustDrawn = currentAnimal === animal && isAnimating;
                return (
                  <div
                    key={animal}
                    className={cn(
                      "px-1 py-1 rounded flex items-center justify-center text-[10px] md:text-xs font-bold text-center transition-all duration-300 min-h-[28px] leading-tight",
                      isDrawn ? "bg-red-500 text-white shadow" : "bg-muted/40 text-muted-foreground",
                      isJustDrawn && "animate-pulse ring-2 ring-red-300"
                    )}
                  >
                    {animal}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 h-2 bg-muted/50 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${(drawnAnimals.length / TOTAL_ANIMALS) * 100}%` }}
              />
            </div>
          </div>

          {/* Right Panel - Globe and Controls */}
          <div className="glass-card p-3 w-full lg:w-80 flex flex-col items-center min-h-0 overflow-y-auto">
            <div className="relative mb-2 flex-shrink-0">
              <style>{`
                @keyframes float-ball-0 { 0%,100%{transform:translate(0,0);} 25%{transform:translate(10px,-8px);} 50%{transform:translate(-5px,5px);} 75%{transform:translate(8px,10px);} }
                @keyframes float-ball-1 { 0%,100%{transform:translate(0,0);} 25%{transform:translate(-12px,6px);} 50%{transform:translate(8px,-10px);} 75%{transform:translate(-6px,8px);} }
                @keyframes float-ball-2 { 0%,100%{transform:translate(0,0);} 25%{transform:translate(6px,12px);} 50%{transform:translate(-10px,-5px);} 75%{transform:translate(5px,-8px);} }
                @keyframes float-ball-3 { 0%,100%{transform:translate(0,0);} 25%{transform:translate(-8px,-10px);} 50%{transform:translate(12px,8px);} 75%{transform:translate(-5px,6px);} }
              `}</style>

              <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-4 border-white/20 shadow-2xl relative overflow-hidden flex items-center justify-center">
                {ANIMAL_SOLID_COLORS.map((color, i) => (
                  <GlobeBall key={i} index={i} color={color} />
                ))}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full pointer-events-none" />
                <div className="absolute top-3 left-3 w-4 h-4 bg-white/20 rounded-full blur-sm" />

                {currentAnimal && (
                  <div
                    className={cn(
                      "relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-500 px-2",
                      `bg-gradient-to-br ${getAnimalColor(currentAnimal)}`,
                      isAnimating ? "scale-110" : "scale-100"
                    )}
                    style={{ boxShadow: "0 0 30px rgba(255,255,255,0.5), 0 10px 40px rgba(0,0,0,0.3)" }}
                  >
                    <div className="text-2xl md:text-3xl">{ANIMAL_EMOJIS[currentAnimal] || "🐾"}</div>
                    <div className="text-[11px] md:text-xs font-black text-center leading-tight mt-0.5">
                      {currentAnimal}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {currentAnimal && (
              <Button
                onClick={() => copyText(currentAnimal)}
                className="w-full mb-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold h-9 text-sm flex-shrink-0"
              >
                <Copy className="w-3.5 h-3.5 mr-2" />
                Copiar: {currentAnimal}
              </Button>
            )}

            {/* History - Last 5 */}
            <div className="w-full mb-2 flex-shrink-0">
              <h3 className="text-[11px] font-semibold text-muted-foreground mb-1 text-center">Últimos 5</h3>
              <div className="grid grid-cols-5 gap-1">
                {[...Array(5)].map((_, i) => {
                  const animal = lastFive[lastFive.length - 1 - i];
                  return (
                    <div
                      key={i}
                      className={cn(
                        "px-1 py-1 rounded flex items-center justify-center text-[9px] font-bold text-center min-h-[28px]",
                        animal ? `bg-gradient-to-br ${getAnimalColor(animal)} text-white shadow` : "bg-muted/30 text-muted-foreground/50"
                      )}
                    >
                      {animal ? <span className="truncate">{ANIMAL_EMOJIS[animal]}</span> : "-"}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 w-full flex-shrink-0">
              {!isPlaying ? (
                <Button
                  onClick={handlePlay}
                  disabled={availableAnimals.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold h-10"
                >
                  <Play className="w-4 h-4 mr-1" />Iniciar
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold h-10"
                >
                  <Pause className="w-4 h-4 mr-1" />Pausar
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" className="flex-1 border-2 font-bold h-10">
                <RotateCcw className="w-4 h-4 mr-1" />Reiniciar
              </Button>
            </div>

            <Button
              onClick={() => setAudioEnabled(!audioEnabled)}
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              {audioEnabled ? (
                <><Volume2 className="w-3.5 h-3.5 mr-1" />Áudio Ligado</>
              ) : (
                <><VolumeX className="w-3.5 h-3.5 mr-1" />Áudio Desligado</>
              )}
            </Button>

            {availableAnimals.length === 0 && (
              <div className="mt-2 text-center p-2 bg-green-500/20 rounded-lg border border-green-500/30 flex-shrink-0">
                <p className="text-green-400 font-bold text-sm">🎉 Bingo Completo!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BingoAnimais;
