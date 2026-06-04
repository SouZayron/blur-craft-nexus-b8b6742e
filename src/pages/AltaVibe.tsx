import { useEffect, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const PRIZES = [
  { label: "5 VC", coins: 5, color: "#b59ad6", text: "#1a0d2e" },
  { label: "10 VC", coins: 10, color: "#7a4bcc", text: "#fff" },
  { label: "15 VC", coins: 15, color: "#d99ee6", text: "#1a0d2e" },
  { label: "20 VC", coins: 20, color: "#5a2e9e", text: "#fff" },
  { label: "25 VC", coins: 25, color: "#c47ad9", text: "#1a0d2e" },
  { label: "30 VC", coins: 30, color: "#8b3fbf", text: "#fff" },
  { label: "50 VC", coins: 50, color: "#ffd700", text: "#3a1857" },
  { label: "10 VC", coins: 10, color: "#a266d9", text: "#fff" },
];

const SEG = (2 * Math.PI) / PRIZES.length;
const LS_NAME = "altavibe_current_name";

type User = {
  id: string;
  name: string;
  coins: number;
  streak: number;
  last_spin: string | null;
};

const AltaVibe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const spinningRef = useRef(false);
  const [nameInput, setNameInput] = useState("");
  const [me, setMe] = useState<User | null>(null);
  const [ranking, setRanking] = useState<User[]>([]);
  const [result, setResult] = useState<{ total: number; bonus: number; prize: number } | null>(null);
  const [toast, setToast] = useState("");
  const [flash, setFlash] = useState(false);
  const [gameOpen, setGameOpen] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2, r = size / 2 - 4;
    PRIZES.forEach((p, i) => {
      const start = angle + i * SEG - Math.PI / 2;
      const end = start + SEG;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + SEG / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = p.text;
      ctx.font = "bold 13px 'Barlow Condensed', sans-serif";
      ctx.fillText(p.label, r - 10, 5);
      ctx.restore();
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  useEffect(() => { drawWheel(0); }, [drawWheel]);

  const loadRanking = useCallback(async () => {
    const { data } = await supabase
      .from("altavibe_users")
      .select("*")
      .order("coins", { ascending: false })
      .limit(50);
    if (data) setRanking(data as User[]);
  }, []);

  useEffect(() => {
    loadRanking();
    supabase.from("altavibe_settings").select("is_open").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setGameOpen(!!data.is_open);
    });
    const ch = supabase
      .channel("altavibe_users_ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_users" }, () => loadRanking())
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_settings" }, (payload) => {
        const row = (payload.new || payload.old) as { is_open?: boolean } | null;
        if (row && typeof row.is_open === "boolean") setGameOpen(row.is_open);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadRanking]);

  useEffect(() => {
    const saved = localStorage.getItem(LS_NAME);
    if (saved) {
      setNameInput(saved);
      supabase.from("altavibe_users").select("*").eq("name", saved).maybeSingle().then(({ data }) => {
        if (data) setMe(data as User);
      });
    }
  }, []);

  const saveProfile = async () => {
    const name = nameInput.trim().slice(0, 20);
    if (!name) { showToast("Coloca um apelido! 😤"); return; }
    const { data, error } = await supabase.rpc("altavibe_login", { p_name: name });
    if (error || !data) { showToast("Erro ao entrar"); return; }
    setMe(data as User);
    localStorage.setItem(LS_NAME, name);
    showToast(`Bem-vindo, ${name}! 🎉`);
    loadRanking();
  };

  const animateTo = (winIdx: number, onDone: () => void) => {
    const extraRot = 6 * 2 * Math.PI;
    const target = extraRot + (2 * Math.PI - winIdx * SEG - SEG / 2);
    const duration = 4000;
    const start = performance.now();
    const startAngle = angleRef.current;
    const normalized = startAngle % (2 * Math.PI);
    const delta = target - normalized;
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      angleRef.current = startAngle + delta * ease(progress);
      drawWheel(angleRef.current);
      if (progress < 1) requestAnimationFrame(frame);
      else onDone();
    };
    requestAnimationFrame(frame);
  };

  const spinWheel = async () => {
    if (spinningRef.current) return;
    if (!me) { showToast("Salva seu apelido primeiro! 👆"); return; }
    spinningRef.current = true;

    const { data, error } = await supabase.rpc("altavibe_spin", { p_name: me.name });
    if (error || !data) {
      spinningRef.current = false;
      const msg = error?.message || "";
      if (msg.includes("already_spun_today")) showToast("Já girou hoje! Volta amanhã 🌙");
      else showToast("Erro ao girar");
      return;
    }
    const res = data as { win_index: number; prize: number; bonus: number; total: number; streak: number; coins: number; last_spin: string };
    animateTo(res.win_index, () => {
      spinningRef.current = false;
      setMe((prev) => prev ? { ...prev, coins: res.coins, streak: res.streak, last_spin: res.last_spin } : prev);
      setResult({ total: res.total, bonus: res.bonus, prize: res.prize });
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
      showToast(res.bonus > 0 ? `🔥 Streak ${res.streak}d! Bônus +${res.bonus} VC` : `⚡ +${res.prize} VibeCoins!`);
      loadRanking();
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const alreadySpun = me?.last_spin === today;

  return (
    <>
      <Helmet>
        <title>Alta Vibe — Check-in</title>
        <meta name="robots" content="noindex,nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>
      <style>{`
        html,body,#root{height:100%}
        .av-root{--bg:#1a0d2e;--surface:rgba(255,255,255,0.06);--surface2:rgba(255,255,255,0.09);--accent:#c47ad9;--accent2:#8b3fbf;--gold:#ffd700;--text:#f5ecff;--muted:#bca8d9;--border:rgba(255,255,255,0.12);background:radial-gradient(ellipse at top,#3a1857 0%,#1a0d2e 50%,#0f0820 100%);color:var(--text);font-family:'Barlow',sans-serif;height:100vh;overflow:hidden;position:relative}
        .av-root::before{content:"";position:absolute;top:-20%;left:-10%;width:60%;height:80%;background:radial-gradient(circle,rgba(196,122,217,0.25),transparent 70%);pointer-events:none}
        .av-root::after{content:"";position:absolute;bottom:-20%;right:-10%;width:60%;height:80%;background:radial-gradient(circle,rgba(139,63,191,0.25),transparent 70%);pointer-events:none}
        .av-root *{box-sizing:border-box}
        .av-container{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:1rem 1.25rem;height:100vh;display:flex;flex-direction:column;gap:.75rem}
        .av-header{text-align:center;flex-shrink:0}
        .av-logo{font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,4.5vw,3rem);letter-spacing:4px;line-height:1;background:linear-gradient(135deg,#d99ee6 0%,#a266d9 50%,#ffd1ec 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .av-sub{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;letter-spacing:5px;text-transform:uppercase;color:#bca8d9;margin-top:2px}
        .av-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;flex:1;min-height:0}
        .av-col{display:flex;flex-direction:column;gap:.75rem;min-height:0}
        .av-panel{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:.9rem 1.1rem;backdrop-filter:blur(12px)}
        .av-ptitle{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;letter-spacing:3px;text-transform:uppercase;color:#bca8d9}
        .av-profile{display:flex;gap:.6rem;align-items:end;flex-wrap:wrap}
        .av-profile-field{flex:1;min-width:160px}
        .av-label{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:#bca8d9;margin-bottom:3px;display:block}
        .av-input{width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:.5rem .8rem;color:#f5ecff;font-family:'Barlow',sans-serif;font-size:.92rem;outline:none}
        .av-input:focus{border-color:#c47ad9;background:rgba(255,255,255,0.12)}
        .av-save{font-family:'Barlow Condensed',sans-serif;font-size:.9rem;letter-spacing:2px;text-transform:uppercase;background:linear-gradient(135deg,#8b3fbf,#c47ad9);color:#fff;border:none;border-radius:8px;padding:.55rem 1.2rem;cursor:pointer;font-weight:600}
        .av-save:hover{filter:brightness(1.1)}
        .av-coins-inline{display:flex;align-items:center;gap:.55rem;padding:.45rem .8rem;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.25);border-radius:10px}
        .av-camt{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:#ffd700;line-height:1;letter-spacing:1.5px}
        .av-ctag{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;letter-spacing:1.5px;text-transform:uppercase;color:#bca8d9}
        .av-wheel-panel{display:flex;flex-direction:column;align-items:center;gap:.55rem;flex:1;min-height:0;justify-content:flex-start;overflow-y:auto}
        .av-wheel-panel::-webkit-scrollbar{width:6px}
        .av-wheel-panel::-webkit-scrollbar-thumb{background:rgba(196,122,217,0.4);border-radius:3px}
        .av-rules{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:.55rem .8rem;margin-top:.2rem}
        .av-rules-title{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;letter-spacing:2.5px;text-transform:uppercase;color:#d99ee6;margin-bottom:.35rem}
        .av-rules-list{margin:0;padding-left:1.1rem;font-family:'Barlow',sans-serif;font-size:.74rem;line-height:1.35;color:#e5d8f5;display:flex;flex-direction:column;gap:.15rem}
        .av-rules-list strong{color:#ffd700}
        .av-rules-note{margin-top:.4rem;font-family:'Barlow Condensed',sans-serif;font-size:.7rem;letter-spacing:1px;color:#bca8d9;text-align:center}
        .av-wrap{position:relative;width:min(280px,38vh);aspect-ratio:1}
        .av-pointer{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:20px solid #ffd700;filter:drop-shadow(0 0 8px rgba(255,215,0,.7));z-index:10}
        .av-wrap canvas{width:100%;height:100%;border-radius:50%;display:block;box-shadow:0 0 40px rgba(196,122,217,0.35),0 0 80px rgba(139,63,191,0.2)}
        .av-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:#1a0d2e;border:3px solid #ffd700;z-index:5}
        .av-spin{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:3px;background:linear-gradient(135deg,#c47ad9,#8b3fbf);color:#fff;border:none;border-radius:50px;padding:.55rem 2.5rem;cursor:pointer;box-shadow:0 4px 20px rgba(196,122,217,0.4)}
        .av-spin:disabled{opacity:.4;cursor:not-allowed}
        .av-result{text-align:center;padding:.5rem 1rem;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);min-height:42px;display:flex;align-items:center;justify-content:center;gap:.6rem;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;letter-spacing:1.5px}
        .av-result.flash{animation:av-pulse .7s ease}
        .av-rval{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:#ffd700;letter-spacing:1.5px}
        @keyframes av-pulse{0%{box-shadow:0 0 0 0 rgba(255,215,0,.6)}70%{box-shadow:0 0 0 18px rgba(255,215,0,0)}100%{box-shadow:0 0 0 0 rgba(255,215,0,0)}}
        .av-rank{display:flex;flex-direction:column;min-height:0;flex:1}
        .av-rhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;flex-shrink:0}
        .av-rlist{overflow-y:auto;flex:1;padding-right:.3rem;display:flex;flex-direction:column;gap:.35rem}
        .av-rlist::-webkit-scrollbar{width:6px}
        .av-rlist::-webkit-scrollbar-thumb{background:rgba(196,122,217,0.4);border-radius:3px}
        .av-ritem{display:grid;grid-template-columns:30px 1fr auto auto;align-items:center;gap:.7rem;background:rgba(255,255,255,0.05);border-radius:8px;padding:.5rem .8rem;border:1px solid rgba(255,255,255,0.08)}
        .av-ritem.me{border-color:rgba(255,215,0,0.4);background:rgba(255,215,0,0.06)}
        .av-rpos{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;text-align:center;color:#bca8d9}
        .av-rpos.gold{color:#ffd700}.av-rpos.silver{color:#e0d0f0}.av-rpos.bronze{color:#d99e6c}
        .av-rname{font-family:'Barlow Condensed',sans-serif;font-size:.95rem;font-weight:600;letter-spacing:.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .av-rstreak{font-size:.7rem;color:#bca8d9;font-family:'Barlow Condensed',sans-serif}
        .av-rcoins{font-family:'Bebas Neue',sans-serif;font-size:1.05rem;color:#ffd700;letter-spacing:1px;text-align:right}
        .av-empty{text-align:center;color:#bca8d9;font-family:'Barlow Condensed',sans-serif;padding:1.5rem 0;font-size:.9rem}
        .av-toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%) translateY(6px);background:#3a1857;border:1px solid #c47ad9;border-radius:50px;padding:.6rem 1.6rem;font-family:'Barlow Condensed',sans-serif;font-size:.9rem;letter-spacing:2px;text-transform:uppercase;color:#f5ecff;opacity:0;transition:opacity .3s,transform .3s;z-index:100;pointer-events:none;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.4)}
        .av-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        @media(max-width:768px){.av-grid{grid-template-columns:1fr;overflow-y:auto}.av-root{overflow-y:auto;height:auto;min-height:100vh}.av-container{height:auto}}
      `}</style>
      <div className="av-root">
        <div className="av-container">
          <header className="av-header">
            <div className="av-logo">ALTA VIBE</div>
            <div className="av-sub">Check-in Diário · Gira &amp; Ganha</div>
          </header>

          <div className="av-grid">
            <div className="av-col">
              <div className="av-panel">
                <div className="av-ptitle" style={{ marginBottom: ".5rem" }}>Seu perfil</div>
                <div className="av-profile">
                  <div className="av-profile-field">
                    <label className="av-label" htmlFor="av-name">Apelido</label>
                    <input
                      id="av-name"
                      className="av-input"
                      type="text"
                      maxLength={20}
                      placeholder="Ex: DjVibeKing"
                      autoComplete="off"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                    />
                  </div>
                  <button className="av-save" onClick={saveProfile}>Entrar</button>
                  {me && (
                    <div className="av-coins-inline">
                      <span style={{ fontSize: "1.1rem" }}>⚡</span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className="av-camt">{(me.coins || 0).toLocaleString("pt-BR")}</span>
                        <span className="av-ctag">VC · {me.streak || 0}🔥</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="av-panel av-wheel-panel">
                <div className="av-wrap">
                  <div className="av-pointer" aria-hidden="true" />
                  <canvas ref={canvasRef} width={320} height={320} />
                  <div className="av-center" aria-hidden="true" />
                </div>
                <button className="av-spin" onClick={spinWheel} disabled={alreadySpun || !me}>
                  {alreadySpun ? "VOLTA AMANHÃ" : "GIRAR"}
                </button>
                <div className={`av-result${flash ? " flash" : ""}`}>
                  {result ? (
                    <>
                      <span>Ganhou</span>
                      <span className="av-rval">+{result.total} VC</span>
                      {result.bonus > 0 && <span style={{ color: "#d99ee6" }}>(+{result.bonus} streak)</span>}
                    </>
                  ) : (
                    <span style={{ color: "#bca8d9" }}>Seu prêmio aparece aqui</span>
                  )}
                </div>
                <div className="av-rules">
                  <div className="av-rules-title">📋 Regras</div>
                  <ol className="av-rules-list">
                    <li>Usar o mesmo nome de cadastro todos os dias para acumular.</li>
                    <li>Vale apenas <strong>um giro por dia</strong>.</li>
                    <li>Período: <strong>05/06/2026 a 15/06/2026</strong> (10 dias).</li>
                    <li>Prêmios: <strong>1º 1500x</strong> · <strong>2º 1000x</strong> · <strong>3º 500x</strong>.</li>
                    <li>Cadastros duplicados: vale apenas o de maior valor acumulado.</li>
                  </ol>
                  <div className="av-rules-note">⚠️ A roleta entrega VibeCoins aleatoriamente de 5 a 50 VC.</div>
                </div>

              </div>
            </div>

            <div className="av-col">
              <div className="av-panel av-rank">
                <div className="av-rhead">
                  <div className="av-ptitle">⚡ Ranking Geral</div>
                  <div className="av-ctag">{ranking.length} ouvinte{ranking.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="av-rlist">
                  {ranking.length === 0 ? (
                    <div className="av-empty">Ninguém girou ainda — seja o primeiro! 🎯</div>
                  ) : (
                    ranking.map((u, i) => {
                      const cls = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
                      return (
                        <div key={u.id} className={`av-ritem${me && u.id === me.id ? " me" : ""}`}>
                          <div className={`av-rpos ${cls}`}>{i + 1}</div>
                          <div className="av-rname">{u.name}</div>
                          <div className="av-rstreak">{u.streak || 0}🔥</div>
                          <div className="av-rcoins">{(u.coins || 0).toLocaleString("pt-BR")} VC</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`av-toast${toast ? " show" : ""}`}>{toast}</div>
      </div>
    </>
  );
};

export default AltaVibe;
