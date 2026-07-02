import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ADMIN_PASSWORD = "admin2026";

type Game = { id: number; home: string; away: string; label: string; opens_at: string; closes_at: string; position: number };
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

// datetime-local <-> ISO helpers (Brasília UTC-3)
const toLocalInput = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const off = -180; // -03:00
  const local = new Date(d.getTime() - (d.getTimezoneOffset() - off) * 60000);
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
};
const fromLocalInput = (v: string) => {
  if (!v) return "";
  // treat input as -03:00
  return new Date(v + ":00-03:00").toISOString();
};

export default function AdminCopa() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [users, setUsers] = useState<BUser[]>([]);
  const [inputs, setInputs] = useState<Record<number, { h: string; a: string }>>({});
  const [prize, setPrize] = useState<number>(2000);
  const [confetti, setConfetti] = useState(0);

  // new-game form
  const [ng, setNg] = useState({ home: "", away: "", label: "", opens_at: "", closes_at: "" });

  const refresh = async () => {
    const [b, r, u, g, s] = await Promise.all([
      supabase.from("bolao_bets").select("*").order("created_at", { ascending: false }),
      supabase.from("bolao_results").select("*"),
      supabase.from("bolao_users").select("*").order("created_at", { ascending: false }),
      supabase.from("bolao_matches").select("*").order("position").order("id"),
      supabase.from("bolao_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (b.data) setBets(b.data as Bet[]);
    if (r.data) setResults(r.data as Result[]);
    if (u.data) setUsers(u.data as BUser[]);
    if (g.data) setGames(g.data as Game[]);
    if (s.data) setPrize((s.data as any).prize_total ?? 2000);
  };

  useEffect(() => {
    if (!authed) return;
    refresh();
    const ch = supabase.channel("admincopa")
      .on("postgres_changes", { event: "*", schema: "public", table: "bolao_bets" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bolao_results" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bolao_users" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bolao_matches" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bolao_settings" }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [authed]);

  const savePrize = async () => {
    const { error } = await supabase.from("bolao_settings").upsert({ id: 1, prize_total: prize, updated_at: new Date().toISOString() });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Prêmio atualizado" });
  };

  const addGame = async () => {
    if (!ng.home || !ng.away || !ng.label || !ng.opens_at || !ng.closes_at) {
      return toast({ title: "Preencha todos os campos", variant: "destructive" });
    }
    const { error } = await supabase.from("bolao_matches").insert({
      home: ng.home, away: ng.away, label: ng.label,
      opens_at: fromLocalInput(ng.opens_at), closes_at: fromLocalInput(ng.closes_at),
      position: (games[games.length - 1]?.position ?? 0) + 1,
    });
    if (error) return toast({ title: "Erro ao criar jogo", description: error.message, variant: "destructive" });
    setNg({ home: "", away: "", label: "", opens_at: "", closes_at: "" });
    toast({ title: "Jogo cadastrado" });
  };

  const updateGame = async (id: number, patch: Partial<Game>) => {
    const { error } = await supabase.from("bolao_matches").update(patch).eq("id", id);
    if (error) toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
  };

  const deleteGame = async (g: Game) => {
    if (!confirm(`Excluir "${g.label}"?\n(As apostas relacionadas continuarão salvas.)`)) return;
    const { error } = await supabase.from("bolao_matches").delete().eq("id", g.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
  };

  const confirmResult = async (gid: number) => {
    const inp = inputs[gid];
    const h = parseInt(inp?.h ?? "", 10);
    const a = parseInt(inp?.a ?? "", 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return toast({ title: "Placar inválido", variant: "destructive" });
    const { error } = await supabase.from("bolao_results").upsert({ game_id: gid, score_home: h, score_away: a, confirmed_at: new Date().toISOString() });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    const winners = bets.filter(b => b.game_id === gid && b.score_home === h && b.score_away === a);
    setConfetti(c => c + 1);
    if (winners.length === 1) toast({ title: `🏆 Parabéns, ${winners[0].username}!`, description: "Acertou o placar!" });
    else if (winners.length > 1) toast({ title: "🏆 Prêmio dividido!", description: `Ganhadores: ${winners.map(w => w.username).join(", ")}` });
    else toast({ title: "Nenhum acerto exato neste jogo." });
  };

  const deleteBet = async (bet: Bet) => {
    if (!confirm(`Remover a aposta de ${bet.username} (${bet.score_home} x ${bet.score_away})?`)) return;
    const { error } = await supabase.from("bolao_bets").delete().eq("id", bet.id);
    if (error) return toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    toast({ title: "Aposta removida" });
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

  const inputSt: React.CSSProperties = { padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", width: "100%" };
  const cardSt: React.CSSProperties = { background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#001a2e,#002b1a)", color: "#fff", padding: 24, fontFamily: "Inter, sans-serif" }}>
      <Confetti trigger={confetti} />
      <h1 style={{ textAlign: "center", marginTop: 0 }}>Painel Admin — Bolão da Copa</h1>

      {/* Prize + New game */}
      <div style={{ maxWidth: 1100, margin: "10px auto 20px", display: "grid", gap: 16, gridTemplateColumns: "1fr 1.6fr" }}>
        <div style={cardSt}>
          <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>💰 Prêmio total (home)</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="number" value={prize} onChange={e => setPrize(parseInt(e.target.value) || 0)} style={inputSt} />
            <button onClick={savePrize} style={{ padding: "8px 16px", borderRadius: 8, background: "linear-gradient(90deg,#009C3B,#FFDF00)", color: "#002776", fontWeight: 800, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Salvar</button>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Aparece na home de /bolaodacopa</div>
        </div>

        <div style={cardSt}>
          <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>➕ Cadastrar novo jogo</h2>
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1.6fr" }}>
            <input placeholder="Time casa (ex: Brasil)" value={ng.home} onChange={e => setNg({ ...ng, home: e.target.value })} style={inputSt} />
            <input placeholder="Time visitante (ex: Japão)" value={ng.away} onChange={e => setNg({ ...ng, away: e.target.value })} style={inputSt} />
            <input placeholder="Rótulo (ex: Segunda, 29/06 às 14:00)" value={ng.label} onChange={e => setNg({ ...ng, label: e.target.value })} style={inputSt} />
          </div>
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr auto", marginTop: 8 }}>
            <label style={{ fontSize: 11, color: "#cbd5e1" }}>Abre em (Brasília)
              <input type="datetime-local" value={ng.opens_at} onChange={e => setNg({ ...ng, opens_at: e.target.value })} style={inputSt} />
            </label>
            <label style={{ fontSize: 11, color: "#cbd5e1" }}>Fecha em (Brasília)
              <input type="datetime-local" value={ng.closes_at} onChange={e => setNg({ ...ng, closes_at: e.target.value })} style={inputSt} />
            </label>
            <button onClick={addGame} style={{ alignSelf: "end", padding: "8px 16px", borderRadius: 8, background: "linear-gradient(90deg,#009C3B,#FFDF00)", color: "#002776", fontWeight: 800, border: "none", cursor: "pointer" }}>Adicionar</button>
          </div>
        </div>
      </div>

      {/* Games list with result confirmation + edit */}
      <div style={{ display: "grid", gap: 16, maxWidth: 1100, margin: "20px auto", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
        {games.map(g => {
          const r = results.find(x => x.game_id === g.id);
          const gameBets = bets.filter(b => b.game_id === g.id);
          const winners = r ? gameBets.filter(b => b.score_home === r.score_home && b.score_away === r.score_away) : [];
          const inp = inputs[g.id] || { h: "", a: "" };
          return (
            <div key={g.id} style={cardSt}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input value={g.label} onChange={e => setGames(gs => gs.map(x => x.id === g.id ? { ...x, label: e.target.value } : x))} onBlur={e => updateGame(g.id, { label: e.target.value })} style={{ ...inputSt, fontWeight: 700 }} />
                <button onClick={() => deleteGame(g)} style={{ background: "rgba(220,38,38,0.85)", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }}>Excluir</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                <input value={g.home} onChange={e => setGames(gs => gs.map(x => x.id === g.id ? { ...x, home: e.target.value } : x))} onBlur={e => updateGame(g.id, { home: e.target.value })} style={inputSt} />
                <input value={g.away} onChange={e => setGames(gs => gs.map(x => x.id === g.id ? { ...x, away: e.target.value } : x))} onBlur={e => updateGame(g.id, { away: e.target.value })} style={inputSt} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: "#94a3b8" }}>Abre
                  <input type="datetime-local" defaultValue={toLocalInput(g.opens_at)} onBlur={e => updateGame(g.id, { opens_at: fromLocalInput(e.target.value) })} style={inputSt} />
                </label>
                <label style={{ fontSize: 10, color: "#94a3b8" }}>Fecha
                  <input type="datetime-local" defaultValue={toLocalInput(g.closes_at)} onBlur={e => updateGame(g.id, { closes_at: fromLocalInput(e.target.value) })} style={inputSt} />
                </label>
              </div>
              <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 6 }}>{gameBets.length} aposta(s)</div>
              {r && <div style={{ background: "rgba(255,223,0,0.15)", padding: 8, borderRadius: 8, marginBottom: 10, fontSize: 13 }}>Resultado: <strong>{g.home} {r.score_home} x {r.score_away} {g.away}</strong></div>}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#FFDF00", marginBottom: 4, textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase" }}>{g.home}</div>
                  <input type="number" min={0} placeholder="0" value={inp.h} onChange={e => setInputs(s => ({ ...s, [g.id]: { ...inp, h: e.target.value } }))}
                    style={{ ...inputSt, textAlign: "center", fontSize: 18, fontWeight: 800 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#FFDF00", marginBottom: 4, textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase" }}>{g.away}</div>
                  <input type="number" min={0} placeholder="0" value={inp.a} onChange={e => setInputs(s => ({ ...s, [g.id]: { ...inp, a: e.target.value } }))}
                    style={{ ...inputSt, textAlign: "center", fontSize: 18, fontWeight: 800 }} />
                </div>
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
        {games.length === 0 && <div style={{ ...cardSt, textAlign: "center", color: "#94a3b8" }}>Nenhum jogo cadastrado. Use o formulário acima.</div>}
      </div>

      <div style={{ display: "grid", gap: 16, maxWidth: 1100, margin: "20px auto", gridTemplateColumns: "1fr 1.4fr" }}>
        <div style={cardSt}>
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

        <div style={cardSt}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>🎯 Apostas registradas</h2>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{bets.length} total</span>
          </div>
          <div style={{ maxHeight: 360, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {bets.length === 0 && <div style={{ fontSize: 13, color: "#94a3b8" }}>Nenhuma aposta ainda.</div>}
            {bets.map(b => {
              const g = games.find(x => x.id === b.game_id);
              return (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", padding: "8px 10px", borderRadius: 8, fontSize: 13 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div><strong>{b.username}</strong> — <span style={{ color: "#FFDF00", fontWeight: 700 }}>{g ? `${g.home} ${b.score_home} x ${b.score_away} ${g.away}` : `${b.score_home} x ${b.score_away}`}</span></div>
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
