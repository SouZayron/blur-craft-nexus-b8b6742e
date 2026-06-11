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
  created_at?: string;
};

const AdminAltaVibe = () => {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [signupsLocked, setSignupsLocked] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  useEffect(() => {
    if (sessionStorage.getItem(LS_AUTH) === "1") setAuthed(true);
  }, []);

  const load = useCallback(async () => {
    const [u, s] = await Promise.all([
      supabase.from("altavibe_users").select("*").order("coins", { ascending: false }),
      supabase.from("altavibe_settings").select("is_open,signups_locked").eq("id", 1).maybeSingle(),
    ]);
    if (u.data) setUsers(u.data as User[]);
    if (s.data) {
      setIsOpen(!!s.data.is_open);
      setSignupsLocked(!!(s.data as { signups_locked?: boolean }).signups_locked);
    }
  }, []);

  const toggleSignups = async () => {
    const next = !signupsLocked;
    const { error } = await supabase.from("altavibe_settings").update({ signups_locked: next, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) { showToast("Erro ao atualizar"); return; }
    setSignupsLocked(next);
    showToast(next ? "Cadastros TRANCADOS" : "Cadastros LIBERADOS");
  };

  useEffect(() => {
    if (!authed) return;
    load();
    const ch = supabase
      .channel("admin_altavibe_ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_users" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_settings" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [authed, load]);

  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem(LS_AUTH, "1");
      setAuthed(true);
      setPass("");
    } else {
      showToast("Senha incorreta");
    }
  };

  const logout = () => {
    sessionStorage.removeItem(LS_AUTH);
    setAuthed(false);
  };

  const toggleGame = async () => {
    const next = !isOpen;
    const { error } = await supabase.from("altavibe_settings").update({ is_open: next, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) { showToast("Erro ao atualizar"); return; }
    setIsOpen(next);
    showToast(next ? "Game ABERTO" : "Game FECHADO");
  };

  const resetAll = async () => {
    if (!confirm("Zerar TODOS os pontos, cadastros e logs? Esta ação é irreversível.")) return;
    const ZERO = "00000000-0000-0000-0000-000000000000";
    const [logsRes, usersRes] = await Promise.all([
      supabase.from("altavibe_logs").delete().neq("id", ZERO),
      supabase.from("altavibe_users").delete().neq("id", ZERO),
    ]);
    if (logsRes.error || usersRes.error) { showToast("Erro ao zerar"); return; }
    showToast("Game zerado!");
    load();
  };

  const clearLogs = async () => {
    if (!confirm("Limpar todos os logs?")) return;
    const { error } = await supabase.from("altavibe_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) { showToast("Erro ao limpar logs"); return; }
    showToast("Logs limpos!");
  };

  const deleteUser = async (u: User) => {
    if (!confirm(`Excluir ${u.name}?`)) return;
    const { error } = await supabase.from("altavibe_users").delete().eq("id", u.id);
    if (error) { showToast("Erro ao excluir"); return; }
    showToast(`${u.name} excluído`);
  };

  if (!authed) {
    return (
      <>
        <Helmet>
          <title>Admin · Alta Vibe</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at top,#3a1857 0%,#1a0d2e 50%,#0f0820 100%)", fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
          <form onSubmit={tryLogin} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 360, backdropFilter: "blur(12px)" }}>
            <h1 style={{ color: "#f5ecff", margin: 0, marginBottom: ".25rem", fontSize: "1.5rem", letterSpacing: 3, textTransform: "uppercase" }}>Admin</h1>
            <p style={{ color: "#bca8d9", marginTop: 0, fontSize: ".85rem" }}>Alta Vibe · Painel restrito</p>
            <input
              type="password"
              autoFocus
              placeholder="Senha"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              style={{ width: "100%", padding: ".75rem 1rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "1rem", outline: "none", marginTop: "1rem" }}
            />
            <button type="submit" style={{ marginTop: "1rem", width: "100%", padding: ".75rem", background: "linear-gradient(135deg,#8b3fbf,#c47ad9)", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase" }}>Entrar</button>
            {toast && <div style={{ marginTop: "1rem", color: "#ffb4b4", fontSize: ".85rem", textAlign: "center" }}>{toast}</div>}
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin · Alta Vibe</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top,#3a1857 0%,#1a0d2e 50%,#0f0820 100%)", color: "#f5ecff", fontFamily: "system-ui, sans-serif", padding: "1.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".5rem" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.6rem", letterSpacing: 3, textTransform: "uppercase" }}>Admin Alta Vibe</h1>
              <p style={{ margin: 0, color: "#bca8d9", fontSize: ".85rem" }}>Total: {users.length} cadastros</p>
            </div>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <a href="/altavibe" style={{ padding: ".55rem 1rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#f5ecff", textDecoration: "none", fontSize: ".85rem" }}>Ver página</a>
              <button onClick={logout} style={{ padding: ".55rem 1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#f5ecff", cursor: "pointer", fontSize: ".85rem" }}>Sair</button>
            </div>
          </header>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: ".75rem", color: "#bca8d9", letterSpacing: 2, textTransform: "uppercase" }}>Status do Game</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: isOpen ? "#86efac" : "#fca5a5", marginTop: ".3rem" }}>
                {isOpen ? "● ABERTO" : "● FECHADO"}
              </div>
              <button onClick={toggleGame} style={{ marginTop: ".75rem", width: "100%", padding: ".6rem", background: isOpen ? "linear-gradient(135deg,#b91c1c,#ef4444)" : "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontSize: ".85rem" }}>
                {isOpen ? "Fechar Game" : "Abrir Game"}
              </button>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: ".75rem", color: "#bca8d9", letterSpacing: 2, textTransform: "uppercase" }}>Reset Total</div>
              <div style={{ fontSize: ".82rem", color: "#bca8d9", marginTop: ".3rem" }}>Exclui cadastros, pontos e logs.</div>
              <button onClick={resetAll} style={{ marginTop: ".75rem", width: "100%", padding: ".6rem", background: "linear-gradient(135deg,#b91c1c,#ef4444)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontSize: ".85rem" }}>
                Zerar Tudo
              </button>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: ".75rem", color: "#bca8d9", letterSpacing: 2, textTransform: "uppercase" }}>Logs</div>
              <div style={{ fontSize: ".82rem", color: "#bca8d9", marginTop: ".3rem" }}>Limpa apenas o histórico de giros.</div>
              <button onClick={clearLogs} style={{ marginTop: ".75rem", width: "100%", padding: ".6rem", background: "linear-gradient(135deg,#7c2d12,#ea580c)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontSize: ".85rem" }}>
                Limpar Logs
              </button>
            </div>
          </section>

          <section style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "1rem", overflowX: "auto" }}>
            <h2 style={{ margin: 0, marginBottom: ".75rem", fontSize: "1rem", letterSpacing: 2, textTransform: "uppercase", color: "#d99ee6" }}>Cadastros</h2>
            {users.length === 0 ? (
              <div style={{ color: "#bca8d9", padding: "1.5rem", textAlign: "center" }}>Nenhum cadastro.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem" }}>
                <thead>
                  <tr style={{ color: "#bca8d9", textTransform: "uppercase", fontSize: ".7rem", letterSpacing: 1.5 }}>
                    <th style={{ textAlign: "left", padding: ".5rem" }}>#</th>
                    <th style={{ textAlign: "left", padding: ".5rem" }}>Nome</th>
                    <th style={{ textAlign: "right", padding: ".5rem" }}>VibeCoins</th>
                    <th style={{ textAlign: "right", padding: ".5rem" }}>Streak</th>
                    <th style={{ textAlign: "right", padding: ".5rem" }}>Último Giro</th>
                    <th style={{ textAlign: "right", padding: ".5rem" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={{ padding: ".55rem", color: "#bca8d9" }}>{i + 1}</td>
                      <td style={{ padding: ".55rem", fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: ".55rem", textAlign: "right", color: "#ffd700", fontWeight: 700 }}>{(u.coins || 0).toLocaleString("pt-BR")}</td>
                      <td style={{ padding: ".55rem", textAlign: "right" }}>{u.streak || 0}🔥</td>
                      <td style={{ padding: ".55rem", textAlign: "right", color: "#bca8d9" }}>{u.last_spin || "—"}</td>
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
          <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "#3a1857", border: "1px solid #c47ad9", borderRadius: 50, padding: ".6rem 1.6rem", color: "#f5ecff", fontSize: ".9rem", letterSpacing: 1.5, textTransform: "uppercase" }}>{toast}</div>
        )}
      </div>
    </>
  );
};

export default AdminAltaVibe;
