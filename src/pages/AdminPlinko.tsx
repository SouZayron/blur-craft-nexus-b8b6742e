import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_PASS = "admin2026";
const LS_AUTH = "plinko_admin_auth";

type User = { id: string; name: string; created_at: string };
type Play = { id: string; user_id: string; user_name: string; day: number; score: number; created_at: string };
type Settings = { is_open: boolean; start_date: string };

const AdminPlinko = () => {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [settings, setSettings] = useState<Settings>({ is_open: true, start_date: "" });
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2400); };

  useEffect(() => {
    if (sessionStorage.getItem(LS_AUTH) === "1") setAuthed(true);
  }, []);

  const load = useCallback(async () => {
    const [u, p, s] = await Promise.all([
      supabase.from("plinko_users").select("*").order("created_at", { ascending: false }),
      supabase.from("plinko_plays").select("*").order("created_at", { ascending: false }),
      supabase.from("plinko_settings").select("is_open,start_date").eq("id", 1).maybeSingle(),
    ]);
    if (u.data) setUsers(u.data as User[]);
    if (p.data) setPlays(p.data as Play[]);
    if (s.data) setSettings(s.data as Settings);
  }, []);

  useEffect(() => {
    if (!authed) return;
    load();
    const ch = supabase
      .channel("admin_plinko_ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "plinko_users" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "plinko_plays" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "plinko_settings" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [authed, load]);

  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem(LS_AUTH, "1");
      setAuthed(true); setPass("");
    } else showToast("Senha incorreta");
  };

  const logout = () => { sessionStorage.removeItem(LS_AUTH); setAuthed(false); };

  const toggleGame = async () => {
    const next = !settings.is_open;
    const { error } = await supabase.from("plinko_settings").update({ is_open: next, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return showToast("Erro");
    showToast(next ? "Game ABERTO" : "Game PAUSADO");
  };

  const updateStart = async (date: string) => {
    const { error } = await supabase.from("plinko_settings").update({ start_date: date, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return showToast("Erro");
    showToast("Data atualizada");
  };

  const resetPlaysOnly = async () => {
    if (!confirm("Apagar TODAS as jogadas (mantém usuários)?")) return;
    const ZERO = "00000000-0000-0000-0000-000000000000";
    const { error } = await supabase.from("plinko_plays").delete().neq("id", ZERO);
    if (error) return showToast("Erro");
    showToast("Jogadas zeradas");
  };

  const resetAll = async () => {
    if (!confirm("Zerar TUDO (usuários + jogadas)? Irreversível.")) return;
    const ZERO = "00000000-0000-0000-0000-000000000000";
    const [p, u] = await Promise.all([
      supabase.from("plinko_plays").delete().neq("id", ZERO),
      supabase.from("plinko_users").delete().neq("id", ZERO),
    ]);
    if (p.error || u.error) return showToast("Erro");
    showToast("Tudo zerado!");
  };

  const deleteUser = async (u: User) => {
    if (!confirm(`Excluir ${u.name} e todas as suas jogadas?`)) return;
    const { error } = await supabase.from("plinko_users").delete().eq("id", u.id);
    if (error) return showToast("Erro");
    showToast(`${u.name} excluído`);
  };

  const exportCSV = () => {
    const header = "rank,nome,total,dias_jogados\n";
    const agg = new Map<string, { name: string; total: number; days: number }>();
    for (const p of plays) {
      const cur = agg.get(p.user_id) || { name: p.user_name, total: 0, days: 0 };
      cur.total += p.score; cur.days += 1;
      agg.set(p.user_id, cur);
    }
    const sorted = [...agg.values()].sort((a, b) => b.total - a.total);
    const rows = sorted.map((r, i) => `${i + 1},"${r.name.replace(/"/g, '""')}",${r.total},${r.days}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `plinko_ranking_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compute ranking
  const ranking = (() => {
    const agg = new Map<string, { user_id: string; name: string; total: number; days: number }>();
    for (const p of plays) {
      const cur = agg.get(p.user_id) || { user_id: p.user_id, name: p.user_name, total: 0, days: 0 };
      cur.total += p.score; cur.days += 1;
      agg.set(p.user_id, cur);
    }
    return [...agg.values()].sort((a, b) => b.total - a.total);
  })();

  const bg = "radial-gradient(ellipse at top, #1a0d3e 0%, #0d0a1e 60%, #06040f 100%)";

  if (!authed) {
    return (
      <>
        <Helmet><title>Admin · Plinko</title><meta name="robots" content="noindex,nofollow" /></Helmet>
        <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "Inter, system-ui, sans-serif" }}>
          <form onSubmit={tryLogin} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,62,240,0.4)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 360 }}>
            <h1 style={{ color: "#f5c518", margin: 0, marginBottom: ".25rem", fontSize: "1.5rem", letterSpacing: 3, textTransform: "uppercase" }}>Admin Plinko</h1>
            <p style={{ color: "#c0a8ff", marginTop: 0, fontSize: ".85rem" }}>Painel restrito</p>
            <input type="password" autoFocus placeholder="Senha" value={pass} onChange={(e) => setPass(e.target.value)}
              style={{ width: "100%", padding: ".75rem 1rem", borderRadius: 10, border: "1px solid rgba(108,62,240,0.4)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "1rem", outline: "none", marginTop: "1rem", boxSizing: "border-box" }} />
            <button type="submit" style={{ marginTop: "1rem", width: "100%", padding: ".75rem", background: "linear-gradient(135deg,#6c3ef0,#a06bff)", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 700, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase" }}>Entrar</button>
            {toast && <div style={{ marginTop: "1rem", color: "#ffb4b4", fontSize: ".85rem", textAlign: "center" }}>{toast}</div>}
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Admin · Plinko</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div style={{ minHeight: "100vh", background: bg, color: "#f5ecff", fontFamily: "Inter, system-ui, sans-serif", padding: "1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".5rem" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.6rem", letterSpacing: 3, textTransform: "uppercase", color: "#f5c518" }}>Admin Plinko</h1>
              <p style={{ margin: 0, color: "#c0a8ff", fontSize: ".85rem" }}>{users.length} usuários · {plays.length} jogadas</p>
            </div>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <a href="/plinkoboard" style={{ padding: ".55rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: ".85rem" }}>Ver jogo</a>
              <button onClick={logout} style={{ padding: ".55rem 1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: ".85rem" }}>Sair</button>
            </div>
          </header>

          {/* Controls */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,62,240,0.3)", borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: ".75rem", color: "#c0a8ff", letterSpacing: 2, textTransform: "uppercase" }}>Status</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: settings.is_open ? "#86efac" : "#fca5a5", marginTop: ".3rem" }}>
                {settings.is_open ? "● ABERTO" : "● PAUSADO"}
              </div>
              <button onClick={toggleGame} style={{ marginTop: ".75rem", width: "100%", padding: ".6rem", background: settings.is_open ? "linear-gradient(135deg,#b91c1c,#ef4444)" : "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: ".85rem" }}>
                {settings.is_open ? "Pausar Jogo" : "Abrir Jogo"}
              </button>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,62,240,0.3)", borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: ".75rem", color: "#c0a8ff", letterSpacing: 2, textTransform: "uppercase" }}>Início (Dia 1)</div>
              <input type="date" value={settings.start_date || ""} onChange={(e) => setSettings((s) => ({ ...s, start_date: e.target.value }))} onBlur={(e) => updateStart(e.target.value)}
                style={{ marginTop: ".5rem", width: "100%", padding: ".55rem", borderRadius: 8, border: "1px solid rgba(108,62,240,0.4)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: ".9rem", boxSizing: "border-box" }} />
              <div style={{ marginTop: ".4rem", color: "#c0a8ff", fontSize: ".75rem" }}>Salva ao sair do campo</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,62,240,0.3)", borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: ".75rem", color: "#c0a8ff", letterSpacing: 2, textTransform: "uppercase" }}>Resetar Jogadas</div>
              <div style={{ fontSize: ".8rem", color: "#c0a8ff", marginTop: ".3rem" }}>Apaga jogadas, mantém usuários.</div>
              <button onClick={resetPlaysOnly} style={{ marginTop: ".75rem", width: "100%", padding: ".6rem", background: "linear-gradient(135deg,#7c2d12,#ea580c)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: ".85rem" }}>Zerar Jogadas</button>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,62,240,0.3)", borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: ".75rem", color: "#c0a8ff", letterSpacing: 2, textTransform: "uppercase" }}>Reset Total</div>
              <div style={{ fontSize: ".8rem", color: "#c0a8ff", marginTop: ".3rem" }}>Apaga tudo (usuários + jogadas).</div>
              <button onClick={resetAll} style={{ marginTop: ".75rem", width: "100%", padding: ".6rem", background: "linear-gradient(135deg,#b91c1c,#ef4444)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: ".85rem" }}>Zerar Tudo</button>
            </div>
          </section>

          {/* Report */}
          <section style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,62,240,0.3)", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem", overflowX: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem", flexWrap: "wrap", gap: ".5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1rem", letterSpacing: 2, textTransform: "uppercase", color: "#f5c518" }}>🏆 Relatório · Ranking</h2>
              <button onClick={exportCSV} style={{ padding: ".5rem 1rem", background: "linear-gradient(135deg,#6c3ef0,#a06bff)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontSize: ".8rem" }}>Exportar CSV</button>
            </div>
            {ranking.length === 0 ? (
              <div style={{ color: "#c0a8ff", padding: "1rem", textAlign: "center" }}>Sem jogadas.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem" }}>
                <thead>
                  <tr style={{ color: "#c0a8ff", textTransform: "uppercase", fontSize: ".7rem", letterSpacing: 1.5 }}>
                    <th style={{ textAlign: "left", padding: ".5rem" }}>#</th>
                    <th style={{ textAlign: "left", padding: ".5rem" }}>Nome</th>
                    <th style={{ textAlign: "right", padding: ".5rem" }}>Total</th>
                    <th style={{ textAlign: "right", padding: ".5rem" }}>Dias</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r, i) => (
                    <tr key={r.user_id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={{ padding: ".55rem", color: "#c0a8ff" }}>{i + 1}</td>
                      <td style={{ padding: ".55rem", fontWeight: 600 }}>{r.name}</td>
                      <td style={{ padding: ".55rem", textAlign: "right", color: "#f5c518", fontWeight: 700 }}>{r.total}</td>
                      <td style={{ padding: ".55rem", textAlign: "right" }}>{r.days}/15</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Users */}
          <section style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,62,240,0.3)", borderRadius: 12, padding: "1rem", overflowX: "auto" }}>
            <h2 style={{ margin: 0, marginBottom: ".75rem", fontSize: "1rem", letterSpacing: 2, textTransform: "uppercase", color: "#f5c518" }}>👤 Usuários</h2>
            {users.length === 0 ? (
              <div style={{ color: "#c0a8ff", padding: "1rem", textAlign: "center" }}>Nenhum cadastro.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem" }}>
                <thead>
                  <tr style={{ color: "#c0a8ff", textTransform: "uppercase", fontSize: ".7rem", letterSpacing: 1.5 }}>
                    <th style={{ textAlign: "left", padding: ".5rem" }}>#</th>
                    <th style={{ textAlign: "left", padding: ".5rem" }}>Nome</th>
                    <th style={{ textAlign: "right", padding: ".5rem" }}>Cadastro</th>
                    <th style={{ textAlign: "right", padding: ".5rem" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={{ padding: ".55rem", color: "#c0a8ff" }}>{i + 1}</td>
                      <td style={{ padding: ".55rem", fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: ".55rem", textAlign: "right", color: "#c0a8ff" }}>{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: ".55rem", textAlign: "right" }}>
                        <button onClick={() => deleteUser(u)} style={{ padding: ".35rem .7rem", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", borderRadius: 6, cursor: "pointer", fontSize: ".8rem" }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
        {toast && (
          <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "#1a0d3e", border: "1px solid #6c3ef0", borderRadius: 50, padding: ".6rem 1.6rem", color: "#fff", fontSize: ".9rem", letterSpacing: 1.5 }}>{toast}</div>
        )}
      </div>
    </>
  );
};

export default AdminPlinko;
