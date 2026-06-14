import { useEffect, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const LS_USER = "plinko_user";

type PUser = { id: string; name: string };
type Settings = { is_open: boolean; start_date: string };
type Play = { id: string; user_id: string; user_name: string; day: number; score: number };

// ---------- Plinko physics (canvas) ----------
const BOARD_W = 620;
const BOARD_H = 640;
const ROWS = 9;
const PEG_R = 5;
const BALL_R = 9;
const BALLS_PER_ROUND = 5;
const SLOT_SCORES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const GRAV = 0.18;
const RESTITUTION = 0.55;
const FRICTION = 0.998;

type Peg = { x: number; y: number };
type Boost = { x: number; y: number; mult: number; r: number; phase: number; hit: boolean };
type Ball = { x: number; y: number; vx: number; vy: number; mult: number; trail: { x: number; y: number }[]; settled: boolean; finalScore?: number };

const buildPegs = (): Peg[] => {
  const pegs: Peg[] = [];
  const startY = 90;
  const gapY = 50;
  const gapX = 55;
  for (let r = 0; r < ROWS; r++) {
    const count = 4 + r;
    const y = startY + r * gapY;
    const totalW = (count - 1) * gapX;
    const startX = (BOARD_W - totalW) / 2;
    for (let i = 0; i < count; i++) pegs.push({ x: startX + i * gapX, y });
  }
  return pegs;
};

const buildBoosts = (): Boost[] => {
  const colors = [2, 3, 5, 2, 3];
  const positions = [
    { x: 140, y: 200 },
    { x: 480, y: 240 },
    { x: 310, y: 320 },
    { x: 180, y: 410 },
    { x: 460, y: 440 },
  ];
  return positions.map((p, i) => ({ x: p.x, y: p.y, mult: colors[i], r: 14, phase: Math.random() * Math.PI * 2, hit: false }));
};

const PlinkoBoard = () => {
  const [user, setUser] = useState<PUser | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [pwInput, setPwInput] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [todayPlay, setTodayPlay] = useState<Play | null>(null);
  const [ranking, setRanking] = useState<{ user_id: string; user_name: string; total: number; days: number }[]>([]);
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2400); };

  // Game state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pegsRef = useRef<Peg[]>(buildPegs());
  const boostsRef = useRef<Boost[]>(buildBoosts());
  const ballsRef = useRef<Ball[]>([]);
  const animRef = useRef<number>();
  const [ballsLeft, setBallsLeft] = useState(BALLS_PER_ROUND);
  const [roundScore, setRoundScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---- Auth/session ----
  useEffect(() => {
    const raw = localStorage.getItem(LS_USER);
    if (raw) try { setUser(JSON.parse(raw)); } catch { /* noop */ }
  }, []);

  // ---- Load settings + today play + ranking ----
  const loadAll = useCallback(async () => {
    const s = await supabase.from("plinko_settings").select("is_open,start_date").eq("id", 1).maybeSingle();
    if (s.data) setSettings(s.data as Settings);

    const plays = await supabase.from("plinko_plays").select("user_id,user_name,score,day");
    if (plays.data) {
      const agg = new Map<string, { user_id: string; user_name: string; total: number; days: number }>();
      for (const p of plays.data as Play[]) {
        const cur = agg.get(p.user_id) || { user_id: p.user_id, user_name: p.user_name, total: 0, days: 0 };
        cur.total += p.score; cur.days += 1;
        agg.set(p.user_id, cur);
      }
      setRanking([...agg.values()].sort((a, b) => b.total - a.total).slice(0, 30));
    }
  }, []);

  const day = (() => {
    if (!settings) return 1;
    const start = new Date(settings.start_date + "T00:00:00");
    const diff = Math.floor((Date.now() - start.getTime()) / 86400000);
    return Math.min(15, Math.max(1, diff + 1));
  })();

  const loadTodayPlay = useCallback(async () => {
    if (!user) return;
    const r = await supabase.from("plinko_plays").select("*").eq("user_id", user.id).eq("day", day).maybeSingle();
    setTodayPlay((r.data as Play) || null);
  }, [user, day]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { loadTodayPlay(); }, [loadTodayPlay]);

  useEffect(() => {
    const ch = supabase
      .channel("plinko_public_ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "plinko_plays" }, () => { loadAll(); loadTodayPlay(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "plinko_settings" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "plinko_users" }, () => {
        // If admin deleted my user, force logout
        if (!user) return;
        supabase.from("plinko_users").select("id").eq("id", user.id).maybeSingle().then((r) => {
          if (!r.data) { localStorage.removeItem(LS_USER); setUser(null); }
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadAll, loadTodayPlay, user]);

  // ---- Login ----
  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    const name = nameInput.trim();
    if (!name) return setLoginErr("Informe o nome");
    if (!/^[0-9]{4}$/.test(pwInput)) return setLoginErr("Senha deve ter 4 dígitos");
    const { data, error } = await supabase.rpc("plinko_login", { p_name: name, p_password: pwInput });
    if (error) {
      const msg = error.message.includes("wrong_password") ? "Senha incorreta"
        : error.message.includes("game_closed") ? "Cadastros fechados"
        : "Erro ao entrar";
      return setLoginErr(msg);
    }
    const u = data as PUser;
    setUser({ id: u.id, name: u.name });
    localStorage.setItem(LS_USER, JSON.stringify({ id: u.id, name: u.name }));
    setNameInput(""); setPwInput("");
  };

  const logout = () => { localStorage.removeItem(LS_USER); setUser(null); setTodayPlay(null); };

  // ---- Game loop ----
  const resetRound = useCallback(() => {
    ballsRef.current = [];
    boostsRef.current = buildBoosts();
    setBallsLeft(BALLS_PER_ROUND);
    setRoundScore(0);
    setFinished(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.fillStyle = "#0a0818";
      ctx.fillRect(0, 0, BOARD_W, BOARD_H);

      // Subtle scanlines
      ctx.fillStyle = "rgba(108,62,240,0.04)";
      for (let y = 0; y < BOARD_H; y += 3) ctx.fillRect(0, y, BOARD_W, 1);

      // Slots
      const slotW = BOARD_W / SLOT_SCORES.length;
      for (let i = 0; i < SLOT_SCORES.length; i++) {
        const x = i * slotW;
        const grad = ctx.createLinearGradient(0, BOARD_H - 70, 0, BOARD_H);
        grad.addColorStop(0, "rgba(108,62,240,0.05)");
        grad.addColorStop(1, "rgba(245,197,24,0.18)");
        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, BOARD_H - 60, slotW - 4, 58);
        ctx.strokeStyle = "rgba(245,197,24,0.35)";
        ctx.strokeRect(x + 2, BOARD_H - 60, slotW - 4, 58);
        ctx.fillStyle = "#f5c518";
        ctx.font = "bold 16px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillText(String(SLOT_SCORES[i]), x + slotW / 2, BOARD_H - 25);
      }

      // Pegs
      for (const p of pegsRef.current) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PEG_R + 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212,184,255,0.18)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, PEG_R, 0, Math.PI * 2);
        ctx.fillStyle = "#d4b8ff";
        ctx.fill();
      }

      // Boosts
      for (const b of boostsRef.current) {
        if (b.hit) continue;
        b.phase += 0.08;
        const pulse = 1 + Math.sin(b.phase) * 0.15;
        const color = b.mult === 5 ? "#ff5fa2" : b.mult === 3 ? "#6be0ff" : "#86efac";
        ctx.beginPath();
        ctx.arc(b.x, b.y, (b.r + 4) * pulse, 0, Math.PI * 2);
        ctx.fillStyle = color + "33";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.fillStyle = "#0a0818";
        ctx.font = "bold 12px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("×" + b.mult, b.x, b.y);
      }

      // Balls
      for (const ball of ballsRef.current) {
        if (!ball.settled) {
          ball.vy += GRAV;
          ball.vx *= FRICTION;
          ball.x += ball.vx;
          ball.y += ball.vy;

          // wall bounce
          if (ball.x < BALL_R) { ball.x = BALL_R; ball.vx = -ball.vx * RESTITUTION; }
          if (ball.x > BOARD_W - BALL_R) { ball.x = BOARD_W - BALL_R; ball.vx = -ball.vx * RESTITUTION; }

          // peg collision
          for (const p of pegsRef.current) {
            const dx = ball.x - p.x;
            const dy = ball.y - p.y;
            const dist = Math.hypot(dx, dy);
            const min = BALL_R + PEG_R;
            if (dist < min) {
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);
              ball.x = p.x + nx * min;
              ball.y = p.y + ny * min;
              const dot = ball.vx * nx + ball.vy * ny;
              ball.vx = (ball.vx - 2 * dot * nx) * RESTITUTION + (Math.random() - 0.5) * 0.8;
              ball.vy = (ball.vy - 2 * dot * ny) * RESTITUTION;
            }
          }

          // boost collision
          for (const b of boostsRef.current) {
            if (b.hit) continue;
            if (Math.hypot(ball.x - b.x, ball.y - b.y) < BALL_R + b.r) {
              b.hit = true;
              ball.mult = Math.max(ball.mult, b.mult);
            }
          }

          // trail
          ball.trail.push({ x: ball.x, y: ball.y });
          if (ball.trail.length > 14) ball.trail.shift();

          // settle in slot
          if (ball.y > BOARD_H - 60 - BALL_R) {
            ball.settled = true;
            const slotIdx = Math.min(SLOT_SCORES.length - 1, Math.max(0, Math.floor(ball.x / (BOARD_W / SLOT_SCORES.length))));
            const base = SLOT_SCORES[slotIdx];
            const final = base * ball.mult;
            ball.finalScore = final;
            setRoundScore((s) => s + final);
            setBallsLeft((n) => {
              const next = n; // n already decremented when launched
              if (ballsRef.current.every((bb) => bb.settled) && next === 0) setFinished(true);
              return n;
            });
          }
        }

        // draw trail
        for (let i = 0; i < ball.trail.length; i++) {
          const t = ball.trail[i];
          const alpha = (i / ball.trail.length) * 0.5;
          ctx.beginPath();
          ctx.arc(t.x, t.y, BALL_R * (i / ball.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,197,24,${alpha})`;
          ctx.fill();
        }
        // draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R + 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245,197,24,0.3)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
        ctx.fillStyle = "#f5c518";
        ctx.fill();
        if (ball.settled && ball.finalScore) {
          ctx.fillStyle = "#fff";
          ctx.font = "bold 11px Inter, system-ui";
          ctx.textAlign = "center";
          ctx.fillText("+" + ball.finalScore, ball.x, ball.y - 14);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [user, todayPlay, settings?.is_open]);

  const dropBall = () => {
    if (ballsLeft <= 0) return;
    ballsRef.current.push({
      x: BOARD_W / 2 + (Math.random() - 0.5) * 30,
      y: 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 0,
      mult: 1,
      trail: [],
      settled: false,
    });
    setBallsLeft((n) => n - 1);
  };

  useEffect(() => {
    // when all dropped balls settle
    if (ballsLeft === 0) {
      const t = setInterval(() => {
        if (ballsRef.current.every((b) => b.settled)) {
          setFinished(true);
          clearInterval(t);
        }
      }, 250);
      return () => clearInterval(t);
    }
  }, [ballsLeft]);

  const saveScore = async () => {
    if (!user || saving) return;
    setSaving(true);
    const { error } = await supabase.from("plinko_plays").insert({
      user_id: user.id,
      user_name: user.name,
      day,
      score: roundScore,
    });
    setSaving(false);
    if (error) {
      if (error.code === "23505") showToast("Você já jogou hoje!");
      else showToast("Erro ao salvar");
      return;
    }
    showToast(`✅ +${roundScore} pts no dia ${day}`);
    loadTodayPlay();
    loadAll();
  };

  // ---------- Render ----------
  const bg = "radial-gradient(ellipse at top, #1a0d3e 0%, #0d0a1e 60%, #06040f 100%)";

  if (!user) {
    return (
      <>
        <Helmet><title>Plinko da Vibe · Entrar</title><meta name="robots" content="noindex,nofollow" /></Helmet>
        <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "Inter, system-ui, sans-serif" }}>
          <form onSubmit={doLogin} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,62,240,0.4)", borderRadius: 18, padding: "2rem", width: "100%", maxWidth: 380, backdropFilter: "blur(12px)" }}>
            <h1 style={{ color: "#f5c518", margin: 0, fontSize: "1.8rem", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" }}>🎯 Plinko da Vibe</h1>
            <p style={{ color: "#c0a8ff", marginTop: ".4rem", marginBottom: "1.5rem", fontSize: ".85rem", textAlign: "center" }}>Competição de 15 dias · Rádio Alta Vibe</p>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Seu nome" maxLength={32}
              style={{ width: "100%", padding: ".8rem 1rem", borderRadius: 10, border: "1px solid rgba(108,62,240,0.4)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "1rem", outline: "none", marginBottom: ".75rem", boxSizing: "border-box" }} />
            <input value={pwInput} onChange={(e) => setPwInput(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Senha (4 dígitos)" inputMode="numeric" maxLength={4}
              style={{ width: "100%", padding: ".8rem 1rem", borderRadius: 10, border: "1px solid rgba(108,62,240,0.4)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "1rem", outline: "none", letterSpacing: 8, textAlign: "center", boxSizing: "border-box" }} />
            <button type="submit" style={{ marginTop: "1rem", width: "100%", padding: ".85rem", background: "linear-gradient(135deg,#6c3ef0,#a06bff)", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 700, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase" }}>Entrar / Criar</button>
            {loginErr && <div style={{ marginTop: ".75rem", color: "#fca5a5", fontSize: ".85rem", textAlign: "center" }}>{loginErr}</div>}
          </form>
        </div>
      </>
    );
  }

  const gameOpen = settings?.is_open ?? true;
  const alreadyPlayed = !!todayPlay;

  return (
    <>
      <Helmet><title>{`Plinko da Vibe · Dia ${day}/15`}</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div style={{ minHeight: "100vh", background: bg, color: "#f5ecff", fontFamily: "Inter, system-ui, sans-serif", padding: "1rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem", marginBottom: "1rem" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#f5c518", letterSpacing: 2 }}>🎯 PLINKO DA VIBE</h1>
              <div style={{ fontSize: ".8rem", color: "#c0a8ff" }}>Dia {day} de 15 · Olá, <b style={{ color: "#fff" }}>{user.name}</b></div>
            </div>
            <button onClick={logout} style={{ padding: ".5rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: ".85rem" }}>Sair</button>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "1rem", alignItems: "start" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(108,62,240,0.3)", borderRadius: 14, padding: "1rem" }}>
              {!gameOpen ? (
                <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem" }}>⏸️</div>
                  <h2 style={{ color: "#f5c518" }}>Jogo pausado</h2>
                  <p style={{ color: "#c0a8ff" }}>Volte em breve!</p>
                </div>
              ) : alreadyPlayed ? (
                <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem" }}>✅</div>
                  <h2 style={{ color: "#f5c518", margin: ".5rem 0" }}>Sua pontuação hoje: {todayPlay!.score} pts</h2>
                  <p style={{ color: "#c0a8ff" }}>Volte amanhã para jogar o Dia {Math.min(15, day + 1)}!</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem", flexWrap: "wrap", gap: ".5rem" }}>
                    <div style={{ display: "flex", gap: "1rem", fontSize: ".9rem" }}>
                      <span>🎱 Bolas restantes: <b style={{ color: "#f5c518" }}>{ballsLeft}</b></span>
                      <span>⭐ Pontuação: <b style={{ color: "#f5c518" }}>{roundScore}</b></span>
                    </div>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                      {!finished ? (
                        <button onClick={dropBall} disabled={ballsLeft <= 0}
                          style={{ padding: ".55rem 1.2rem", background: ballsLeft > 0 ? "linear-gradient(135deg,#6c3ef0,#a06bff)" : "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: 8, cursor: ballsLeft > 0 ? "pointer" : "not-allowed", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: ".85rem" }}>
                          Soltar Bola
                        </button>
                      ) : (
                        <button onClick={saveScore} disabled={saving}
                          style={{ padding: ".55rem 1.2rem", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: ".85rem" }}>
                          {saving ? "Salvando..." : `Salvar ${roundScore} pts`}
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <canvas ref={canvasRef} width={BOARD_W} height={BOARD_H} style={{ maxWidth: "100%", height: "auto", borderRadius: 10, border: "1px solid rgba(108,62,240,0.4)" }} />
                  </div>
                </>
              )}
            </div>

            <aside style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(108,62,240,0.3)", borderRadius: 14, padding: "1rem" }}>
              <h3 style={{ margin: 0, marginBottom: ".75rem", fontSize: ".95rem", color: "#f5c518", letterSpacing: 2, textTransform: "uppercase" }}>🏆 Ranking</h3>
              {ranking.length === 0 ? (
                <div style={{ color: "#c0a8ff", fontSize: ".85rem" }}>Sem jogadas ainda.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: ".35rem", maxHeight: 520, overflowY: "auto" }}>
                  {ranking.map((r, i) => {
                    const me = r.user_id === user.id;
                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
                    return (
                      <div key={r.user_id} style={{ display: "flex", justifyContent: "space-between", padding: ".5rem .7rem", borderRadius: 8, background: me ? "rgba(245,197,24,0.15)" : "rgba(0,0,0,0.2)", border: me ? "1px solid #f5c518" : "1px solid transparent", fontSize: ".85rem" }}>
                        <span><b style={{ color: "#c0a8ff", marginRight: ".4rem" }}>{medal}</b>{r.user_name}</span>
                        <span><b style={{ color: "#f5c518" }}>{r.total}</b> <span style={{ color: "#c0a8ff", fontSize: ".7rem" }}>· {r.days}d</span></span>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>
        </div>

        {toast && (
          <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "#1a0d3e", border: "1px solid #6c3ef0", borderRadius: 50, padding: ".7rem 1.6rem", color: "#fff", fontSize: ".9rem", letterSpacing: 1 }}>{toast}</div>
        )}
      </div>
    </>
  );
};

export default PlinkoBoard;
