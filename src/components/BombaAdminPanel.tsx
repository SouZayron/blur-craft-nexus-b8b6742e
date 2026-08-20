import { useCallback, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeTables } from "@/hooks/useRealtimeTables";
import { Bomb, Copy, Check, Play, RotateCcw, Users, Trash2, Lock, Unlock } from "lucide-react";

export const BOMBA_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1);

export interface BombaState {
  id: number;
  is_open: boolean;
  status: string;
  drawn: number[];
  last_drawn: number | null;
}

export interface BombaPick {
  id: string;
  player_id: string;
  player_name: string;
  numbers: number[];
}

export const bombaAlive = (numbers: number[], drawn: number[]) =>
  numbers.filter((n) => !drawn.includes(n));

// A partida só termina quando restar 1 número não sorteado (14 sorteados).
export const bombaFinished = (drawn: number[]) => drawn.length >= BOMBA_NUMBERS.length - 1;

export const bombaWinners = <T extends { numbers: number[] }>(picks: T[], drawn: number[]): T[] =>
  bombaFinished(drawn) ? picks.filter((p) => bombaAlive(p.numbers, drawn).length === 1) : [];

const pad = (n: number) => String(n).padStart(2, "0");

export const BombaAdminPanel = () => {
  const [state, setState] = useState<BombaState | null>(null);
  const [picks, setPicks] = useState<BombaPick[]>([]);
  const [copied, setCopied] = useState(false);
  const [rolling, setRolling] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    const [stateRes, picksRes] = await Promise.all([
      supabase.from("bomba_state").select("*").eq("id", 1).maybeSingle(),
      supabase.from("bomba_picks").select("*").order("created_at", { ascending: true }),
    ]);
    if (stateRes.data) setState(stateRes.data as BombaState);
    setPicks((picksRes.data || []) as BombaPick[]);
  }, []);

  useRealtimeTables({
    channelName: "bomba-admin",
    onSync: fetchData,
    tables: ["bomba_state", "bomba_picks"],
  });

  const drawn = state?.drawn || [];
  const remaining = BOMBA_NUMBERS.filter((n) => !drawn.includes(n));
  const lastDrawn = state?.last_drawn ?? null;

  const hitPlayers = useMemo(
    () => (lastDrawn == null ? [] : picks.filter((p) => p.numbers.includes(lastDrawn))),
    [picks, lastDrawn],
  );

  const rounds = useMemo(
    () =>
      drawn.map((n, i) => ({
        round: i + 1,
        number: n,
        hits: picks.filter((p) => p.numbers.includes(n)).map((p) => p.player_name),
      })),
    [drawn, picks],
  );

  const winners = useMemo(() => bombaWinners(picks, drawn), [picks, drawn]);
  const finished = bombaFinished(drawn);

  const patch = async (values: Partial<BombaState>) => {
    await supabase.from("bomba_state").update({ ...values, updated_at: new Date().toISOString() }).eq("id", 1);
    await fetchData();
  };

  const handleToggleOpen = () => patch({ is_open: !state?.is_open });

  const handleStart = async () => {
    if (picks.length === 0) {
      toast({ title: "Nenhum jogador registrado", variant: "destructive" });
      return;
    }
    await patch({ status: "running", is_open: false, drawn: [], last_drawn: null });
    toast({ title: "Partida iniciada!" });
  };

  const handleDraw = async () => {
    if (state?.status !== "running") {
      toast({ title: "Inicie a partida primeiro", variant: "destructive" });
      return;
    }
    if (remaining.length === 0) {
      toast({ title: "Todos os números já foram sorteados", variant: "destructive" });
      return;
    }
    setRolling(true);
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    const nextDrawn = [...drawn, pick];
    const allDrawn = BOMBA_NUMBERS.length - nextDrawn.length === 0;
    setTimeout(async () => {
      await patch({
        drawn: nextDrawn,
        last_drawn: pick,
        status: allDrawn ? "finished" : "running",
      });
      setRolling(false);
    }, 900);
  };

  const handleReset = async () => {
    await patch({ drawn: [], last_drawn: null, status: "lobby", is_open: true });
    toast({ title: "Partida reiniciada!" });
  };

  const handleClearPlayers = async () => {
    await supabase.from("bomba_picks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await patch({ drawn: [], last_drawn: null, status: "lobby", is_open: true });
    toast({ title: "Jogadores e rodada limpos!" });
  };

  const handleRemovePick = async (id: string) => {
    await supabase.from("bomba_picks").delete().eq("id", id);
    await fetchData();
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
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyNames = async () => {
    const text = hitPlayers.map((p) => p.player_name).join(" / ");
    const ok = await copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: ok ? "Nomes copiados!" : "Erro ao copiar", variant: ok ? "default" : "destructive" });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-12 h-full min-h-0">
      {/* LEFT: sorteador */}
      <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
        <div className="backdrop-blur-xl bg-white/5 border border-orange-500/30 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
              <Bomb className="w-4 h-4" /> Bomba Atômica
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              state?.status === "running" ? "bg-green-500/20 text-green-400"
              : state?.status === "finished" ? "bg-purple-500/20 text-purple-300"
              : "bg-yellow-500/20 text-yellow-400"}`}>
              {state?.status === "running" ? "Em jogo" : state?.status === "finished" ? "Encerrada" : "Aguardando"}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {BOMBA_NUMBERS.map((n) => {
              const out = drawn.includes(n);
              const isLast = lastDrawn === n;
              return (
                <div
                  key={n}
                  className={`aspect-square rounded-xl flex items-center justify-center font-bold font-mono text-lg border transition-all duration-300 ${
                    isLast
                      ? "bg-gradient-to-br from-red-500 to-orange-500 text-white border-white/40 scale-105 shadow-lg shadow-red-500/40"
                      : out
                        ? "bg-red-500/20 text-red-300 border-red-500/40 line-through"
                        : "bg-white/10 backdrop-blur-md text-foreground border-purple-300/20"
                  }`}
                >
                  {pad(n)}
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleDraw}
            disabled={rolling || state?.status !== "running" || remaining.length === 0}
            className="w-full h-14 text-base font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
          >
            {rolling ? "💣 BOMBA LANÇADA..." : "💣 SORTEAR BOMBA"}
          </Button>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>👥 {picks.length} jogadores</span>
            <span>🎯 {remaining.length} disponíveis</span>
            <span>💥 {drawn.length} sorteados</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button onClick={handleStart} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90">
              <Play className="w-4 h-4 mr-1" /> Iniciar
            </Button>
            <Button onClick={handleReset} size="sm" variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20">
              <RotateCcw className="w-4 h-4 mr-1" /> Reiniciar
            </Button>
            <Button onClick={handleToggleOpen} size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
              {state?.is_open ? <><Lock className="w-4 h-4 mr-1" /> Fechar inscrições</> : <><Unlock className="w-4 h-4 mr-1" /> Abrir inscrições</>}
            </Button>
            <Button onClick={handleClearPlayers} size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
              <Trash2 className="w-4 h-4 mr-1" /> Limpar jogadores
            </Button>
          </div>
        </div>

        {/* Atingidos */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground">
              💥 Atingidos {lastDrawn != null && <span className="text-orange-400 font-mono">(nº {pad(lastDrawn)})</span>}
            </h4>
            <Button onClick={handleCopyNames} size="sm" disabled={hitPlayers.length === 0}
              className={copied ? "bg-green-500 hover:bg-green-500" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? "Copiado" : "Copiar nomes"}
            </Button>
          </div>
          <p className="text-sm text-foreground break-words">
            {hitPlayers.length > 0
              ? hitPlayers.map((p) => p.player_name).join(" / ")
              : <span className="text-muted-foreground">Nenhum jogador atingido.</span>}
          </p>
        </div>

        {/* Histórico */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
          <h4 className="text-sm font-bold text-foreground mb-2">🕒 Histórico</h4>
          <div className="flex flex-wrap gap-1.5">
            {drawn.length === 0 && <span className="text-xs text-muted-foreground">Nenhum número sorteado.</span>}
            {drawn.map((n, i) => (
              <span key={`${n}-${i}`} className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-sm flex items-center justify-center">
                {pad(n)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: jogadores */}
      <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
        {winners.length > 0 && (
          <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-2xl p-4 shadow-xl">
            <h3 className="text-lg font-bold text-yellow-300 mb-2">🏆 {winners.length > 1 ? "VENCEDORES (empate)" : "VENCEDOR"}</h3>
            <div className="space-y-1">
              {winners.map((w) => (
                <p key={w.id} className="text-sm text-foreground">
                  <span className="font-bold">{w.player_name}</span>
                  <span className="text-muted-foreground"> • Número sobrevivente: </span>
                  <span className="font-mono text-yellow-300 font-bold">{pad(bombaAlive(w.numbers, drawn)[0])}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl flex-1 min-h-0 flex flex-col">
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Jogadores ({picks.length})
          </h4>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid gap-2 sm:grid-cols-2">
            {picks.length === 0 && <p className="text-xs text-muted-foreground">Nenhum jogador registrou sua bomba ainda.</p>}
            {picks.map((p) => {
              const alive = bombaAlive(p.numbers, drawn);
              const dead = p.numbers.filter((n) => drawn.includes(n));
              const isWinner = alive.length === 1;
              return (
                <div key={p.id} className={`rounded-xl p-3 border backdrop-blur-md ${
                  isWinner ? "bg-yellow-500/10 border-yellow-400/50" : alive.length === 0 ? "bg-white/5 border-red-500/30 opacity-70" : "bg-white/5 border-white/10"}`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-bold text-foreground truncate">{isWinner ? "🏆 " : ""}{p.player_name}</span>
                    <Button onClick={() => handleRemovePick(p.id)} size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-400 hover:text-red-300">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {p.numbers.map((n) => (
                      <span key={n} className={`w-7 h-7 rounded-md font-mono text-xs flex items-center justify-center border ${
                        drawn.includes(n) ? "bg-red-500/25 text-red-300 border-red-500/40 line-through" : "bg-green-500/15 text-green-300 border-green-400/40"}`}>
                        {pad(n)}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Eliminados: {dead.length ? dead.map(pad).join(" • ") : "—"} · Vivos: {alive.length ? alive.map(pad).join(" • ") : "—"}
                  </p>
                  <p className={`text-[11px] font-semibold ${alive.length === 1 ? "text-yellow-300" : alive.length === 0 ? "text-red-400" : "text-green-400"}`}>
                    Status: {alive.length === 0 ? "Explodiu" : `${alive.length} número${alive.length > 1 ? "s" : ""} vivo${alive.length > 1 ? "s" : ""}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histórico por rodada */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl max-h-64 flex flex-col">
          <h4 className="text-sm font-bold text-foreground mb-2">📜 Histórico de rodadas</h4>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5">
            {rounds.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma rodada sorteada ainda.</p>}
            {[...rounds].reverse().map((r) => (
              <div key={r.round} className="flex items-start gap-2 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5">
                <span className="text-[10px] font-bold text-muted-foreground w-10 shrink-0 pt-1">#{r.round}</span>
                <span className="w-8 h-8 shrink-0 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-sm flex items-center justify-center">
                  {pad(r.number)}
                </span>
                <p className="text-[11px] text-foreground break-words flex-1 pt-1">
                  {r.hits.length > 0 ? r.hits.join(" / ") : <span className="text-muted-foreground">Nenhum jogador atingido</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
