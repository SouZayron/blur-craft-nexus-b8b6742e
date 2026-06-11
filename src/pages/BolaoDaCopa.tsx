import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Game = {
  id: number;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  date: Date;
  label: string;
};

const GAMES: Game[] = [
  { id: 1, home: "Brasil", away: "Marrocos", homeFlag: "🇧🇷", awayFlag: "🇲🇦", date: new Date("2026-06-13T19:00:00-03:00"), label: "Sábado, 13/06 às 19:00" },
  { id: 2, home: "Brasil", away: "Haiti", homeFlag: "🇧🇷", awayFlag: "🇭🇹", date: new Date("2026-06-19T21:30:00-03:00"), label: "Sexta, 19/06 às 21:30" },
  { id: 3, home: "Escócia", away: "Brasil", homeFlag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", awayFlag: "🇧🇷", date: new Date("2026-06-24T19:00:00-03:00"), label: "Quarta, 24/06 às 19:00" },
];

type Bet = { id: string; user_id: string; username: string; game_id: number; score_home: number; score_away: number };
type Result = { game_id: number; score_home: number; score_away: number };

const STORAGE_KEY = "bolao_session_v1";

function fmtCountdown(ms: number) {
  if (ms <= 0) return "0d 00:00:00";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d}d ${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function getWindow(game: Game) {
  const open = new Date(game.date.getTime() - 2 * 24 * 60 * 60 * 1000);
  open.setHours(19, 0, 0, 0);
  const close = new Date(game.date.getTime() - 24 * 60 * 60 * 1000);
  close.setHours(19, 0, 0, 0);
  return { open, close };
}

const styles = `
@keyframes bolao-fade-up { from { opacity:0; transform:translateY(20px);} to { opacity:1; transform:translateY(0);} }
@keyframes bolao-gradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes bolao-border-spin { to { transform: rotate(360deg); } }
@keyframes bolao-trophy-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
.bolao-title{
  background: linear-gradient(90deg, #009C3B, #FFDF00, #002776, #ffffff, #009C3B);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: bolao-gradient 6s ease-in-out infinite;
}
.bolao-glow{position:relative; border-radius:20px; padding:2px; background:rgba(255,255,255,0.05); overflow:hidden;}
.bolao-glow::before{
  content:""; position:absolute; inset:-50%;
  background: conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(255,223,0,0.9) 82%, rgba(255,255,255,0.9) 92%, transparent 100%);
  animation: bolao-border-spin 6s linear infinite;
  z-index:0;
}
.bolao-glow-inner{position:relative; z-index:1; background:linear-gradient(160deg, rgba(0,39,118,0.92), rgba(0,80,40,0.92)); border-radius:18px; padding:20px; height:100%;}
.bolao-fade{ animation: bolao-fade-up 0.7s ease-out both; }
.bolao-input{ background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.25); color:#fff; padding:10px 12px; border-radius:10px; width:100%; font-size:15px; outline:none; }
.bolao-input:focus{ border-color:#FFDF00; }
.bolao-btn{ background:linear-gradient(90deg,#009C3B,#FFDF00); color:#002776; font-weight:800; border:none; padding:12px 18px; border-radius:12px; cursor:pointer; width:100%; font-size:15px; transition:transform .15s ease, filter .2s ease;}
.bolao-btn:hover{ transform:translateY(-1px); filter:brightness(1.05);}
.bolao-btn:disabled{ opacity:.6; cursor:not-allowed;}
.bolao-card{ background: rgba(0,20,40,0.55); border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:18px; }
`;

export default function BolaoDaCopa() {
  const [now, setNow] = useState(Date.now());
  const [session, setSession] = useState<{ id: string; username: string } | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  // Login form
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [agree, setAgree] = useState(false);

  // Bet inputs per game
  const [betInputs, setBetInputs] = useState<Record<number, { h: string; a: string }>>({});

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {}
  }, []);

  const refresh = async () => {
    const [b, r] = await Promise.all([
      supabase.from("bolao_bets").select("*").order("created_at", { ascending: true }),
      supabase.from("bolao_results").select("*"),
    ]);
    if (b.data) setBets(b.data as Bet[]);
    if (r.data) setResults(r.data as Result[]);
  };

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("bolao")
      .on("postgres_changes", { event: "*", schema: "public", table: "bolao_bets" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bolao_results" }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const handleLogin = async () => {
    const u = username.trim();
    if (!u) return toast({ title: "Informe o usuário", variant: "destructive" });
    if (!/^\d{4}$/.test(pin)) return toast({ title: "PIN deve ter 4 dígitos", variant: "destructive" });
    if (!agree) return toast({ title: "Você precisa aceitar as regras", variant: "destructive" });

    const { data: existing } = await supabase.from("bolao_users").select("*").ilike("username", u).maybeSingle();
    if (existing) {
      if (existing.pin !== pin) return toast({ title: "Senha incorreta", variant: "destructive" });
      const sess = { id: existing.id, username: existing.username };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
      setSession(sess);
    } else {
      const { data, error } = await supabase.from("bolao_users").insert({ username: u, pin }).select().single();
      if (error) return toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
      const sess = { id: data!.id, username: data!.username };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
      setSession(sess);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const submitBet = async (game: Game) => {
    if (!session) return;
    const inp = betInputs[game.id] || { h: "", a: "" };
    const h = parseInt(inp.h, 10);
    const a = parseInt(inp.a, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return toast({ title: "Placar inválido", variant: "destructive" });
    const { error } = await supabase.from("bolao_bets").insert({
      user_id: session.id, username: session.username, game_id: game.id, score_home: h, score_away: a,
    });
    if (error) return toast({ title: "Erro ao apostar", description: error.message, variant: "destructive" });
    toast({ title: "Aposta registrada!" });
  };

  const myBetFor = (gid: number) => bets.find(b => b.user_id === session?.id && b.game_id === gid);

  const winnersFor = (gid: number) => {
    const r = results.find(x => x.game_id === gid);
    if (!r) return null;
    return bets.filter(b => b.game_id === gid && b.score_home === r.score_home && b.score_away === r.score_away);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #001a2e 0%, #002b1a 100%)", color: "#fff", padding: "24px 20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{styles}</style>

      <header className="bolao-fade" style={{ textAlign: "center", marginBottom: 18 }}>
        <h1 className="bolao-title" style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
          BOLÃO EM ALTA!
        </h1>
        <p style={{ marginTop: 8, fontSize: "clamp(14px,1.6vw,20px)", letterSpacing: "0.3em", color: "#FFDF00", fontWeight: 700 }}>
          COPA DO MUNDO '26
        </p>
      </header>

      <div className="bolao-fade bolao-card" style={{ maxWidth: 980, margin: "0 auto 20px", animationDelay: "0.1s" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 18, color: "#FFDF00" }}>Regras</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.7, color: "#dbeafe" }}>
          <li>Apenas 1 aposta permitida por jogo</li>
          <li>As apostas abrem às 19h, 2 dias antes do jogo</li>
          <li>As apostas fecham às 19h do dia anterior ao jogo</li>
          <li>Se houver mais de um ganhador, o prêmio será dividido igualmente</li>
          <li>Participação exclusiva para usuários ativos do xat.com/altavibe</li>
        </ul>
      </div>

      {!session ? (
        <div className="bolao-fade" style={{ maxWidth: 420, margin: "30px auto 0" }}>
          <div className="bolao-glow">
            <div className="bolao-glow-inner">
              <h2 style={{ margin: "0 0 16px", textAlign: "center", fontSize: 22 }}>Entrar no Bolão</h2>
              <label style={{ fontSize: 13, color: "#cbd5e1" }}>Seu usuário do xat.com</label>
              <input className="bolao-input" style={{ marginTop: 6, marginBottom: 14 }} value={username} onChange={e => setUsername(e.target.value)} maxLength={40} />
              <label style={{ fontSize: 13, color: "#cbd5e1" }}>Senha (4 dígitos)</label>
              <input className="bolao-input" style={{ marginTop: 6, marginBottom: 14 }} type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} />
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#cbd5e1", marginBottom: 16, cursor: "pointer" }}>
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
                <span>Sou usuário ativo do xat.com/altavibe e li as regras do bolão</span>
              </label>
              <button className="bolao-btn" onClick={handleLogin}>Entrar no Bolão</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ maxWidth: 980, margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#cbd5e1" }}>
            <span>Logado como <strong style={{ color: "#FFDF00" }}>{session.username}</strong></span>
            <button onClick={logout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Sair</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, maxWidth: 1200, margin: "0 auto" }}>
            {GAMES.map((game, idx) => {
              const { open, close } = getWindow(game);
              const t = now;
              const state: "locked" | "open" | "closed" = t < open.getTime() ? "locked" : t < close.getTime() ? "open" : "closed";
              const my = myBetFor(game.id);
              const gameBets = bets.filter(b => b.game_id === game.id);
              const result = results.find(r => r.game_id === game.id);
              const winners = winnersFor(game.id);
              const inp = betInputs[game.id] || { h: "", a: "" };
              return (
                <div key={game.id} className="bolao-fade" style={{ animationDelay: `${0.15 + idx * 0.1}s` }}>
                  <div className="bolao-glow">
                    <div className="bolao-glow-inner">
                      <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ fontSize: 28 }}>{game.homeFlag}</span> {game.home} <span style={{ color: "#FFDF00" }}>vs</span> {game.away} <span style={{ fontSize: 28 }}>{game.awayFlag}</span>
                      </div>
                      <div style={{ textAlign: "center", fontSize: 12, color: "#cbd5e1", marginBottom: 12 }}>{game.label}</div>

                      {result && (
                        <div style={{ background: "rgba(255,223,0,0.12)", border: "1px solid rgba(255,223,0,0.4)", borderRadius: 10, padding: 10, marginBottom: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 12, color: "#FFDF00", fontWeight: 700 }}>Resultado Oficial</div>
                          <div style={{ fontSize: 22, fontWeight: 800 }}>{result.score_home} x {result.score_away}</div>
                          {winners && winners.length > 0 ? (
                            <div style={{ marginTop: 6, fontSize: 13 }}>
                              <span style={{ display: "inline-block", animation: "bolao-trophy-pulse 1.4s ease-in-out infinite" }}>🏆</span>{" "}
                              {winners.length === 1
                                ? <>Parabéns, <strong>{winners[0].username}</strong>! Você acertou o placar!</>
                                : <>Prêmio dividido! Ganhadores: <strong>{winners.map(w => w.username).join(", ")}</strong></>
                              }
                            </div>
                          ) : (
                            <div style={{ marginTop: 6, fontSize: 13, color: "#cbd5e1" }}>Nenhum acerto exato neste jogo.</div>
                          )}
                        </div>
                      )}

                      {state === "locked" && (
                        <div style={{ textAlign: "center", padding: "14px 8px" }}>
                          <div style={{ fontSize: 36 }}>🔒</div>
                          <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>Apostas abrem em:</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#FFDF00", marginTop: 2 }}>
                            {fmtCountdown(open.getTime() - t)}
                          </div>
                        </div>
                      )}

                      {state === "open" && !result && (
                        my ? (
                          <div style={{ textAlign: "center", padding: 10 }}>
                            <div style={{ fontSize: 14, color: "#9ae6b4", fontWeight: 700 }}>Aposta registrada!</div>
                            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{my.score_home} x {my.score_away}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Fecha em {fmtCountdown(close.getTime() - t)}</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                              <input className="bolao-input" style={{ width: 64, textAlign: "center", fontSize: 22, fontWeight: 800 }} type="number" min={0} value={inp.h} onChange={e => setBetInputs(s => ({ ...s, [game.id]: { ...inp, h: e.target.value } }))} />
                              <span style={{ fontSize: 20, color: "#FFDF00" }}>x</span>
                              <input className="bolao-input" style={{ width: 64, textAlign: "center", fontSize: 22, fontWeight: 800 }} type="number" min={0} value={inp.a} onChange={e => setBetInputs(s => ({ ...s, [game.id]: { ...inp, a: e.target.value } }))} />
                            </div>
                            <button className="bolao-btn" onClick={() => submitBet(game)}>Confirmar Aposta</button>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, textAlign: "center" }}>Fecha em {fmtCountdown(close.getTime() - t)}</div>
                          </div>
                        )
                      )}

                      {(state === "closed" || (state === "open" && result)) && (
                        <div>
                          <div style={{ fontSize: 12, color: "#FFDF00", fontWeight: 700, marginBottom: 6 }}>Apostas enviadas</div>
                          <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                            {gameBets.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8" }}>Nenhuma aposta.</div>}
                            {gameBets.map(b => {
                              const hit = result && b.score_home === result.score_home && b.score_away === result.score_away;
                              return (
                                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 8px", background: hit ? "rgba(255,223,0,0.15)" : "rgba(255,255,255,0.04)", borderRadius: 6 }}>
                                  <span>{hit && "🏆 "}{b.username}</span>
                                  <strong>{b.score_home} x {b.score_away}</strong>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
