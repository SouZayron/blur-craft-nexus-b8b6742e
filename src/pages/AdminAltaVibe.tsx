import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_PASS = "7845";
const LS_AUTH = "altavibe_admin_auth";

type User = {
  id: string;
  name: string;
  coins: number;
  streak: number;
  last_spin: string | null;
  blocked_segments: string[] | null;
};

type Segment = {
  id: string;
  label: string;
  points: number;
  weight: number;
  color: string;
  text_color: string;
  position: number;
};

type StreakRule = { id: string; days: number; bonus_pct: number };

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "1rem",
};
const inp: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  padding: ".4rem .6rem",
  color: "#f5ecff",
  fontSize: ".85rem",
  outline: "none",
  width: "100%",
};
const btn = (bg: string): React.CSSProperties => ({
  padding: ".45rem .8rem",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: ".8rem",
  letterSpacing: 1,
  textTransform: "uppercase",
});
const smallBtn = (color: string, bg: string): React.CSSProperties => ({
  padding: ".3rem .55rem",
  background: bg,
  border: `1px solid ${color}55`,
  color,
  borderRadius: 6,
  cursor: "pointer",
  fontSize: ".75rem",
});
const label: React.CSSProperties = { fontSize: ".65rem", color: "#bca8d9", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 2 };
const th: React.CSSProperties = { textAlign: "left", padding: ".5rem", color: "#bca8d9", fontSize: ".68rem", letterSpacing: 1.5, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: ".5rem", fontSize: ".85rem" };

const AdminAltaVibe = () => {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [streaks, setStreaks] = useState<StreakRule[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [signupsLocked, setSignupsLocked] = useState(false);
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [toast, setToast] = useState("");
  const [blockingUser, setBlockingUser] = useState<User | null>(null);

  const [newSeg, setNewSeg] = useState({ label: "", points: 0, weight: 1, color: "#8b3fbf" });
  const [newStreak, setNewStreak] = useState({ days: 3, bonus_pct: -20 });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  useEffect(() => {
    if (sessionStorage.getItem(LS_AUTH) === "1") setAuthed(true);
  }, []);

  const load = useCallback(async () => {
    const [u, s, seg, st] = await Promise.all([
      supabase.from("altavibe_users").select("id,name,coins,streak,last_spin,blocked_segments").order("coins", { ascending: true }),
      supabase.from("altavibe_settings").select("is_open,signups_locked,start_date,end_date").eq("id", 1).maybeSingle(),
      supabase.from("altavibe_segments").select("*").order("position"),
      supabase.from("altavibe_streak_rules").select("*").order("days"),
    ]);
    if (u.data) setUsers(u.data as User[]);
    if (s.data) {
      const d = s.data as { is_open: boolean; signups_locked: boolean; start_date: string; end_date: string };
      setIsOpen(!!d.is_open);
      setSignupsLocked(!!d.signups_locked);
      setStartDate(d.start_date);
      setEndDate(d.end_date);
    }
    if (seg.data) setSegments(seg.data as Segment[]);
    if (st.data) setStreaks(st.data as StreakRule[]);
  }, []);

  useEffect(() => {
    if (!authed) return;
    load();
    const ch = supabase
      .channel("admin_altavibe_ch_v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_users" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_settings" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_segments" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_streak_rules" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [authed, load]);

  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem(LS_AUTH, "1");
      setAuthed(true);
      setPass("");
    } else showToast("Senha incorreta");
  };

  const updateSettings = async (patch: Record<string, unknown>, msg: string) => {
    const { error } = await supabase.from("altavibe_settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) { showToast("Erro ao atualizar"); return; }
    showToast(msg);
    load();
  };

  // ---- Segments ----
  const addSegment = async () => {
    if (!newSeg.label.trim()) { showToast("Coloque um rótulo"); return; }
    const { error } = await supabase.from("altavibe_segments").insert({
      label: newSeg.label.trim(),
      points: Number(newSeg.points),
      weight: Number(newSeg.weight),
      color: newSeg.color,
      position: segments.length,
    });
    if (error) { showToast("Erro ao criar fatia"); return; }
    setNewSeg({ label: "", points: 0, weight: 1, color: "#8b3fbf" });
    showToast("Fatia criada");
    load();
  };

  const patchSegment = async (id: string, patch: Partial<Segment>) => {
    const { error } = await supabase.from("altavibe_segments").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) showToast("Erro ao salvar");
    else load();
  };

  const deleteSegment = async (s: Segment) => {
    if (!confirm(`Excluir a fatia "${s.label}"?`)) return;
    const { error } = await supabase.from("altavibe_segments").delete().eq("id", s.id);
    if (error) { showToast("Erro ao excluir"); return; }
    showToast("Fatia excluída");
    load();
  };

  // ---- Streaks ----
  const addStreak = async () => {
    const { error } = await supabase.from("altavibe_streak_rules").insert({ days: Number(newStreak.days), bonus_pct: Number(newStreak.bonus_pct) });
    if (error) { showToast("Erro ao criar streak"); return; }
    showToast("Streak criada");
    load();
  };

  const patchStreak = async (id: string, patch: Partial<StreakRule>) => {
    const { error } = await supabase.from("altavibe_streak_rules").update(patch).eq("id", id);
    if (error) showToast("Erro ao salvar"); else load();
  };

  const deleteStreak = async (id: string) => {
    const { error } = await supabase.from("altavibe_streak_rules").delete().eq("id", id);
    if (error) showToast("Erro ao excluir"); else { showToast("Streak removida"); load(); }
  };

  // ---- Users ----
  const setUserCoins = async (u: User, coins: number) => {
    const { error } = await supabase.from("altavibe_users").update({ coins, updated_at: new Date().toISOString() }).eq("id", u.id);
    if (error) showToast("Erro ao salvar pontos"); else { showToast(`${u.name}: ${coins} pts`); load(); }
  };

  const editPoints = (u: User) => {
    const val = prompt(`Novos pontos de ${u.name}:`, String(u.coins ?? 0));
    if (val === null) return;
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) { showToast("Valor inválido"); return; }
    setUserCoins(u, n);
  };

  const deleteUser = async (u: User) => {
    if (!confirm(`Excluir ${u.name}?`)) return;
    const { error } = await supabase.from("altavibe_users").delete().eq("id", u.id);
    if (error) showToast("Erro ao excluir"); else { showToast(`${u.name} excluído`); load(); }
  };

  const toggleBlock = async (u: User, segId: string) => {
    const curr = u.blocked_segments || [];
    const next = curr.includes(segId) ? curr.filter((x) => x !== segId) : [...curr, segId];
    const { error } = await supabase.from("altavibe_users").update({ blocked_segments: next, updated_at: new Date().toISOString() }).eq("id", u.id);
    if (error) { showToast("Erro ao bloquear"); return; }
    setBlockingUser({ ...u, blocked_segments: next });
    load();
  };

  const resetAll = async () => {
    if (!confirm("Zerar TODOS os pontos, cadastros e logs? Irreversível.")) return;
    const ZERO = "00000000-0000-0000-0000-000000000000";
    const [l, us] = await Promise.all([
      supabase.from("altavibe_logs").delete().neq("id", ZERO),
      supabase.from("altavibe_users").delete().neq("id", ZERO),
    ]);
    if (l.error || us.error) { showToast("Erro ao zerar"); return; }
    showToast("Game zerado!");
    load();
  };

  const zeroAllPoints = async () => {
    if (!confirm("Zerar apenas os pontos de todos (mantendo cadastros)?")) return;
    const ZERO = "00000000-0000-0000-0000-000000000000";
    const { error } = await supabase.from("altavibe_users").update({ coins: 0, streak: 0, updated_at: new Date().toISOString() }).neq("id", ZERO);
    if (error) { showToast("Erro ao zerar pontos"); return; }
    showToast("Pontos zerados");
    load();
  };

  const clearLogs = async () => {
    if (!confirm("Limpar todos os logs?")) return;
    const { error } = await supabase.from("altavibe_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) showToast("Erro ao limpar logs"); else showToast("Logs limpos!");
  };

  if (!authed) {
    return (
      <>
        <Helmet>
          <title>Admin · Alta Vibe</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at top,#3a1857 0%,#1a0d2e 50%,#0f0820 100%)", fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
          <form onSubmit={tryLogin} style={{ ...card, width: "100%", maxWidth: 360, backdropFilter: "blur(12px)" }}>
            <h1 style={{ color: "#f5ecff", margin: 0, fontSize: "1.5rem", letterSpacing: 3, textTransform: "uppercase" }}>Admin</h1>
            <p style={{ color: "#bca8d9", marginTop: 4, fontSize: ".85rem" }}>Alta Vibe · Painel restrito</p>
            <input type="password" autoFocus placeholder="Senha" value={pass} onChange={(e) => setPass(e.target.value)} style={{ ...inp, marginTop: "1rem", padding: ".7rem 1rem", fontSize: "1rem" }} />
            <button type="submit" style={{ ...btn("linear-gradient(135deg,#8b3fbf,#c47ad9)"), marginTop: "1rem", width: "100%", padding: ".7rem" }}>Entrar</button>
            {toast && <div style={{ marginTop: "1rem", color: "#ffb4b4", fontSize: ".85rem", textAlign: "center" }}>{toast}</div>}
          </form>
        </div>
      </>
    );
  }

  const totalWeight = segments.reduce((a, s) => a + (Number(s.weight) > 0 ? Number(s.weight) : 0), 0);

  return (
    <>
      <Helmet>
        <title>Admin · Alta Vibe</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top,#3a1857 0%,#1a0d2e 50%,#0f0820 100%)", color: "#f5ecff", fontFamily: "system-ui, sans-serif", padding: "1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.6rem", letterSpacing: 3, textTransform: "uppercase" }}>Admin Alta Vibe</h1>
              <p style={{ margin: 0, color: "#bca8d9", fontSize: ".85rem" }}>Temporada invertida · {users.length} cadastros</p>
            </div>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <a href="/altavibe" style={{ ...btn("rgba(255,255,255,0.08)"), textDecoration: "none", display: "inline-block" }}>Ver página</a>
              <button onClick={() => { sessionStorage.removeItem(LS_AUTH); setAuthed(false); }} style={btn("transparent")}>Sair</button>
            </div>
          </header>

          {/* CONTROLES */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "1rem" }}>
            <div style={card}>
              <div style={label}>Status do Game</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: isOpen ? "#86efac" : "#fca5a5" }}>{isOpen ? "● ABERTO" : "● FECHADO"}</div>
              <button onClick={() => updateSettings({ is_open: !isOpen }, !isOpen ? "Game ABERTO" : "Game FECHADO")} style={{ ...btn(isOpen ? "linear-gradient(135deg,#b91c1c,#ef4444)" : "linear-gradient(135deg,#15803d,#22c55e)"), marginTop: ".7rem", width: "100%" }}>
                {isOpen ? "Fechar Game" : "Abrir Game"}
              </button>
            </div>
            <div style={card}>
              <div style={label}>Cadastros</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: signupsLocked ? "#fca5a5" : "#86efac" }}>{signupsLocked ? "● TRANCADO" : "● ABERTO"}</div>
              <button onClick={() => updateSettings({ signups_locked: !signupsLocked }, !signupsLocked ? "Cadastros TRANCADOS" : "Cadastros LIBERADOS")} style={{ ...btn(signupsLocked ? "linear-gradient(135deg,#15803d,#22c55e)" : "linear-gradient(135deg,#b91c1c,#ef4444)"), marginTop: ".7rem", width: "100%" }}>
                {signupsLocked ? "Liberar Cadastros" : "Trancar Cadastros"}
              </button>
            </div>
            <div style={card}>
              <div style={label}>Período do game</div>
              <div style={{ display: "flex", gap: ".4rem", marginTop: ".3rem" }}>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inp} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inp} />
              </div>
              <button onClick={() => updateSettings({ start_date: startDate, end_date: endDate }, "Período salvo")} style={{ ...btn("linear-gradient(135deg,#8b3fbf,#c47ad9)"), marginTop: ".6rem", width: "100%" }}>Salvar período</button>
            </div>
            <div style={card}>
              <div style={label}>Manutenção</div>
              <div style={{ display: "flex", flexDirection: "column", gap: ".4rem", marginTop: ".4rem" }}>
                <button onClick={zeroAllPoints} style={btn("linear-gradient(135deg,#7c2d12,#ea580c)")}>Zerar pontos de todos</button>
                <button onClick={clearLogs} style={btn("linear-gradient(135deg,#7c2d12,#ea580c)")}>Limpar logs</button>
                <button onClick={resetAll} style={btn("linear-gradient(135deg,#b91c1c,#ef4444)")}>Reset total</button>
              </div>
            </div>
          </section>

          {/* FATIAS */}
          <section style={card}>
            <h2 style={{ margin: 0, marginBottom: ".7rem", fontSize: "1rem", letterSpacing: 2, textTransform: "uppercase", color: "#d99ee6" }}>🎯 Fatias da roleta (pontos &amp; pesos)</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Rótulo</th>
                    <th style={th}>Pontos</th>
                    <th style={th}>Peso</th>
                    <th style={th}>Chance</th>
                    <th style={th}>Cor</th>
                    <th style={{ ...th, textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((s) => (
                    <tr key={s.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={td}><input style={inp} defaultValue={s.label} onBlur={(e) => e.target.value !== s.label && patchSegment(s.id, { label: e.target.value })} /></td>
                      <td style={{ ...td, width: 110 }}><input style={inp} type="number" defaultValue={s.points} onBlur={(e) => Number(e.target.value) !== s.points && patchSegment(s.id, { points: Number(e.target.value) })} /></td>
                      <td style={{ ...td, width: 100 }}><input style={inp} type="number" step="0.1" defaultValue={s.weight} onBlur={(e) => Number(e.target.value) !== Number(s.weight) && patchSegment(s.id, { weight: Number(e.target.value) })} /></td>
                      <td style={{ ...td, color: "#ffd700", fontWeight: 700 }}>{totalWeight ? ((Number(s.weight) / totalWeight) * 100).toFixed(1) : "0"}%</td>
                      <td style={{ ...td, width: 70 }}><input type="color" defaultValue={s.color} onBlur={(e) => e.target.value !== s.color && patchSegment(s.id, { color: e.target.value })} style={{ width: 44, height: 28, background: "transparent", border: "none", cursor: "pointer" }} /></td>
                      <td style={{ ...td, textAlign: "right" }}><button onClick={() => deleteSegment(s)} style={smallBtn("#fca5a5", "rgba(239,68,68,0.15)")}>Excluir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "end", marginTop: ".8rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 120 }}><span style={label}>Rótulo</span><input style={inp} value={newSeg.label} onChange={(e) => setNewSeg({ ...newSeg, label: e.target.value })} placeholder="Ex: -50" /></div>
              <div style={{ width: 110 }}><span style={label}>Pontos</span><input style={inp} type="number" value={newSeg.points} onChange={(e) => setNewSeg({ ...newSeg, points: Number(e.target.value) })} /></div>
              <div style={{ width: 100 }}><span style={label}>Peso</span><input style={inp} type="number" step="0.1" value={newSeg.weight} onChange={(e) => setNewSeg({ ...newSeg, weight: Number(e.target.value) })} /></div>
              <div style={{ width: 70 }}><span style={label}>Cor</span><input type="color" value={newSeg.color} onChange={(e) => setNewSeg({ ...newSeg, color: e.target.value })} style={{ width: 44, height: 30, background: "transparent", border: "none", cursor: "pointer" }} /></div>
              <button onClick={addSegment} style={btn("linear-gradient(135deg,#15803d,#22c55e)")}>+ Adicionar fatia</button>
            </div>
            <p style={{ color: "#bca8d9", fontSize: ".75rem", marginBottom: 0 }}>Pontos negativos são bons no ranking invertido. Peso 0 remove a fatia do sorteio (mas ela continua visível na roleta).</p>
          </section>

          {/* STREAKS */}
          <section style={card}>
            <h2 style={{ margin: 0, marginBottom: ".7rem", fontSize: "1rem", letterSpacing: 2, textTransform: "uppercase", color: "#d99ee6" }}>🔥 Regras de Streak</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: 520 }}>
              <thead><tr><th style={th}>Dias seguidos</th><th style={th}>Bônus %</th><th style={{ ...th, textAlign: "right" }}>Ações</th></tr></thead>
              <tbody>
                {streaks.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ ...td, width: 140 }}><input style={inp} type="number" defaultValue={r.days} onBlur={(e) => Number(e.target.value) !== r.days && patchStreak(r.id, { days: Number(e.target.value) })} /></td>
                    <td style={{ ...td, width: 140 }}><input style={inp} type="number" defaultValue={r.bonus_pct} onBlur={(e) => Number(e.target.value) !== Number(r.bonus_pct) && patchStreak(r.id, { bonus_pct: Number(e.target.value) })} /></td>
                    <td style={{ ...td, textAlign: "right" }}><button onClick={() => deleteStreak(r.id)} style={smallBtn("#fca5a5", "rgba(239,68,68,0.15)")}>Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "end", marginTop: ".7rem" }}>
              <div style={{ width: 140 }}><span style={label}>Dias</span><input style={inp} type="number" value={newStreak.days} onChange={(e) => setNewStreak({ ...newStreak, days: Number(e.target.value) })} /></div>
              <div style={{ width: 140 }}><span style={label}>Bônus %</span><input style={inp} type="number" value={newStreak.bonus_pct} onChange={(e) => setNewStreak({ ...newStreak, bonus_pct: Number(e.target.value) })} /></div>
              <button onClick={addStreak} style={btn("linear-gradient(135deg,#15803d,#22c55e)")}>+ Adicionar</button>
            </div>
            <p style={{ color: "#bca8d9", fontSize: ".75rem", marginBottom: 0 }}>Use percentual negativo (ex: -20) para reduzir os pontos do giro — vantagem no ranking invertido.</p>
          </section>

          {/* USERS */}
          <section style={{ ...card, overflowX: "auto" }}>
            <h2 style={{ margin: 0, marginBottom: ".7rem", fontSize: "1rem", letterSpacing: 2, textTransform: "uppercase", color: "#d99ee6" }}>👥 Participantes (ranking invertido)</h2>
            {users.length === 0 ? (
              <div style={{ color: "#bca8d9", padding: "1.5rem", textAlign: "center" }}>Nenhum cadastro.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>#</th>
                    <th style={th}>Nome</th>
                    <th style={{ ...th, textAlign: "right" }}>Pontos</th>
                    <th style={{ ...th, textAlign: "right" }}>Streak</th>
                    <th style={{ ...th, textAlign: "right" }}>Último giro</th>
                    <th style={{ ...th, textAlign: "right" }}>Bloqueios</th>
                    <th style={{ ...th, textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={{ ...td, color: "#bca8d9" }}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{u.name}</td>
                      <td style={{ ...td, textAlign: "right", color: "#7dffb8", fontWeight: 700 }}>{(u.coins || 0).toLocaleString("pt-BR")}</td>
                      <td style={{ ...td, textAlign: "right" }}>{u.streak || 0}🔥</td>
                      <td style={{ ...td, textAlign: "right", color: "#bca8d9" }}>{u.last_spin || "—"}</td>
                      <td style={{ ...td, textAlign: "right", color: (u.blocked_segments?.length || 0) > 0 ? "#ffd700" : "#bca8d9" }}>{u.blocked_segments?.length || 0}</td>
                      <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap", display: "flex", gap: ".3rem", justifyContent: "flex-end" }}>
                        <button onClick={() => editPoints(u)} style={smallBtn("#d99ee6", "rgba(196,122,217,0.15)")}>Editar</button>
                        <button onClick={() => setUserCoins(u, 0)} style={smallBtn("#fbbf24", "rgba(251,191,36,0.12)")}>Zerar</button>
                        <button onClick={() => setBlockingUser(u)} style={smallBtn("#93c5fd", "rgba(59,130,246,0.15)")}>Bloquear</button>
                        <button onClick={() => deleteUser(u)} style={smallBtn("#fca5a5", "rgba(239,68,68,0.15)")}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        {blockingUser && (
          <div onClick={() => setBlockingUser(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,8,32,.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ ...card, width: "100%", maxWidth: 460 }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#d99ee6" }}>Bloquear pontuações · {blockingUser.name}</h3>
              <p style={{ color: "#bca8d9", fontSize: ".78rem" }}>As fatias marcadas nunca serão sorteadas para este jogador (invisível para ele).</p>
              <div style={{ display: "flex", flexDirection: "column", gap: ".35rem", maxHeight: 300, overflowY: "auto" }}>
                {segments.map((s) => {
                  const blocked = (blockingUser.blocked_segments || []).includes(s.id);
                  return (
                    <label key={s.id} style={{ display: "flex", alignItems: "center", gap: ".55rem", padding: ".4rem .6rem", borderRadius: 8, background: blocked ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${blocked ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.08)"}`, cursor: "pointer" }}>
                      <input type="checkbox" checked={blocked} onChange={() => toggleBlock(blockingUser, s.id)} style={{ width: 16, height: 16, accentColor: "#ef4444" }} />
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: s.color, display: "inline-block" }} />
                      <span style={{ fontSize: ".88rem" }}>{s.label} ({s.points} pts)</span>
                    </label>
                  );
                })}
              </div>
              <button onClick={() => setBlockingUser(null)} style={{ ...btn("linear-gradient(135deg,#8b3fbf,#c47ad9)"), width: "100%", marginTop: ".8rem" }}>Fechar</button>
            </div>
          </div>
        )}

        {toast && (
          <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "#3a1857", border: "1px solid #c47ad9", borderRadius: 50, padding: ".6rem 1.6rem", color: "#f5ecff", fontSize: ".9rem", letterSpacing: 1.5, textTransform: "uppercase", zIndex: 300 }}>{toast}</div>
        )}
      </div>
    </>
  );
};

export default AdminAltaVibe;
