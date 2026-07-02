import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const LS_NAME = "machine_name";
const LS_PASS = "machine_pass";

type MUser = {
  id: string;
  name: string;
  coins: number;
  spins_today: number;
  last_spin_day: string | null;
  streak: number;
};

type Sym = {
  id: string;
  symbol_id: string;
  name: string;
  img: string;
  value: number;
  weight: number;
  position: number;
};

type Play = {
  id: string;
  name: string;
  symbols: Array<{ id: string; name: string; img: string; value: number }>;
  prize: number;
  is_trinca: boolean;
  created_at: string;
};

type Settings = {
  is_open: boolean;
  signups_locked: boolean;
  max_spins_per_day: number;
  mix_prize: number;
};

const CELL = 88;
const STRIP_LEN = 22;

const Machine = () => {
  const [nameInput, setNameInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [me, setMe] = useState<MUser | null>(null);
  const [symbols, setSymbols] = useState<Sym[]>([]);
  const [settings, setSettings] = useState<Settings>({ is_open: true, signups_locked: false, max_spins_per_day: 3, mix_prize: 5 });
  const [ranking, setRanking] = useState<MUser[]>([]);
  const [logs, setLogs] = useState<Play[]>([]);
  const [toast, setToast] = useState("");
  const [message, setMessage] = useState("Faça login e gire!");
  const [messageKind, setMessageKind] = useState<"" | "win" | "empty">("");
  const [lastPrize, setLastPrize] = useState<string>("—");
  const [spinning, setSpinning] = useState(false);
  const [winCells, setWinCells] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2600); };

  const loadAll = useCallback(async () => {
    const [s, syms, r, l, st] = await Promise.all([
      supabase.from("machine_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("machine_symbols").select("*").order("position"),
      supabase.from("machine_users").select("id,name,coins,spins_today,last_spin_day,streak").order("coins", { ascending: false }).limit(30),
      supabase.from("machine_plays").select("*").order("created_at", { ascending: false }).limit(80),
      Promise.resolve(null),
    ]);
    void st;
    if (s.data) setSettings(s.data as Settings);
    if (syms.data) setSymbols(syms.data as Sym[]);
    if (r.data) setRanking(r.data as MUser[]);
    if (l.data) setLogs(l.data as unknown as Play[]);
  }, []);

  useEffect(() => {
    loadAll();
    const ch = supabase
      .channel("machine_ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_users" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_plays" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_settings" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_symbols" }, loadAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadAll]);

  // auto-login
  useEffect(() => {
    const n = localStorage.getItem(LS_NAME);
    const p = localStorage.getItem(LS_PASS);
    if (n) setNameInput(n);
    if (p) setPassInput(p);
    if (n && p) {
      supabase.rpc("machine_login", { p_name: n, p_password: p }).then(({ data }) => {
        if (data) setMe(data as MUser);
      });
    }
  }, []);

  // refresh me when ranking updates
  useEffect(() => {
    if (!me) return;
    const fresh = ranking.find((u) => u.id === me.id);
    if (fresh) setMe(fresh);
  }, [ranking, me?.id]); // eslint-disable-line

  const totalWeight = symbols.reduce((s, x) => s + Math.max(0, x.weight), 0) || 1;

  const login = async () => {
    const name = nameInput.trim().slice(0, 20);
    const pass = passInput.trim();
    if (!name) return showToast("Coloca um apelido!");
    if (!/^\d{4}$/.test(pass)) return showToast("Senha: 4 dígitos numéricos");
    const { data, error } = await supabase.rpc("machine_login", { p_name: name, p_password: pass });
    if (error || !data) {
      const m = error?.message || "";
      if (m.includes("wrong_password")) showToast("Senha incorreta 🔒");
      else if (m.includes("signups_locked")) showToast("Cadastros encerrados 🔒");
      else showToast("Erro ao entrar");
      return;
    }
    setMe(data as MUser);
    localStorage.setItem(LS_NAME, name);
    localStorage.setItem(LS_PASS, pass);
    showToast(`Bem-vindo, ${name}! 🎰`);
  };

  const logout = () => {
    localStorage.removeItem(LS_NAME);
    localStorage.removeItem(LS_PASS);
    setMe(null);
    setNameInput(""); setPassInput("");
  };

  const decorativeSym = () => symbols[Math.floor(Math.random() * symbols.length)];

  const buildStrip = (el: HTMLDivElement, finalSym: { img: string; name: string }) => {
    el.innerHTML = "";
    el.style.transition = "none";
    el.style.transform = "translateY(0px)";
    for (let i = 0; i < STRIP_LEN - 1; i++) {
      const s = decorativeSym();
      const cell = document.createElement("div");
      cell.className = "mc-cell";
      cell.innerHTML = `<img src="${s.img}" alt="${s.name}"/>`;
      el.appendChild(cell);
    }
    const last = document.createElement("div");
    last.className = "mc-cell";
    last.innerHTML = `<img src="${finalSym.img}" alt="${finalSym.name}"/>`;
    el.appendChild(last);
  };

  const spin = async () => {
    if (spinning) return;
    if (!me) return showToast("Faça login primeiro!");
    if (!settings.is_open) return showToast("Game fechado no momento 🔒");
    if (symbols.length === 0) return showToast("Sem símbolos configurados");
    setSpinning(true);
    setMessage("Girando...");
    setMessageKind("");
    setWinCells([false, false, false]);
    setLastPrize("—");

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
    const { data, error } = await supabase.rpc("machine_spin", { p_name: me.name, p_tz: tz });
    if (error || !data) {
      setSpinning(false);
      const m = error?.message || "";
      if (m.includes("no_spins_left")) { setMessage("Suas chances de hoje acabaram."); setMessageKind("empty"); }
      else if (m.includes("game_not_started")) showToast("Game começa em 01/07/2026 ⏳");
      else if (m.includes("game_ended")) showToast("Game encerrado (15/07) 🏁");
      else if (m.includes("game_closed")) showToast("Game fechado 🔒");
      else showToast("Erro ao girar");
      return;
    }
    const res = data as { symbols: Array<{ id: string; name: string; img: string; value: number }>; prize: number; is_trinca: boolean; coins: number; spins_today: number; spins_left: number };

    // Animate reels
    const durations = [950, 1250, 1550];
    res.symbols.forEach((sym, i) => {
      const el = reelRefs[i].current;
      if (!el) return;
      buildStrip(el, sym);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void el.offsetHeight;
      const off = (STRIP_LEN - 1) * CELL;
      requestAnimationFrame(() => {
        el.style.transition = `transform ${durations[i]}ms cubic-bezier(0.16, 0.84, 0.24, 1)`;
        el.style.transform = `translateY(-${off}px)`;
      });
    });

    setTimeout(() => {
      setSpinning(false);
      setLastPrize(`+${res.prize} VC`);
      setMe((prev) => prev ? { ...prev, coins: res.coins, spins_today: res.spins_today } : prev);
      if (res.is_trinca) {
        setWinCells([true, true, true]);
        setMessage(`🎉 Trinca de ${res.symbols[0].name}! +${res.prize} VC`);
        setMessageKind("win");
      } else {
        const ids = res.symbols.map((s) => s.id);
        const counts: Record<string, number> = {};
        ids.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
        setWinCells(ids.map((id) => counts[id] === 2) as [boolean, boolean, boolean]);
        setMessage(`+${res.prize} VC · ${res.spins_left} giro${res.spins_left === 1 ? "" : "s"} restante${res.spins_left === 1 ? "" : "s"}`);
        setMessageKind("win");
      }
    }, 1650);
  };

  const paytable = [...symbols].sort((a, b) => b.value - a.value);
  const spinsLeft = me ? Math.max(0, settings.max_spins_per_day - (me.last_spin_day === new Date().toLocaleDateString("en-CA") ? me.spins_today : 0)) : settings.max_spins_per_day;

  return (
    <>
      <Helmet>
        <title>Cassaniquel — Alta Vibe</title>
        <meta name="robots" content="noindex,nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>
      <style>{`
        html,body,#root{height:100%}
        .mc-root{--text:#f5ecff;color:var(--text);background:radial-gradient(ellipse at top,#3a1857 0%,#1a0d2e 50%,#0f0820 100%);font-family:'Barlow',sans-serif;height:100vh;padding:.6rem;overflow:hidden}
        .mc-wrap{max-width:1500px;margin:0 auto;display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:.7rem;align-items:stretch;height:calc(100vh - 1.2rem)}
        @media (max-width:1100px){.mc-root{height:auto;overflow:auto}.mc-wrap{grid-template-columns:1fr;height:auto}}
        .mc-header{grid-column:1/-1;text-align:center;margin:0}
        .mc-logo{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:5px;background:linear-gradient(135deg,#e9c879,#c9a24a,#ffd1ec);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
        .mc-sub{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;letter-spacing:4px;text-transform:uppercase;color:#bca8d9}
        .mc-col{display:flex;flex-direction:column;gap:.5rem;min-width:0;min-height:0;overflow:hidden}
        .mc-panel{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:.55rem .75rem;backdrop-filter:blur(12px)}
        .mc-panel.flex{display:flex;flex-direction:column;min-height:0;flex:1}
        .mc-ptitle{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;letter-spacing:3px;text-transform:uppercase;color:#bca8d9;margin-bottom:.35rem}
        .mc-input{width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:.4rem .6rem;color:#f5ecff;font-size:.85rem;outline:none;margin-bottom:.4rem}
        .mc-input:focus{border-color:#c47ad9}
        .mc-btn{width:100%;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;background:linear-gradient(135deg,#8b3fbf,#c47ad9);color:#fff;border:none;border-radius:8px;padding:.45rem;cursor:pointer;font-weight:700}
        .mc-btn:hover{filter:brightness(1.1)}
        .mc-btn.ghost{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2)}
        .mc-rules{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;color:#d9c8ef;line-height:1.4}
        .mc-rules li{margin-bottom:.1rem}
        .mc-pt-row{display:flex;justify-content:space-between;align-items:center;padding:.2rem 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:.75rem}
        .mc-pt-row img{width:20px;height:20px;vertical-align:middle;margin-right:.35rem}
        .mc-pt-val{color:#e9c879;font-weight:700;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px}
        .mc-streak{display:flex;justify-content:space-around;text-align:center}
        .mc-streak div{font-family:'Barlow Condensed',sans-serif;font-size:.7rem}
        .mc-streak b{display:block;font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:#e9c879;line-height:1}
        .mc-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem;margin-bottom:.5rem}
        .mc-stat{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:.4rem;text-align:center}
        .mc-stat-lbl{font-family:'Barlow Condensed',sans-serif;font-size:.55rem;letter-spacing:1.5px;text-transform:uppercase;color:#bca8d9}
        .mc-stat-val{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:1px;color:#e9c879}
        .mc-reels-frame{background:#060709;border:1px solid #262c38;border-radius:12px;padding:12px;position:relative}
        .mc-reels{display:flex;gap:8px}
        .mc-window{flex:1;height:${CELL}px;background:linear-gradient(180deg,#0c0e13,#07080b);border-radius:8px;border:1px solid #1d222c;overflow:hidden;position:relative;transition:border-color .3s,box-shadow .3s}
        .mc-window::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,7,9,.9) 0%,transparent 26%,transparent 74%,rgba(6,7,9,.9) 100%);pointer-events:none;z-index:2}
        .mc-window.win{border-color:#e9c879;box-shadow:0 0 0 1px #c9a24a,0 0 16px rgba(201,162,74,.4)}
        .mc-strip{display:flex;flex-direction:column;align-items:center;position:absolute;width:100%;top:0;left:0}
        .mc-cell{height:${CELL}px;width:100%;display:flex;align-items:center;justify-content:center}
        .mc-cell img{width:46px;height:46px}
        .mc-payline{position:absolute;left:14px;right:14px;top:50%;height:1px;background:#c9a24a;opacity:.45;z-index:3;pointer-events:none}
        .mc-message{margin-top:10px;text-align:center;min-height:20px;font-size:.85rem;color:#bca8d9}
        .mc-message.win{color:#e9c879;font-weight:700}
        .mc-message.empty{color:#c88b8b}
        .mc-spin-btn{display:block;margin:10px auto 4px;width:62px;height:62px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#e9c879,#8b6a1f);border:2px solid #e9c879;cursor:pointer;font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#1a0d2e;letter-spacing:2px;box-shadow:0 6px 20px rgba(0,0,0,.6)}
        .mc-spin-btn:disabled{filter:grayscale(1) brightness(.5);cursor:not-allowed}
        .mc-spin-btn:active:not(:disabled){transform:scale(.95)}
        .mc-list{overflow-y:auto;display:flex;flex-direction:column;gap:.28rem;flex:1;min-height:0}
        .mc-list::-webkit-scrollbar{width:6px}
        .mc-list::-webkit-scrollbar-thumb{background:rgba(196,122,217,0.4);border-radius:3px}
        .mc-rank-row{display:grid;grid-template-columns:22px 1fr auto;gap:.4rem;align-items:center;padding:.28rem .5rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;font-size:.8rem}
        .mc-rank-row.top{background:rgba(233,200,121,.1);border-color:rgba(233,200,121,.35)}
        .mc-rank-pos{font-family:'Bebas Neue',sans-serif;color:#e9c879;text-align:center}
        .mc-rank-coins{font-family:'Bebas Neue',sans-serif;color:#e9c879;letter-spacing:1px}
        .mc-log-row{display:grid;grid-template-columns:1fr auto auto auto;gap:.35rem;align-items:center;font-family:'Barlow Condensed',sans-serif;font-size:.72rem;padding:.22rem .45rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px}
        .mc-log-row.trinca{background:rgba(233,200,121,.1);border-color:rgba(233,200,121,.3)}
        .mc-log-syms{display:flex;gap:2px}
        .mc-log-syms img{width:14px;height:14px}
        .mc-log-prize{color:#e9c879;font-weight:700}
        .mc-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(26,13,46,.95);border:1px solid #c47ad9;color:#f5ecff;padding:.6rem 1.1rem;border-radius:8px;z-index:100;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px}
      `}</style>

      <div className="mc-root">
        <div className="mc-wrap">
          <div className="mc-header">
            <div className="mc-logo">CASSANIQUEL</div>
            <div className="mc-sub">Sala de Jogos · Alta Vibe</div>
          </div>

          {/* LEFT: Login + Rules + Pesos + Streak + Logs */}
          <div className="mc-col">
            <div className="mc-panel">
              <div className="mc-ptitle">{me ? "Sua conta" : "Login / Cadastro"}</div>
              {me ? (
                <>
                  <div style={{ fontFamily: "Bebas Neue", fontSize: "1.3rem", letterSpacing: 1 }}>{me.name}</div>
                  <div style={{ color: "#bca8d9", fontSize: ".8rem", marginBottom: ".5rem" }}>
                    💰 {me.coins} VC · 🎰 {spinsLeft}/{settings.max_spins_per_day} giros hoje · 🔥 streak {me.streak}
                  </div>
                  <button className="mc-btn ghost" onClick={logout}>Sair</button>
                </>
              ) : (
                <>
                  <input className="mc-input" placeholder="Seu apelido" value={nameInput} onChange={(e) => setNameInput(e.target.value)} maxLength={20} />
                  <input className="mc-input" placeholder="Senha (4 dígitos)" value={passInput} onChange={(e) => setPassInput(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
                  <button className="mc-btn" onClick={login}>Entrar / Cadastrar</button>
                </>
              )}
            </div>

            <div className="mc-panel">
              <div className="mc-ptitle">📜 Regras</div>
              <ul className="mc-rules" style={{ paddingLeft: "1.1rem", margin: 0 }}>
                <li>Mesmo nome e senha todos os dias para acumular</li>
                <li>3 giros por dia · vibecoins aleatórios</li>
                <li>Período: 01/07 → 15/07/2026</li>
                <li>Liberado todo dia após 00h</li>
                <li>🏆 Prêmios: 1º 1500x · 2º 1000x · 3º 500x</li>
                <li>Cadastros duplicados: vale apenas o maior</li>
                <li>Necessário ser ativo no xat.com/altavibe</li>
                <li>Fraudar a machine (eliminatória)</li>
              </ul>
            </div>

            <div className="mc-panel">
              <div className="mc-ptitle">⚖️ Pesos e Ganhos</div>
              {paytable.map((s) => (
                <div key={s.id} className="mc-pt-row">
                  <div><img src={s.img} alt={s.name} />{s.name} <span style={{ color: "#8a8f9c", fontSize: ".7rem" }}>({((s.weight / totalWeight) * 100).toFixed(1)}%)</span></div>
                  <div className="mc-pt-val">{s.value} VC</div>
                </div>
              ))}
              <div className="mc-pt-row" style={{ borderBottom: "none" }}>
                <div style={{ fontStyle: "italic", color: "#bca8d9" }}>Combinação mista</div>
                <div className="mc-pt-val">{settings.mix_prize} VC</div>
              </div>
            </div>

            <div className="mc-panel">
              <div className="mc-ptitle">🔥 Streak</div>
              <div className="mc-streak">
                <div><b>{me?.streak ?? 0}</b>Dias seguidos</div>
                <div><b>{me?.coins ?? 0}</b>Acumulado</div>
              </div>
            </div>
          </div>

          {/* CENTER: Cassaniquel */}
          <div className="mc-col">
            <div className="mc-panel flex">
              <div className="mc-stats">
                <div className="mc-stat"><div className="mc-stat-lbl">Chances hoje</div><div className="mc-stat-val">{spinsLeft}</div></div>
                <div className="mc-stat"><div className="mc-stat-lbl">Última</div><div className="mc-stat-val" style={{ fontSize: "1rem" }}>{lastPrize}</div></div>
                <div className="mc-stat"><div className="mc-stat-lbl">Acumulado</div><div className="mc-stat-val">{me?.coins ?? 0}</div></div>
              </div>
              <div className="mc-reels-frame">
                <div className="mc-reels">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`mc-window ${winCells[i] ? "win" : ""}`}>
                      <div className="mc-strip" ref={reelRefs[i]}>
                        <div className="mc-cell">{symbols[0] && <img src={symbols[0].img} alt="" />}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mc-payline"></div>
              </div>
              <div className={`mc-message ${messageKind}`}>{message}</div>
              <button className="mc-spin-btn" onClick={spin} disabled={spinning || !me || !settings.is_open || spinsLeft <= 0}>GIRAR</button>
              <div style={{ textAlign: "center", color: "#8a8f9c", fontSize: ".65rem", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 4 }}>
                {settings.max_spins_per_day} chances por dia · renova à meia-noite
              </div>
            </div>
          </div>

          {/* RIGHT: Ranking + Logs */}
          <div className="mc-col">
            <div className="mc-panel flex" style={{ flex: 1.4 }}>
              <div className="mc-ptitle">🏆 Ranking Top 30</div>
              <div className="mc-list">
                {ranking.map((u, i) => (
                  <div key={u.id} className={`mc-rank-row ${i < 3 ? "top" : ""}`}>
                    <div className="mc-rank-pos">{i + 1}</div>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""}{u.name}
                    </div>
                    <div className="mc-rank-coins">{u.coins}</div>
                  </div>
                ))}
                {ranking.length === 0 && <div style={{ color: "#8a8f9c", textAlign: "center", padding: "1rem" }}>Sem jogadores ainda.</div>}
              </div>
            </div>
            <div className="mc-panel flex" style={{ flex: 1 }}>
              <div className="mc-ptitle">📋 Logs</div>
              <div className="mc-list">
                {logs.slice(0, 60).map((p) => {
                  const d = new Date(p.created_at);
                  const syms = Array.isArray(p.symbols) ? p.symbols : [];
                  return (
                    <div key={p.id} className={`mc-log-row ${p.is_trinca ? "trinca" : ""}`}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                      <span className="mc-log-syms">{syms.map((s, i) => <img key={i} src={s.img} alt="" />)}</span>
                      <span style={{ color: "#bca8d9" }}>{d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="mc-log-prize">+{p.prize}</span>
                    </div>
                  );
                })}
                {logs.length === 0 && <div style={{ color: "#8a8f9c", textAlign: "center", padding: "1rem" }}>Nenhum giro ainda.</div>}
              </div>
            </div>
          </div>
        </div>
        {toast && <div className="mc-toast">{toast}</div>}
      </div>

    </>
  );
};

export default Machine;
