import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingBlob } from "@/components/FloatingBlob";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTables } from "@/hooks/useRealtimeTables";
import { GAME_NAMES, GAME_ICONS } from "@/data/gameData";

const TOTAL_BALLS = 90;
const DRAW_INTERVAL = 4500;

interface GameRoom {
  id: string;
  game_type: "animals" | "invertidos" | "sequences";
  is_open: boolean;
  updated_at: string;
}
interface GamePlayer { id: string; name: string; xat_id: string | null; is_approved: boolean; }
interface GamePick { id: string; room_id: string; player_id: string; pick_value: string; }

const speak = (text: string, enabled: boolean) => {
  if (!enabled || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
};

const smartRandomDraw = (available: number[], lastDrawn: number[]): number => {
  if (available.length === 0) return -1;
  if (available.length === 1) return available[0];
  const recent = lastDrawn.slice(-5);
  for (let i = 0; i < 50; i++) {
    const c = available[Math.floor(Math.random() * available.length)];
    const seq = recent.some(n => Math.abs(c - n) === 1);
    const sameEnd = recent.filter(n => n % 10 === c % 10).length;
    if (!seq && sameEnd < 2) return c;
  }
  return available[Math.floor(Math.random() * available.length)];
};

const Bingo2 = () => {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [picks, setPicks] = useState<GamePick[]>([]);

  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const intervalRef = useRef<number | null>(null);
  const drawnNumRef = useRef<number[]>([]);
  const audioRef = useRef(true);
  // Track the order in which players completed their cards (first to complete = 1º)
  const [winnerOrder, setWinnerOrder] = useState<string[]>([]);

  useEffect(() => { drawnNumRef.current = drawnNumbers; }, [drawnNumbers]);
  useEffect(() => { audioRef.current = audioEnabled; }, [audioEnabled]);

  const fetchData = useCallback(async () => {
    const [r, p, pk] = await Promise.all([
      supabase.from("game_rooms").select("*"),
      supabase.from("game_players").select("*"),
      supabase.from("game_picks").select("*"),
    ]);
    setRooms((r.data || []) as GameRoom[]);
    setPlayers((p.data || []) as GamePlayer[]);
    setPicks((pk.data || []) as GamePick[]);
  }, []);

  useRealtimeTables({
    channelName: "bingo2-realtime",
    onSync: fetchData,
    tables: ["game_rooms", "game_picks", "game_players"],
  });

  // Active room: only number-based games (invertidos / sequences). Ignore animals entirely.
  // Closing inscriptions in /control must NOT change which room is active here.
  // Priority: room with most picks > open room > most recently updated.
  const activeRoom = useMemo<GameRoom | null>(() => {
    const numericRooms = rooms.filter(r => r.game_type === "invertidos" || r.game_type === "sequences");
    if (!numericRooms.length) return null;
    const pickCount = new Map<string, number>();
    picks.forEach(p => pickCount.set(p.room_id, (pickCount.get(p.room_id) || 0) + 1));
    return [...numericRooms].sort((a, b) => {
      const pa = pickCount.get(a.id) || 0;
      const pb = pickCount.get(b.id) || 0;
      if (pb !== pa) return pb - pa;
      if (a.is_open !== b.is_open) return a.is_open ? -1 : 1;
      return (b.updated_at || "").localeCompare(a.updated_at || "");
    })[0] || null;
  }, [rooms, picks]);

  const drawNumber = useCallback(() => {
    const available = Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1).filter(n => !drawnNumRef.current.includes(n));
    if (available.length === 0) {
      setIsPlaying(false);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    const n = smartRandomDraw(available, drawnNumRef.current);
    if (n === -1) return;
    setIsAnimating(true);
    setCurrentBall(n);
    speak(n.toString(), audioRef.current);
    setTimeout(() => {
      setDrawnNumbers(prev => [...prev, n]);
      setIsAnimating(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const initial = window.setTimeout(() => {
        drawNumber();
        intervalRef.current = window.setInterval(drawNumber, DRAW_INTERVAL);
      }, DRAW_INTERVAL);
      return () => {
        clearTimeout(initial);
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPlaying, drawNumber]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setDrawnNumbers([]); drawnNumRef.current = [];
    setCurrentBall(null);
    setIsAnimating(false);
    setWinnerOrder([]);
    window.speechSynthesis?.cancel();
  };

  const roomPicks = useMemo(() => activeRoom ? picks.filter(p => p.room_id === activeRoom.id) : [], [picks, activeRoom]);

  const parsePickNumbers = (val: string): number[] =>
    val.split("-").map(s => parseInt(s, 10)).filter(n => !isNaN(n));

  // Distinct vivid colors per winner (avoiding pink which is the "current ball" color)
  const WINNER_COLORS = [
    { bg: "bg-green-500", ring: "ring-green-400", text: "text-green-200", border: "border-green-400/50", from: "from-green-500/30" },
    { bg: "bg-cyan-500", ring: "ring-cyan-400", text: "text-cyan-200", border: "border-cyan-400/50", from: "from-cyan-500/30" },
    { bg: "bg-amber-500", ring: "ring-amber-400", text: "text-amber-200", border: "border-amber-400/50", from: "from-amber-500/30" },
    { bg: "bg-blue-500", ring: "ring-blue-400", text: "text-blue-200", border: "border-blue-400/50", from: "from-blue-500/30" },
    { bg: "bg-orange-500", ring: "ring-orange-400", text: "text-orange-200", border: "border-orange-400/50", from: "from-orange-500/30" },
    { bg: "bg-teal-500", ring: "ring-teal-400", text: "text-teal-200", border: "border-teal-400/50", from: "from-teal-500/30" },
    { bg: "bg-lime-500", ring: "ring-lime-400", text: "text-lime-200", border: "border-lime-400/50", from: "from-lime-500/30" },
    { bg: "bg-red-500", ring: "ring-red-400", text: "text-red-200", border: "border-red-400/50", from: "from-red-500/30" },
  ];

  const pickNumberSet = useMemo(() => {
    const s = new Set<number>();
    roomPicks.forEach(p => parsePickNumbers(p.pick_value).forEach(n => s.add(n)));
    return s;
  }, [roomPicks]);

  const winners = useMemo(() => {
    if (!activeRoom) return [];
    type Win = { playerId: string; name: string; xatId: string | null; values: string[]; numbers: number[] };
    const byPlayer = new Map<string, GamePick[]>();
    roomPicks.forEach(p => {
      const arr = byPlayer.get(p.player_id) || [];
      arr.push(p);
      byPlayer.set(p.player_id, arr);
    });
    const result: Win[] = [];
    byPlayer.forEach((pks, playerId) => {
      const player = players.find(pl => pl.id === playerId);
      if (!player) return;
      const allHit = pks.every(pk => parsePickNumbers(pk.pick_value).every(n => drawnNumbers.includes(n)));
      if (allHit) {
        const nums: number[] = [];
        pks.forEach(pk => parsePickNumbers(pk.pick_value).forEach(n => nums.push(n)));
        result.push({
          playerId,
          name: player.name,
          xatId: player.xat_id,
          values: pks.map(p => p.pick_value),
          numbers: nums,
        });
      }
    });
    // Sort by the order they completed (1º, 2º, 3º...). Anyone not yet ranked goes to the end stably.
    return result.sort((a, b) => {
      const ai = winnerOrder.indexOf(a.playerId);
      const bi = winnerOrder.indexOf(b.playerId);
      if (ai === -1 && bi === -1) return a.playerId.localeCompare(b.playerId);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [roomPicks, players, drawnNumbers, activeRoom, winnerOrder]);

  // Append newly-completed players to winnerOrder in the order they complete
  useEffect(() => {
    const completedIds = winners.map(w => w.playerId);
    const newcomers = completedIds.filter(id => !winnerOrder.includes(id));
    if (newcomers.length > 0) {
      setWinnerOrder(prev => [...prev, ...newcomers.filter(id => !prev.includes(id))]);
    }
  }, [winners, winnerOrder]);

  // Map number -> winner index (for per-winner color on the panel)
  const numberToWinnerIdx = useMemo(() => {
    const map = new Map<number, number>();
    winners.forEach((w, idx) => {
      w.numbers.forEach(n => {
        if (!map.has(n)) map.set(n, idx);
      });
    });
    return map;
  }, [winners]);

  const lastTen = drawnNumbers.slice(-10);
  const availableNumbers = TOTAL_BALLS - drawnNumbers.length;

  const gameLabel = activeRoom ? (GAME_NAMES[activeRoom.game_type] || activeRoom.game_type) : "Aguardando jogo de números";
  const gameIcon = activeRoom ? (GAME_ICONS[activeRoom.game_type] || "🎮") : "⏳";

  return (
    <div className="min-h-screen animated-gradient-bg relative overflow-hidden">
      <FloatingBlob color="purple" size="xl" position={{ top: "10%", left: "-10%" }} />
      <FloatingBlob color="blue" size="lg" position={{ bottom: "20%", right: "-5%" }} animation="float-delayed" />

      <header className="relative z-10 p-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </Link>
        <div className={cn(
          "px-3 py-1.5 rounded-full text-xs font-bold border",
          activeRoom?.is_open
            ? "bg-green-500/20 border-green-500/40 text-green-300"
            : "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
        )}>
          {gameIcon} {gameLabel} {activeRoom ? (activeRoom.is_open ? "• Inscrições abertas" : "• Inscrições fechadas (jogo continua)") : ""}
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 pb-12">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black text-gradient mb-2">
            Bingo Conectado
          </h1>
          <p className="text-sm text-muted-foreground">
            {roomPicks.length} seleções • {players.filter(p => p.is_approved).length} jogadores
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Left Panel */}
          <div className="glass-card p-4 md:p-6 flex-1">
            <h2 className="text-lg font-bold text-foreground mb-4 text-center">
              Painel de Verificação
            </h2>

            <div className="grid grid-cols-10 gap-1.5 md:gap-2 bg-background p-4 rounded-lg">
              {Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1).map((num) => {
                const isDrawn = drawnNumbers.includes(num);
                const isCurrent = num === currentBall;
                const inPick = pickNumberSet.has(num);
                const winnerIdx = numberToWinnerIdx.get(num);
                const winnerColor = winnerIdx !== undefined ? WINNER_COLORS[winnerIdx % WINNER_COLORS.length] : null;
                return (
                  <div
                    key={num}
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center text-xs md:text-sm font-semibold transition-all",
                      isCurrent
                        ? "bg-labxat-pink text-white scale-110 shadow-md shadow-labxat-pink/40"
                        : isDrawn && winnerColor
                          ? `${winnerColor.bg} text-white shadow-md`
                          : isDrawn && inPick
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/40"
                            : isDrawn
                              ? "bg-labxat-purple/70 text-white"
                              : inPick
                                ? "bg-background/60 text-foreground border-2 border-emerald-500/40"
                                : "bg-background/60 text-foreground/60 border border-white/10"
                    )}
                  >
                    {num}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-3">
              Cada ganhador recebe uma cor única no painel • verde = bola pertence a uma seleção
            </p>
          </div>

          {/* Right Panel */}
          <div className="glass-card p-4 md:p-6 w-full lg:w-96 flex flex-col items-center">
            <div className="flex flex-col items-center justify-center mb-6 w-full">
              <div className="text-[10px] uppercase tracking-widest text-foreground/60 mb-3">
                Número atual
              </div>
              <div
                className={cn(
                  "w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-labxat-pink/90 text-white flex flex-col items-center justify-center font-black shadow-lg shadow-labxat-pink/30 transition-all duration-500 px-2",
                  isAnimating && "scale-110"
                )}
              >
                <span className="text-7xl md:text-8xl">{currentBall ?? "—"}</span>
              </div>
            </div>

            {/* Winners block */}
            <div className="w-full mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-bold text-foreground">Ganhadores</h3>
              </div>
              {winners.length === 0 ? (
                <div className="text-center p-3 bg-background/30 rounded-lg border border-white/10">
                  <p className="text-xs text-muted-foreground">Nenhum ganhador ainda</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {winners.map((w, idx) => {
                    const c = WINNER_COLORS[idx % WINNER_COLORS.length];
                    const ordinal = `${idx + 1}º`;
                    return (
                      <div key={w.playerId} className={cn("bg-gradient-to-r to-yellow-500/10 border rounded-lg p-2.5", c.from, c.border, idx === 0 && "animate-pulse")}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={cn("inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md text-[11px] font-black text-white shrink-0", c.bg)}>
                            {ordinal}
                          </span>
                          <Trophy className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                          <p className="text-sm font-bold text-foreground truncate">
                            {w.name}{w.xatId ? ` (${w.xatId})` : ""}
                          </p>
                        </div>
                        <p className={cn("text-xs font-mono truncate", c.text)}>
                          {w.values.join(" | ")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* History */}
            <div className="w-full mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center">
                Últimas 10
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {[...Array(10)].map((_, i) => {
                  const ball = lastTen[lastTen.length - 1 - i];
                  const inPick = ball ? pickNumberSet.has(ball) : false;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold mx-auto",
                        ball
                          ? inPick
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-labxat-purple/70 text-white shadow-md"
                          : "bg-muted/30 text-muted-foreground/50 border border-white/10"
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
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  INICIAR
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-6"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  PAUSAR
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" className="flex-1 border-2 font-bold py-6">
                <RotateCcw className="w-5 h-5 mr-2" />
                RESET
              </Button>
            </div>

            <Button
              onClick={() => setAudioEnabled(!audioEnabled)}
              variant="ghost"
              className="mt-4 text-muted-foreground hover:text-foreground"
            >
              {audioEnabled ? (
                <><Volume2 className="w-5 h-5 mr-2" />Áudio Ligado</>
              ) : (
                <><VolumeX className="w-5 h-5 mr-2" />Áudio Desligado</>
              )}
            </Button>

            <p className="mt-3 text-xs text-muted-foreground text-center">
              {availableNumbers} bolas restantes
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Bingo2;
