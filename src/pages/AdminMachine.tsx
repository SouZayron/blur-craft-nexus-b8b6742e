import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_PASS = "admin2026";

type MUser = { id: string; name: string; coins: number; spins_today: number; last_spin_day: string | null; streak: number; created_at: string; block_top: boolean };
type Play = { id: string; name: string; symbols: unknown; prize: number; is_trinca: boolean; created_at: string; user_id: string | null };
type Sym = { id: string; symbol_id: string; name: string; img: string; value: number; weight: number; position: number };
type Settings = { id: number; is_open: boolean; signups_locked: boolean; max_spins_per_day: number; mix_prize: number; results_active?: boolean };

const AdminMachine = () => {
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [users, setUsers] = useState<MUser[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [symbols, setSymbols] = useState<Sym[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tab, setTab] = useState<"users" | "plays" | "symbols" | "settings">("users");
  const [toast, setToast] = useState("");
  const [newSym, setNewSym] = useState({ symbol_id: "", name: "", img: "", value: 10, weight: 10, position: 99 });

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const loadAll = useCallback(async () => {
    const [u, p, s, st] = await Promise.all([
      supabase.from("machine_users").select("*").order("coins", { ascending: false }),
      supabase.from("machine_plays").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("machine_symbols").select("*").order("position"),
      supabase.from("machine_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (u.data) setUsers(u.data as MUser[]);
    if (p.data) setPlays(p.data as unknown as Play[]);
    if (s.data) setSymbols(s.data as Sym[]);
    if (st.data) setSettings(st.data as Settings);
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadAll();
    const ch = supabase
      .channel("machine_admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_users" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_plays" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_symbols" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_settings" }, loadAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [authed, loadAll]);

  const auth = () => {
    if (passInput === ADMIN_PASS) setAuthed(true);
    else showToast("Senha incorreta");
  };

  const updateSettings = async (patch: Partial<Settings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    const { error } = await supabase.from("machine_settings").update(patch).eq("id", 1);
    if (error) showToast("Erro ao salvar"); else showToast("Salvo ✔");
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Excluir este jogador e todo o histórico?")) return;
    await supabase.from("machine_users").delete().eq("id", id);
    showToast("Jogador excluído");
  };

  const deletePlay = async (id: string) => {
    if (!confirm("Excluir esta jogada? (não devolve VC)")) return;
    await supabase.from("machine_plays").delete().eq("id", id);
    showToast("Jogada excluída");
  };

  const clearLogs = async () => {
    if (!confirm("Apagar TODOS os logs de jogadas?")) return;
    await supabase.from("machine_plays").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    showToast("Logs limpos");
  };

  const resetCoins = async (id: string) => {
    if (!confirm("Zerar moedas deste jogador?")) return;
    await supabase.from("machine_users").update({ coins: 0, spins_today: 0, streak: 0 }).eq("id", id);
    showToast("Zerado");
  };

  const resetSpinsForAll = async () => {
    if (!confirm("Devolver os 3 giros de hoje para TODOS?")) return;
    await supabase.from("machine_users").update({ spins_today: 0, last_spin_day: null }).neq("id", "00000000-0000-0000-0000-000000000000");
    showToast("Giros devolvidos");
  };

  const updateSymbol = async (id: string, patch: Partial<Sym>) => {
    await supabase.from("machine_symbols").update(patch).eq("id", id);
  };

  const addSymbol = async () => {
    if (!newSym.symbol_id || !newSym.name || !newSym.img) return showToast("Preencha todos os campos");
    const { error } = await supabase.from("machine_symbols").insert(newSym);
    if (error) return showToast("Erro: " + error.message);
    setNewSym({ symbol_id: "", name: "", img: "", value: 10, weight: 10, position: 99 });
    showToast("Símbolo adicionado");
  };

  const deleteSymbol = async (id: string) => {
    if (!confirm("Excluir símbolo?")) return;
    await supabase.from("machine_symbols").delete().eq("id", id);
    showToast("Excluído");
  };

  if (!authed) {
    return (
      <>
        <Helmet><title>Admin Cassaniquel</title><meta name="robots" content="noindex,nofollow" /></Helmet>
        <div style={{ minHeight: "100vh", background: "#0f0820", color: "#f5ecff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
          <div style={{ background: "rgba(255,255,255,0.06)", padding: 30, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", width: 320 }}>
            <h2 style={{ margin: "0 0 1rem" }}>🔒 Admin Cassaniquel</h2>
            <input type="password" placeholder="Senha" value={passInput} onChange={(e) => setPassInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && auth()}
              style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", marginBottom: 10 }} />
            <button onClick={auth} style={{ width: "100%", padding: 10, background: "linear-gradient(135deg,#8b3fbf,#c47ad9)", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Entrar</button>
            {toast && <p style={{ color: "#ffb3b3", marginTop: 10 }}>{toast}</p>}
          </div>
        </div>
      </>
    );
  }

  const inputSt: React.CSSProperties = { padding: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 6, width: "100%" };
  const btnSt: React.CSSProperties = { padding: "6px 12px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, cursor: "pointer", fontSize: ".8rem" };
  const btnDanger: React.CSSProperties = { ...btnSt, background: "rgba(220,60,60,.3)", borderColor: "#c47a7a" };
  const btnPrimary: React.CSSProperties = { ...btnSt, background: "linear-gradient(135deg,#8b3fbf,#c47ad9)", borderColor: "#c47ad9", fontWeight: 600 };

  return (
    <>
      <Helmet><title>Admin Cassaniquel</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div style={{ minHeight: "100vh", background: "#0f0820", color: "#f5ecff", padding: 20, fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h1 style={{ margin: 0, fontSize: "1.4rem" }}>🎰 Admin Cassaniquel</h1>
            <a href="/machine" style={{ color: "#c47ad9" }}>→ ver game</a>
          </div>

          {/* Quick settings */}
          {settings && (
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
              <label>🎮 Game aberto
                <div><input type="checkbox" checked={settings.is_open} onChange={(e) => updateSettings({ is_open: e.target.checked })} /> {settings.is_open ? "Aberto" : "Pausado"}</div>
              </label>
              <label>📝 Cadastros
                <div><input type="checkbox" checked={!settings.signups_locked} onChange={(e) => updateSettings({ signups_locked: !e.target.checked })} /> {settings.signups_locked ? "Trancado" : "Liberado"}</div>
              </label>
              <label>🎰 Giros/dia
                <input type="number" style={inputSt} value={settings.max_spins_per_day} onChange={(e) => updateSettings({ max_spins_per_day: parseInt(e.target.value) || 3 })} />
              </label>
              <label>💰 Prêmio combinação mista (VC)
                <input type="number" style={inputSt} value={settings.mix_prize} onChange={(e) => updateSettings({ mix_prize: parseInt(e.target.value) || 5 })} />
              </label>
              <label>🏆 Tela de Resultado
                <div><input type="checkbox" checked={!!settings.results_active} onChange={(e) => updateSettings({ results_active: e.target.checked } as Partial<Settings>)} /> {settings.results_active ? "ATIVA (top 3 exibidos)" : "Oculta"}</div>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-end" }}>
                <button style={btnDanger} onClick={clearLogs}>🧹 Limpar todos os logs</button>
                <button style={btnDanger} onClick={resetSpinsForAll}>🔄 Devolver giros hoje (todos)</button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {(["users", "plays", "symbols"] as const).map((t) => (
              <button key={t} style={{ ...btnSt, ...(tab === t ? btnPrimary : {}) }} onClick={() => setTab(t)}>
                {t === "users" ? `👥 Jogadores (${users.length})` : t === "plays" ? `📋 Logs (${plays.length})` : `🎲 Símbolos (${symbols.length})`}
              </button>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 12 }}>
            {tab === "users" && (
              <table style={{ width: "100%", fontSize: ".85rem", borderCollapse: "collapse" }}>
                <thead><tr style={{ textAlign: "left", color: "#bca8d9" }}>
                  <th style={{ padding: 6 }}>#</th><th>Nome</th><th>Coins</th><th>Giros hoje</th><th>Streak</th><th>Último</th><th>Bloq. Ruby/Seven</th><th>Ações</th>
                </tr></thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: 6 }}>{i + 1}</td>
                      <td>{u.name}</td>
                      <td style={{ color: "#e9c879", fontWeight: 700 }}>{u.coins}</td>
                      <td>{u.spins_today}</td>
                      <td>🔥 {u.streak}</td>
                      <td style={{ color: "#8a8f9c" }}>{u.last_spin_day || "—"}</td>
                      <td>
                        <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <input type="checkbox" checked={!!u.block_top} onChange={async (e) => {
                            await supabase.from("machine_users").update({ block_top: e.target.checked }).eq("id", u.id);
                            showToast(e.target.checked ? "🚫 Ruby/Seven bloqueados" : "✅ Liberado");
                          }} />
                          {u.block_top ? "🚫" : "—"}
                        </label>
                      </td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button style={btnSt} onClick={() => resetCoins(u.id)}>Zerar</button>
                        <button style={btnDanger} onClick={() => deleteUser(u.id)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "plays" && (
              <table style={{ width: "100%", fontSize: ".85rem", borderCollapse: "collapse" }}>
                <thead><tr style={{ textAlign: "left", color: "#bca8d9" }}>
                  <th style={{ padding: 6 }}>Quando</th><th>Jogador</th><th>Símbolos</th><th>Trinca?</th><th>Prêmio</th><th>Ações</th>
                </tr></thead>
                <tbody>
                  {plays.map((p) => {
                    const syms = Array.isArray(p.symbols) ? (p.symbols as Array<{ img: string; name: string }>) : [];
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: 6, color: "#8a8f9c" }}>{new Date(p.created_at).toLocaleString("pt-BR")}</td>
                        <td>{p.name}</td>
                        <td>{syms.map((s, i) => <img key={i} src={s.img} alt="" style={{ width: 20, height: 20, marginRight: 2, verticalAlign: "middle" }} />)}</td>
                        <td>{p.is_trinca ? "✅" : "—"}</td>
                        <td style={{ color: "#e9c879", fontWeight: 700 }}>+{p.prize}</td>
                        <td><button style={btnDanger} onClick={() => deletePlay(p.id)}>Excluir</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {tab === "symbols" && (
              <>
                <table style={{ width: "100%", fontSize: ".85rem", borderCollapse: "collapse", marginBottom: 20 }}>
                  <thead><tr style={{ textAlign: "left", color: "#bca8d9" }}>
                    <th style={{ padding: 6 }}>Img</th><th>ID</th><th>Nome</th><th>URL Img</th><th>Valor (VC)</th><th>Peso</th><th>Pos</th><th></th>
                  </tr></thead>
                  <tbody>
                    {symbols.map((s) => (
                      <tr key={s.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: 6 }}><img src={s.img} alt="" style={{ width: 32, height: 32 }} /></td>
                        <td style={{ color: "#8a8f9c" }}>{s.symbol_id}</td>
                        <td><input style={inputSt} defaultValue={s.name} onBlur={(e) => e.target.value !== s.name && updateSymbol(s.id, { name: e.target.value })} /></td>
                        <td><input style={{ ...inputSt, minWidth: 220 }} defaultValue={s.img} onBlur={(e) => e.target.value !== s.img && updateSymbol(s.id, { img: e.target.value })} /></td>
                        <td><input type="number" style={{ ...inputSt, width: 80 }} defaultValue={s.value} onBlur={(e) => { const v = parseInt(e.target.value); if (v !== s.value) updateSymbol(s.id, { value: v }); }} /></td>
                        <td><input type="number" style={{ ...inputSt, width: 80 }} defaultValue={s.weight} onBlur={(e) => { const v = parseInt(e.target.value); if (v !== s.weight) updateSymbol(s.id, { weight: v }); }} /></td>
                        <td><input type="number" style={{ ...inputSt, width: 60 }} defaultValue={s.position} onBlur={(e) => { const v = parseInt(e.target.value); if (v !== s.position) updateSymbol(s.id, { position: v }); }} /></td>
                        <td><button style={btnDanger} onClick={() => deleteSymbol(s.id)}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ background: "rgba(139,63,191,.15)", padding: 12, borderRadius: 8, border: "1px solid #c47ad9" }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: ".9rem" }}>➕ Adicionar símbolo</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, alignItems: "end" }}>
                    <label>ID único<input style={inputSt} value={newSym.symbol_id} onChange={(e) => setNewSym({ ...newSym, symbol_id: e.target.value })} placeholder="ex: banana" /></label>
                    <label>Nome<input style={inputSt} value={newSym.name} onChange={(e) => setNewSym({ ...newSym, name: e.target.value })} placeholder="Banana" /></label>
                    <label>URL da imagem<input style={inputSt} value={newSym.img} onChange={(e) => setNewSym({ ...newSym, img: e.target.value })} placeholder="https://..." /></label>
                    <label>Valor VC<input type="number" style={inputSt} value={newSym.value} onChange={(e) => setNewSym({ ...newSym, value: parseInt(e.target.value) || 0 })} /></label>
                    <label>Peso<input type="number" style={inputSt} value={newSym.weight} onChange={(e) => setNewSym({ ...newSym, weight: parseInt(e.target.value) || 0 })} /></label>
                    <label>Posição<input type="number" style={inputSt} value={newSym.position} onChange={(e) => setNewSym({ ...newSym, position: parseInt(e.target.value) || 99 })} /></label>
                    <button style={btnPrimary} onClick={addSymbol}>Adicionar</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {toast && <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#1a0d2e", border: "1px solid #c47ad9", padding: "10px 20px", borderRadius: 8 }}>{toast}</div>}
      </div>
    </>
  );
};

export default AdminMachine;
