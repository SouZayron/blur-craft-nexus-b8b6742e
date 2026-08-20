import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeTables } from "@/hooks/useRealtimeTables";
import { BOMBA_NUMBERS, BombaPick, BombaState, bombaAlive, bombaFinished, bombaWinners } from "@/components/BombaAdminPanel";
import { Bomb } from "lucide-react";

const pad = (n: number) => String(n).padStart(2, "0");

interface Props {
  playerId: string;
  playerName: string;
}

export const BombaPlayerPanel = ({ playerId, playerName }: Props) => {
  const [state, setState] = useState<BombaState | null>(null);
  const [picks, setPicks] = useState<BombaPick[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);
  const [boom, setBoom] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    const [stateRes, picksRes] = await Promise.all([
      supabase.from("bomba_state").select("*").eq("id", 1).maybeSingle(),
      supabase.from("bomba_picks").select("*"),
    ]);
    const next = stateRes.data as BombaState | null;
    setState((prev) => {
      if (next && prev && next.last_drawn != null && next.last_drawn !== prev.last_drawn) {
        setBoom(true);
        setFlash(next.last_drawn);
        window.setTimeout(() => setBoom(false), 900);
        window.setTimeout(() => setFlash(null), 2200);
      }
      return next;
    });
    setPicks((picksRes.data || []) as BombaPick[]);
  }, []);

  useRealtimeTables({
    channelName: `bomba-player-${playerId}`,
    fallbackMs: 1500,
    onSync: fetchData,
    tables: ["bomba_state", "bomba_picks"],
  });

  const drawn = state?.drawn || [];
  const myPick = picks.find((p) => p.player_id === playerId) || null;
  const alive = myPick ? bombaAlive(myPick.numbers, drawn) : [];
  const finished = bombaFinished(drawn);
  const winners = bombaWinners(picks, drawn);
  const iWon = !!myPick && winners.some((w) => w.player_id === playerId);

  const toggle = (n: number) => {
    if (myPick) return;
    setSelected((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : prev.length >= 5 ? prev : [...prev, n]));
  };

  const handleConfirm = async () => {
    if (selected.length !== 5) return;
    setSaving(true);
    const { error } = await supabase.from("bomba_picks").insert({
      player_id: playerId,
      player_name: playerName,
      numbers: [...selected].sort((a, b) => a - b),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao registrar sua bomba", variant: "destructive" });
      return;
    }
    toast({ title: "Bomba registrada!" });
    await fetchData();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* ESQUERDA: grade 1-15 */}
      <div className="lg:col-span-7 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Bomb className="w-4 h-4 text-orange-400" /> Números 1 a 15
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {BOMBA_NUMBERS.map((n) => {
            const out = drawn.includes(n);
            const mine = myPick ? myPick.numbers.includes(n) : selected.includes(n);
            const isFlash = flash === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggle(n)}
                disabled={!!myPick || !state?.is_open}
                className={`aspect-square rounded-xl border font-mono font-bold text-xl flex items-center justify-center transition-all duration-300 ${
                  isFlash ? "scale-110 shadow-lg shadow-red-500/50" : ""
                } ${
                  out
                    ? "bg-red-500/25 text-red-300 border-red-500/50 line-through"
                    : mine
                      ? "bg-green-500/20 text-green-300 border-green-400/60 ring-2 ring-green-400/60"
                      : "bg-white/10 backdrop-blur-md text-foreground border-purple-300/20 hover:bg-white/15"
                } ${!myPick && state?.is_open ? "cursor-pointer" : "cursor-default"}`}
              >
                {pad(n)}
              </button>
            );
          })}
        </div>

        {!myPick && (
          <div className="mt-4">
            {state?.is_open ? (
              <>
                <p className="text-xs text-muted-foreground mb-2">Escolha 5 números ({selected.length}/5)</p>
                <Button
                  onClick={handleConfirm}
                  disabled={selected.length !== 5 || saving}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
                >
                  💣 Confirmar minha bomba
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Inscrições fechadas. Aguarde a próxima rodada.</p>
            )}
          </div>
        )}
      </div>

      {/* DIREITA: minha bomba */}
      <div className="lg:col-span-5 space-y-4">
        <div className="backdrop-blur-xl bg-white/5 border border-orange-500/30 rounded-2xl p-4 shadow-xl text-center">
          <h2 className="text-base font-bold text-orange-400 mb-1">💣 Minha Bomba</h2>
          <p className="text-sm text-foreground font-semibold mb-3">{playerName}</p>
          {myPick ? (
            <>
              <div className="flex justify-center flex-wrap gap-2 mb-3">
                {myPick.numbers.map((n) => (
                  <span key={n} className={`w-12 h-12 rounded-xl font-mono font-bold text-lg flex items-center justify-center border ${
                    drawn.includes(n)
                      ? "bg-red-500/25 text-red-300 border-red-500/50 line-through"
                      : "bg-green-500/15 text-green-300 border-green-400/50"}`}>
                    {pad(n)}
                  </span>
                ))}
              </div>
              <p className="text-sm font-semibold text-green-400">💚 Números vivos: {alive.length}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Você ainda não registrou seus 5 números.</p>
          )}
        </div>

        {boom && (
          <div className="backdrop-blur-xl bg-red-500/20 border border-red-400/50 rounded-2xl p-4 text-center animate-pulse">
            <p className="text-lg font-bold text-red-300">💣 BOMBA LANÇADA</p>
          </div>
        )}

        {!boom && state?.last_drawn != null && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Último número sorteado</p>
            <p className="text-4xl font-bold font-mono bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              {pad(state.last_drawn)}
            </p>
          </div>
        )}

        {iWon && (
          <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-2xl p-4 text-center">
            <p className="text-lg font-bold text-yellow-300">🏆 VOCÊ SOBREVIVEU À BOMBA!</p>
            <p className="text-sm text-foreground mt-1">Número sobrevivente: <span className="font-mono font-bold">{pad(alive[0])}</span></p>
          </div>
        )}

        {!iWon && winners.length > 0 && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-sm font-bold text-foreground">🏆 Vencedor{winners.length > 1 ? "es" : ""}</p>
            <p className="text-xs text-muted-foreground mt-1">{winners.map((w) => w.player_name).join(" / ")}</p>
          </div>
        )}

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3">
          <p className="text-xs font-bold text-foreground mb-2">🕒 Sorteados ({drawn.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {drawn.length === 0 && <span className="text-xs text-muted-foreground">Nenhum ainda.</span>}
            {drawn.map((n, i) => (
              <span key={`${n}-${i}`} className="w-7 h-7 rounded-md bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs flex items-center justify-center">
                {pad(n)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Todos os jogadores */}
      <div className="lg:col-span-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
        <h3 className="text-sm font-bold text-foreground mb-3">👥 Jogadores na partida ({picks.length})</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {picks.length === 0 && <p className="text-xs text-muted-foreground">Ninguém registrou sua bomba ainda.</p>}
          {picks.map((p) => {
            const pAlive = bombaAlive(p.numbers, drawn);
            const isDead = pAlive.length === 0;
            const isWinner = finished && pAlive.length === 1;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 border backdrop-blur-md ${
                  isWinner ? "bg-yellow-500/10 border-yellow-400/50" : isDead ? "bg-white/5 border-red-500/30 opacity-60" : "bg-white/5 border-white/10"
                }`}
              >
                <span className="text-xs font-bold text-foreground truncate">
                  {isWinner ? "🏆 " : isDead ? "💀 " : ""}{p.player_name}
                  {p.player_id === playerId && <span className="text-[10px] text-purple-300"> (você)</span>}
                </span>
                <div className="flex gap-1 shrink-0">
                  {p.numbers.map((n) => (
                    <span
                      key={n}
                      className={`w-6 h-6 rounded-md font-mono text-[10px] flex items-center justify-center border ${
                        drawn.includes(n)
                          ? "bg-red-500/25 text-red-300 border-red-500/40 line-through"
                          : "bg-green-500/15 text-green-300 border-green-400/40"
                      }`}
                    >
                      {pad(n)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
