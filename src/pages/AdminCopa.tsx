import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const GAMES = [
  { id: 1, home: "Brasil", away: "Marrocos", homeFlag: "🇧🇷", awayFlag: "🇲🇦", label: "🇧🇷 Brasil vs Marrocos 🇲🇦 — 13/06" },
  { id: 2, home: "Brasil", away: "Haiti", homeFlag: "🇧🇷", awayFlag: "🇭🇹", label: "🇧🇷 Brasil vs Haiti 🇭🇹 — 19/06" },
  { id: 3, home: "Escócia", away: "Brasil", homeFlag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", awayFlag: "🇧🇷", label: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia vs Brasil 🇧🇷 — 24/06" },
];

const ADMIN_PASSWORD = "admin2026";

type Bet = { id: string; username: string; game_id: number; score_home: number; score_away: number; created_at?: string };
type Result = { game_id: number; score_home: number; score_away: number };
type BUser = { id: string; username: string; created_at: string };

function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; color: string }[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const colors = ["#009C3B", "#FFDF00", "#002776", "#ffffff"];
    setPieces(Array.from({ length: 80 }, (_, i) => ({
      id: i + trigger * 1000, left: Math.random() * 100, delay: Math.random() * 0.6, color: colors[i % colors.length],
    })));
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [trigger]);
  if (!pieces.length) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      <style>{`@keyframes confetti-fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", top: -20, left: `${p.left}%`, width: 10, height: 14, background: p.color,
          animation: `confetti-fall 3s ${p.delay}s linear forwards`, transform: "rotate(0deg)",
        }} />
      ))}
    </div>
  );
}

export default function AdminCopa() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [bets, setBets] = useState<Bet[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [users, setUsers] = useState<BUser[]>([]);
  const [inputs, setInputs] = useState<Record<number, { h: string; a: string }>>({});
  const [confetti, setConfetti] = useState(0);

  const refresh = async () => {
    const [b, r, u] = await Promise.all([
      supabase.from("bolao_bets").select("*").order("created_at", { ascending: false }),
      supabase.from("bolao_results").select("*"),
      supabase.from("bolao_users").select("*").order("created_at", { ascending: false }),
    ]);
    if (b.data) setBets(b.data as Bet[]);
    if (r.data) setResults(r.data as Result[]);
    if (u.data) setUsers(u.data as BUser[]);
  };

  useEffect(() => { if (authed) refresh(); }, [authed]);

  const confirmResult = async (gid: number) => {
    const inp = inputs[gid];
    const h = parseInt(inp?.h ?? "", 10);
    const a = parseInt(inp?.a ?? "", 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return toast({ title: "Placar inválido", variant: "destructive" });
    const { error } = await supabase.from("bolao_results").upsert({ game_id: gid, score_home: h, score_away: a, confirmed_at: new Date().toISOString() });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    const winners = bets.filter(b => b.game_id === gid && b.score_home === h && b.score_away === a);
    setConfetti(c => c + 1);
    if (winners.length === 1) toast({ title: `🏆 Parabéns, ${winners[0].username}!`, description: "Você acertou o placar!" });
    else if (winners.length > 1) toast({ title: "🏆 Prêmio dividido!", description: `Ganhadores: ${winners.map(w => w.username).join(", ")}` });
    else toast({ title: "Nenhum acerto exato neste jogo." });
    refresh();
  };

  const deleteBet = async (bet: Bet) => {
    if (!confirm(`Remover a aposta de ${bet.username} (${bet.score_home} x ${bet.score_away})?\nA pessoa poderá apostar novamente neste jogo.`)) return;
    const { error } = await supabase.from("bolao_bets").delete().eq("id", bet.id);
    if (error) return toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    toast({ title: "Aposta removida", description: `${bet.username} já pode apostar novamente.` });
    refresh();
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#001a2e", color: "#fff", fontFamily: "Inter, sans-serif" }}>
        <div style={{ background: "rgba(255,255,255,0.06)", padding: 30, borderRadius: 16, width: 320 }}>
          <h1 style={{ margin: "0 0 16px", textAlign: "center" }}>Admin Bolão</h1>
          <input type="password" placeholder="Senha" value={pw} onChange={e => setPw(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", marginBottom: 12 }}
            onKeyDown={e => { if (e.key === "Enter") { if (pw === ADMIN_PASSWORD) setAuthed(true); else toast({ title: "Senha incorreta", variant: "destructive" }); }}} />
          <button onClick={() => { if (pw === ADMIN_PASSWORD) setAuthed(true); else toast({ title: "Senha incorreta", variant: "destructive" }); }}
            style={{ width: "100%", padding: 12, borderRadius: 8, background: "linear-gradient(90deg,#009C3B,#FFDF00)", color: "#002776", fontWeight: 800, border: "none", cursor: "pointer" }}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#001a2e,#002b1a)", color: "#fff", padding: 24, fontFamily: "Inter, sans-serif" }}>
      <Confetti trigger={confetti} />
      <h1 style={{ textAlign: "center", marginTop: 0 }}>Painel Admin — Bolão da Copa</h1>
      <div style={{ display: "grid", gap: 16, maxWidth: 900, margin: "20px auto", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
        {GAMES.map(g => {
          const r = results.find(x => x.game_id === g.id);
          const gameBets = bets.filter(b => b.game_id === g.id);
          const winners = r ? gameBets.filter(b => b.score_home === r.score_home && b.score_away === r.score_away) : [];
          const inp = inputs[g.id] || { h: "", a: "" };
          return (
            <div key={g.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>{g.label}</div>
              <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 6 }}>{gameBets.length} aposta(s)</div>
              {r && <div style={{ background: "rgba(255,223,0,0.15)", padding: 8, borderRadius: 8, marginBottom: 10, fontSize: 13 }}>Resultado: <strong>{r.score_home} x {r.score_away}</strong></div>}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input type="number" min={0} placeholder="Casa" value={inp.h} onChange={e => setInputs(s => ({ ...s, [g.id]: { ...inp, h: e.target.value } }))}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", textAlign: "center" }} />
                <input type="number" min={0} placeholder="Visitante" value={inp.a} onChange={e => setInputs(s => ({ ...s, [g.id]: { ...inp, a: e.target.value } }))}
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", textAlign: "center" }} />
              </div>
              <button onClick={() => confirmResult(g.id)}
                style={{ width: "100%", padding: 10, borderRadius: 8, background: "linear-gradient(90deg,#009C3B,#FFDF00)", color: "#002776", fontWeight: 800, border: "none", cursor: "pointer" }}>Confirmar Resultado</button>
              {r && winners.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 13 }}>🏆 Ganhador(es): <strong>{winners.map(w => w.username).join(", ")}</strong></div>
              )}
              {r && winners.length === 0 && <div style={{ marginTop: 10, fontSize: 13, color: "#94a3b8" }}>Nenhum acerto exato.</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 16, maxWidth: 900, margin: "20px auto", gridTemplateColumns: "1fr 1.4fr" }}>
        {/* Cadastrados */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>👥 Cadastrados</h2>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{users.length} pessoa(s)</span>
          </div>
          <div style={{ maxHeight: 360, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {users.length === 0 && <div style={{ fontSize: 13, color: "#94a3b8" }}>Ninguém cadastrado ainda.</div>}
            {users.map(u => {
              const count = bets.filter(b => b.username.toLowerCase() === u.username.toLowerCase()).length;
              return (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.04)", padding: "8px 10px", borderRadius: 8, fontSize: 13 }}>
                  <strong>{u.username}</strong>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{count} aposta(s)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Apostas */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>🎯 Apostas registradas</h2>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{bets.length} total</span>
          </div>
          <div style={{ maxHeight: 360, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {bets.length === 0 && <div style={{ fontSize: 13, color: "#94a3b8" }}>Nenhuma aposta ainda.</div>}
            {bets.map(b => {
              const g = GAMES.find(x => x.id === b.game_id);
              return (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", padding: "8px 10px", borderRadius: 8, fontSize: 13 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div><strong>{b.username}</strong> — <span style={{ color: "#FFDF00", fontWeight: 700 }}>{b.score_home} x {b.score_away}</span></div>
                    <div style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g?.label ?? `Jogo ${b.game_id}`}</div>
                  </div>
                  <button onClick={() => deleteBet(b)} title="Remover aposta"
                    style={{ background: "rgba(220,38,38,0.85)", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
