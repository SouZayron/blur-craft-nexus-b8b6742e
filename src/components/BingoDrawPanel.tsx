import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Trophy, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GAME_NAMES,
  GAME_ICONS,
  ANIMALS,
  ANIMAL_EMOJIS,
  RHYTHMS,
  RHYTHM_EMOJIS,
  RHYTHM_GRADIENTS,
  BRANDS,
  BRAND_EMOJIS,
  BRAND_GRADIENTS,
} from "@/data/gameData";

const TOTAL_NUMBERS = 90;
const DRAW_INTERVAL = 4500;

export interface DrawRoom {
  id: string;
  game_type: string;
  is_open: boolean;
  updated_at?: string;
}
export interface DrawPlayer { id: string; name: string; xat_id: string | null; is_approved: boolean; }
export interface DrawPick { id: string; room_id: string; player_id: string; pick_value: string; }

const speak = (text: string, enabled: boolean) => {
  if (!enabled || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
};

const smartRandomDrawNumber = (available: number[], lastDrawn: number[]): number => {
  if (available.length === 0) return -1;
  if (available.length === 1) return available[0];
  const recent = lastDrawn.slice(-5);
  for (let i = 0; i < 50; i++) {
    const c = available[Math.floor(Math.random() * available.length)];
    const seq = recent.some((n) => Math.abs(c - n) === 1);
    const sameEnd = recent.filter((n) => n % 10 === c % 10).length;
    if (!seq && sameEnd < 2) return c;
  }
  return available[Math.floor(Math.random() * available.length)];
};

const WINNER_COLORS = [
  { bg: "bg-green-500", text: "text-green-200", border: "border-green-400/50", from: "from-green-500/30" },
  { bg: "bg-cyan-500", text: "text-cyan-200", border: "border-cyan-400/50", from: "from-cyan-500/30" },
  { bg: "bg-amber-500", text: "text-amber-200", border: "border-amber-400/50", from: "from-amber-500/30" },
  { bg: "bg-blue-500", text: "text-blue-200", border: "border-blue-400/50", from: "from-blue-500/30" },
  { bg: "bg-orange-500", text: "text-orange-200", border: "border-orange-400/50", from: "from-orange-500/30" },
  { bg: "bg-teal-500", text: "text-teal-200", border: "border-teal-400/50", from: "from-teal-500/30" },
  { bg: "bg-lime-500", text: "text-lime-200", border: "border-lime-400/50", from: "from-lime-500/30" },
  { bg: "bg-red-500", text: "text-red-200", border: "border-red-400/50", from: "from-red-500/30" },
];

interface Props {
  activeRoom: DrawRoom | null;
  players: DrawPlayer[];
  picks: DrawPick[];
}

export const BingoDrawPanel = ({ activeRoom, players, picks }: Props) => {
  const [drawnItems, setDrawnItems] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [winnerOrder, setWinnerOrder] = useState<string[]>([]);

  const intervalRef = useRef<number | null>(null);
  const drawnRef = useRef<string[]>([]);
  const audioRef = useRef(true);
  const { toast } = useToast();

  useEffect(() => { drawnRef.current = drawnItems; }, [drawnItems]);
  useEffect(() => { audioRef.current = audioEnabled; }, [audioEnabled]);

  const copyText = useCallback(async (text: string) => {
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
      toast({ title: "Não foi possível copiar", variant: "destructive" });
    }
  }, [toast]);

  const isAnimalsGame = activeRoom?.game_type === "animals";
  const isRhythmsGame = activeRoom?.game_type === "rhythms";
  const isBrandsGame = activeRoom?.game_type === "brands";
  const isItemBased = isAnimalsGame || isRhythmsGame || isBrandsGame;
  const isGradientGame = isRhythmsGame || isBrandsGame;

  const allItems = useMemo<string[]>(() => {
    if (isAnimalsGame) return ANIMALS;
    if (isRhythmsGame) return RHYTHMS;
    if (isBrandsGame) return BRANDS;
    return Array.from({ length: TOTAL_NUMBERS }, (_, i) => String(i + 1));
  }, [isAnimalsGame, isRhythmsGame, isBrandsGame]);

  // Reset ao trocar de sala/jogo
  const lastRoomRef = useRef<string | null>(null);
  useEffect(() => {
    const key = activeRoom ? `${activeRoom.id}:${activeRoom.game_type}` : null;
    if (lastRoomRef.current !== null && lastRoomRef.current !== key) {
      setIsPlaying(false);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      setDrawnItems([]); drawnRef.current = [];
      setCurrentItem(null);
      setIsAnimating(false);
      setWinnerOrder([]);
      window.speechSynthesis?.cancel();
    }
    lastRoomRef.current = key;
  }, [activeRoom]);

  const drawItem = useCallback(() => {
    const available = allItems.filter((it) => !drawnRef.current.includes(it));
    if (available.length === 0) {
      setIsPlaying(false);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    let chosen: string;
    if (isItemBased) {
      chosen = available[Math.floor(Math.random() * available.length)];
    } else {
      const n = smartRandomDrawNumber(
        available.map((s) => parseInt(s, 10)),
        drawnRef.current.map((s) => parseInt(s, 10))
      );
      if (n === -1) return;
      chosen = String(n);
    }
    setIsAnimating(true);
    setCurrentItem(chosen);
    speak(chosen, audioRef.current);
    setTimeout(() => {
      setDrawnItems((prev) => [...prev, chosen]);
      setIsAnimating(false);
    }, 800);
  }, [allItems, isItemBased]);

  useEffect(() => {
    if (isPlaying) {
      const initial = window.setTimeout(() => {
        drawItem();
        intervalRef.current = window.setInterval(drawItem, DRAW_INTERVAL);
      }, DRAW_INTERVAL);
      return () => {
        clearTimeout(initial);
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPlaying, drawItem]);

  const handleReset = () => {
    setIsPlaying(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setDrawnItems([]); drawnRef.current = [];
    setCurrentItem(null);
    setIsAnimating(false);
    setWinnerOrder([]);
    window.speechSynthesis?.cancel();
  };

  const roomPicks = useMemo(
    () => (activeRoom ? picks.filter((p) => p.room_id === activeRoom.id) : []),
    [picks, activeRoom]
  );

  const parsePickItems = useCallback((val: string): string[] => {
    if (isItemBased) return [val];
    return val.split("-").map((s) => String(parseInt(s, 10))).filter((s) => s !== "NaN");
  }, [isItemBased]);

  const pickItemSet = useMemo(() => {
    const s = new Set<string>();
    roomPicks.forEach((p) => parsePickItems(p.pick_value).forEach((it) => s.add(it)));
    return s;
  }, [roomPicks, parsePickItems]);

  const winners = useMemo(() => {
    if (!activeRoom) return [] as { playerId: string; name: string; xatId: string | null; values: string[]; items: string[] }[];
    const byPlayer = new Map<string, DrawPick[]>();
    roomPicks.forEach((p) => {
      const arr = byPlayer.get(p.player_id) || [];
      arr.push(p);
      byPlayer.set(p.player_id, arr);
    });
    const result: { playerId: string; name: string; xatId: string | null; values: string[]; items: string[] }[] = [];
    byPlayer.forEach((pks, playerId) => {
      const player = players.find((pl) => pl.id === playerId);
      if (!player) return;
      const allHit = pks.every((pk) => parsePickItems(pk.pick_value).every((it) => drawnItems.includes(it)));
      if (allHit) {
        const items: string[] = [];
        pks.forEach((pk) => parsePickItems(pk.pick_value).forEach((it) => items.push(it)));
        result.push({ playerId, name: player.name, xatId: player.xat_id, values: pks.map((p) => p.pick_value), items });
      }
    });
    return result.sort((a, b) => {
      const ai = winnerOrder.indexOf(a.playerId);
      const bi = winnerOrder.indexOf(b.playerId);
      if (ai === -1 && bi === -1) return a.playerId.localeCompare(b.playerId);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [roomPicks, players, drawnItems, activeRoom, winnerOrder, parsePickItems]);

  useEffect(() => {
    const completedIds = winners.map((w) => w.playerId);
    const newcomers = completedIds.filter((id) => !winnerOrder.includes(id));
    if (newcomers.length > 0) {
      setWinnerOrder((prev) => [...prev, ...newcomers.filter((id) => !prev.includes(id))]);
    }
  }, [winners, winnerOrder]);

  const itemToWinnerIdx = useMemo(() => {
    const map = new Map<string, number>();
    winners.forEach((w, idx) => w.items.forEach((it) => { if (!map.has(it)) map.set(it, idx); }));
    return map;
  }, [winners]);

  const lastTen = drawnItems.slice(-10);
  const remaining = allItems.length - drawnItems.length;
  const gameLabel = activeRoom ? (GAME_NAMES[activeRoom.game_type] || activeRoom.game_type) : "Aguardando jogo";
  const gameIcon = activeRoom ? (GAME_ICONS[activeRoom.game_type] || "🎮") : "⏳";

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">🎡 Roleta de Sorteio</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {gameIcon} {gameLabel} • {roomPicks.length} seleções • {remaining} restantes
        </p>
      </div>

      {/* Current item */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-40 h-40 rounded-2xl text-white flex flex-col items-center justify-center font-black shadow-lg transition-all duration-500 px-2 text-center",
            isGradientGame && currentItem
              ? cn("bg-gradient-to-br shadow-black/20", (isRhythmsGame ? RHYTHM_GRADIENTS : BRAND_GRADIENTS)[currentItem] || "from-slate-700 to-slate-300")
              : "bg-labxat-pink/90 shadow-labxat-pink/30",
            isAnimating && !isGradientGame && "scale-110"
          )}
        >
          {isItemBased && currentItem ? (
            <>
              <span className="text-6xl leading-none">
                {isAnimalsGame ? (ANIMAL_EMOJIS[currentItem] || "🐾") : isRhythmsGame ? (RHYTHM_EMOJIS[currentItem] || "🎵") : (BRAND_EMOJIS[currentItem] || "™️")}
              </span>
              <span className="text-base mt-2 leading-tight">{currentItem}</span>
            </>
          ) : (
            <span className="text-7xl">{currentItem ?? "—"}</span>
          )}
        </div>
      </div>

      {isItemBased && currentItem && (
        <Button onClick={() => copyText(currentItem)} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white font-bold h-9 text-sm">
          <Copy className="w-3.5 h-3.5 mr-2" /> Copiar: {currentItem}
        </Button>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isPlaying ? (
          <Button onClick={() => setIsPlaying(true)} disabled={!activeRoom} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white font-bold py-5">
            <Play className="w-5 h-5 mr-2" /> INICIAR
          </Button>
        ) : (
          <Button onClick={() => setIsPlaying(false)} className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:opacity-90 text-white font-bold py-5">
            <Pause className="w-5 h-5 mr-2" /> PAUSAR
          </Button>
        )}
        <Button onClick={handleReset} variant="outline" className="flex-1 border-2 font-bold py-5">
          <RotateCcw className="w-5 h-5 mr-2" /> RESET
        </Button>
      </div>

      <Button onClick={() => setAudioEnabled(!audioEnabled)} variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
        {audioEnabled ? (<><Volume2 className="w-4 h-4 mr-2" />Áudio Ligado</>) : (<><VolumeX className="w-4 h-4 mr-2" />Áudio Desligado</>)}
      </Button>

      {/* Winners */}
      <div>
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
              return (
                <div key={w.playerId} className={cn("bg-gradient-to-r to-yellow-500/10 border rounded-lg p-2.5", c.from, c.border, idx === 0 && "animate-pulse")}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn("inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md text-[11px] font-black text-white shrink-0", c.bg)}>
                      {idx + 1}º
                    </span>
                    <Trophy className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                    <p className="text-sm font-bold text-foreground truncate">
                      {w.name}{w.xatId ? ` (${w.xatId})` : ""}
                    </p>
                  </div>
                  <p className={cn("text-xs font-mono truncate", c.text)}>{w.values.join(" | ")}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Last ten */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Últimos 10</h3>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(10)].map((_, i) => {
            const item = lastTen[lastTen.length - 1 - i];
            const inPick = item ? pickItemSet.has(item) : false;
            return (
              <div
                key={i}
                className={cn(
                  "h-10 px-1 rounded-lg flex items-center justify-center font-bold text-center",
                  item ? (inPick ? "bg-green-500 text-white shadow-md" : "bg-labxat-purple/70 text-white shadow-md") : "bg-muted/30 text-muted-foreground/50 border border-white/10"
                )}
                title={item || ""}
              >
                <span className={cn("leading-tight truncate max-w-full", isItemBased ? "text-[10px]" : "text-sm")}>{item || "-"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification board */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Painel de Verificação</h3>
        {isItemBased ? (
          <div className="grid grid-cols-6 gap-1.5 bg-background p-3 rounded-lg">
            {(isAnimalsGame ? ANIMALS : isRhythmsGame ? RHYTHMS : BRANDS).map((item) => {
              const isDrawn = drawnItems.includes(item);
              const isCurrent = item === currentItem;
              const inPick = pickItemSet.has(item);
              const winnerIdx = itemToWinnerIdx.get(item);
              const winnerColor = winnerIdx !== undefined ? WINNER_COLORS[winnerIdx % WINNER_COLORS.length] : null;
              const emoji = isAnimalsGame ? (ANIMAL_EMOJIS[item] || "🐾") : isRhythmsGame ? (RHYTHM_EMOJIS[item] || "🎵") : (BRAND_EMOJIS[item] || "™️");

              if (isGradientGame) {
                const gradMap = isRhythmsGame ? RHYTHM_GRADIENTS : BRAND_GRADIENTS;
                const grad = gradMap[item] || "from-slate-700 to-slate-300";
                return (
                  <div key={item} className={cn("aspect-square rounded-md flex flex-col items-center justify-center px-0.5 py-1 text-center bg-gradient-to-br text-white transition-opacity", grad, !isDrawn && "opacity-40 grayscale")}>
                    <span className="text-base leading-none drop-shadow">{emoji}</span>
                    <span className="text-[8px] font-bold leading-tight mt-0.5 truncate max-w-full drop-shadow">{item}</span>
                  </div>
                );
              }

              return (
                <div
                  key={item}
                  className={cn(
                    "aspect-square rounded-md flex flex-col items-center justify-center px-0.5 py-1 transition-all text-center",
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
                  <span className="text-base leading-none">{emoji}</span>
                  <span className="text-[8px] font-semibold leading-tight mt-0.5 truncate max-w-full">{item}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-10 gap-1 bg-background p-3 rounded-lg">
            {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map((num) => {
              const numStr = String(num);
              const isDrawn = drawnItems.includes(numStr);
              const isCurrent = numStr === currentItem;
              const inPick = pickItemSet.has(numStr);
              const winnerIdx = itemToWinnerIdx.get(numStr);
              const winnerColor = winnerIdx !== undefined ? WINNER_COLORS[winnerIdx % WINNER_COLORS.length] : null;
              return (
                <div
                  key={num}
                  className={cn(
                    "aspect-square rounded-md flex items-center justify-center text-[11px] font-semibold transition-all",
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
        )}
      </div>
    </div>
  );
};

export default BingoDrawPanel;
