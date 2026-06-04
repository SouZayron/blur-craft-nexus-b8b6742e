import { useEffect, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const PRIZES = [
  { label: "50 VC", coins: 50, color: "#ff2d55", text: "#fff" },
  { label: "10 VC", coins: 10, color: "#1c1c2e", text: "#aaa" },
  { label: "100 VC", coins: 100, color: "#ff6b00", text: "#fff" },
  { label: "20 VC", coins: 20, color: "#1c1c2e", text: "#aaa" },
  { label: "500 VC", coins: 500, color: "#ffd700", text: "#000" },
  { label: "30 VC", coins: 30, color: "#ff2d55", text: "#fff" },
  { label: "75 VC", coins: 75, color: "#ff6b00", text: "#fff" },
  { label: "5 VC", coins: 5, color: "#1c1c2e", text: "#666" },
];

const SEG = (2 * Math.PI) / PRIZES.length;
const TODAY = () => new Date().toISOString().split("T")[0];
const YESTERDAY = () => new Date(Date.now() - 86400000).toISOString().split("T")[0];
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
  const [result, setResult] = useState<{ total: number; bonus: number } | null>(null);
  const [toast, setToast] = useState("");
  const [flash, setFlash] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 260, 260);
    const cx = 130, cy = 130, r = 126;
    PRIZES.forEach((p, i) => {
      const start = angle + i * SEG - Math.PI / 2;
      const end = start + SEG;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
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
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  useEffect(() => { drawWheel(0); }, [drawWheel]);

  const loadRanking = useCallback(async () => {
    const { data } = await supabase
      .from("altavibe_users")
      .select("*")
      .order("coins", { ascending: false })
      .limit(20);
    if (data) setRanking(data as User[]);
  }, []);

  useEffect(() => {
    loadRanking();
    const ch = supabase
      .channel("altavibe_users_ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_users" }, () => loadRanking())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadRanking]);

  // Auto-login from localStorage
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
    const { data: existing } = await supabase.from("altavibe_users").select("*").eq("name", name).maybeSingle();
    let user: User;
    if (existing) {
      user = existing as User;
    } else {
      const { data: created, error } = await supabase
        .from("altavibe_users")
        .insert({ name, coins: 0, streak: 0, last_spin: null })
        .select()
        .single();
      if (error || !created) { showToast("Erro ao criar perfil"); return; }
      user = created as User;
    }
    setMe(user);
    localStorage.setItem(LS_NAME, name);
    showToast(`Bem-vindo, ${name}! 🎉`);
    loadRanking();
  };

  const spinWheel = () => {
    if (spinningRef.current) return;
    if (!me) { showToast("Salva seu apelido primeiro! 👆"); return; }
    if (me.last_spin === TODAY()) { showToast("Já girou hoje! Volta amanhã 🌙"); return; }

    spinningRef.current = true;
    const winIdx = Math.floor(Math.random() * PRIZES.length);
    const extraRot = 6 * 2 * Math.PI;
    const target = extraRot + (2 * Math.PI - winIdx * SEG - SEG / 2);
    const duration = 4000;
    const start = performance.now();
    const startAngle = angleRef.current;
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);

    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      angleRef.current = startAngle + target * ease(progress);
      drawWheel(angleRef.current);
      if (progress < 1) requestAnimationFrame(frame);
      else finishSpin(winIdx);
    };
    requestAnimationFrame(frame);
  };

  const finishSpin = async (winIdx: number) => {
    if (!me) return;
    const prize = PRIZES[winIdx];
    const newStreak = me.last_spin === YESTERDAY() ? (me.streak || 0) + 1 : 1;
    let bonus = 0;
    if (newStreak >= 7) bonus = Math.round(prize.coins * 0.5);
    else if (newStreak >= 3) bonus = Math.round(prize.coins * 0.2);
    const total = prize.coins + bonus;
    const newCoins = (me.coins || 0) + total;

    const { data, error } = await supabase
      .from("altavibe_users")
      .update({ coins: newCoins, streak: newStreak, last_spin: TODAY() })
      .eq("id", me.id)
      .select()
      .single();

    spinningRef.current = false;
    if (error || !data) { showToast("Erro ao salvar"); return; }
    setMe(data as User);
    setResult({ total, bonus });
    setFlash(true);
    setTimeout(() => setFlash(false), 800);
    showToast(bonus > 0 ? `🔥 Streak ${newStreak} dias! Bônus +${bonus} VC` : `⚡ +${prize.coins} VibeCoins!`);
    loadRanking();
  };

  const alreadySpun = me?.last_spin === TODAY();

  return (
    <>
      <Helmet>
        <title>Alta Vibe — Check-in</title>
        <meta name="robots" content="noindex,nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>
      <style>{`
        .av-root{--bg:#0a0a0f;--surface:#111118;--surface2:#1a1a26;--accent:#ff2d55;--accent2:#ff6b00;--gold:#ffd700;--silver:#c0c0c0;--bronze:#cd7f32;--text:#f0f0f0;--muted:#888;--border:rgba(255,255,255,0.08);background:var(--bg);color:var(--text);font-family:'Barlow',sans-serif;min-height:100vh;overflow-x:hidden;position:relative}
        .av-root *{box-sizing:border-box}
        .av-container{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:2rem 1rem 4rem}
        .av-logo{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.8rem,8vw,5rem);letter-spacing:4px;line-height:1;background:linear-gradient(135deg,#ff2d55 0%,#ff6b00 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center}
        .av-sub{font-family:'Barlow Condensed',sans-serif;font-size:1rem;letter-spacing:6px;text-transform:uppercase;color:#888;margin-top:4px;text-align:center;margin-bottom:2.5rem}
        .av-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start}
        @media(max-width:640px){.av-grid{grid-template-columns:1fr}}
        .av-panel{background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:1.5rem}
        .av-wheel-panel{display:flex;flex-direction:column;align-items:center;gap:1.2rem}
        .av-ptitle{font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;letter-spacing:3px;text-transform:uppercase;color:#888}
        .av-wrap{position:relative;width:260px;height:260px}
        .av-pointer{position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:22px solid #ff2d55;filter:drop-shadow(0 0 6px #ff2d55);z-index:10}
        .av-wrap canvas{border-radius:50%;display:block;box-shadow:0 0 40px rgba(255,45,85,0.2),0 0 80px rgba(255,107,0,0.1)}
        .av-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:38px;height:38px;border-radius:50%;background:#0a0a0f;border:3px solid #ff2d55;z-index:5}
        .av-spin{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:3px;background:linear-gradient(135deg,#ff2d55,#ff6b00);color:#fff;border:none;border-radius:50px;padding:.65rem 2.5rem;cursor:pointer;box-shadow:0 4px 20px rgba(255,45,85,0.4);width:100%}
        .av-spin:disabled{opacity:.45;cursor:not-allowed}
        .av-result{width:100%;text-align:center;padding:.8rem 1rem;border-radius:12px;background:#1a1a26;border:1px solid rgba(255,255,255,0.08);min-height:56px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px}
        .av-result.flash{animation:av-pulse .7s ease}
        @keyframes av-pulse{0%{box-shadow:0 0 0 0 rgba(255,215,0,.6)}70%{box-shadow:0 0 0 18px rgba(255,215,0,0)}100%{box-shadow:0 0 0 0 rgba(255,215,0,0)}}
        .av-rlabel{font-family:'Barlow Condensed',sans-serif;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;color:#888}
        .av-rval{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:#ffd700;letter-spacing:2px}
        .av-cd{font-family:'Barlow Condensed',sans-serif;font-size:.85rem;color:#888;letter-spacing:1px;text-align:center}
        .av-right{display:flex;flex-direction:column;gap:1.2rem}
        .av-label{font-family:'Barlow Condensed',sans-serif;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:3px;display:block}
        .av-input{width:100%;background:#1a1a26;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:.6rem .9rem;color:#f0f0f0;font-family:'Barlow',sans-serif;font-size:.95rem;outline:none}
        .av-input:focus{border-color:#ff2d55}
        .av-save{font-family:'Barlow Condensed',sans-serif;font-size:1rem;letter-spacing:2px;text-transform:uppercase;background:transparent;color:#ff2d55;border:1px solid #ff2d55;border-radius:8px;padding:.55rem 1rem;cursor:pointer;margin-top:.8rem;width:100%}
        .av-save:hover{background:#ff2d55;color:#fff}
        .av-coins{display:flex;align-items:center;gap:.8rem;background:#1a1a26;border-radius:12px;padding:.9rem 1.2rem;border:1px solid rgba(255,255,255,0.08)}
        .av-camt{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#ffd700;line-height:1;letter-spacing:2px}
        .av-ctag{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;letter-spacing:2px;text-transform:uppercase;color:#888}
        .av-rank{grid-column:1 / -1}
        .av-rhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem}
        .av-ritem{display:grid;grid-template-columns:36px 1fr auto auto;align-items:center;gap:.8rem;background:#1a1a26;border-radius:10px;padding:.7rem 1rem;border:1px solid rgba(255,255,255,0.08);margin-bottom:.5rem}
        .av-ritem.me{border-color:rgba(255,45,85,0.35);background:rgba(255,45,85,0.05)}
        .av-rpos{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;text-align:center;color:#888}
        .av-rpos.gold{color:#ffd700}.av-rpos.silver{color:#c0c0c0}.av-rpos.bronze{color:#cd7f32}
        .av-rname{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:600;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .av-rstreak{font-size:.75rem;color:#888;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px}
        .av-rcoins{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:#ffd700;letter-spacing:1px;text-align:right}
        .av-toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(6px);background:#111118;border:1px solid #ff2d55;border-radius:50px;padding:.7rem 1.8rem;font-family:'Barlow Condensed',sans-serif;font-size:1rem;letter-spacing:2px;text-transform:uppercase;color:#f0f0f0;opacity:0;transition:opacity .3s,transform .3s;z-index:100;pointer-events:none;white-space:nowrap}
        .av-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
      `}</style>
      <div className="av-root">
        <div className="av-container">
          <header>
            <div className="av-logo">ALTA VIBE</div>
            <div className="av-sub">Check-in Diário · Gira &amp; Ganha</div>
          </header>

          <div className="av-grid">
            <div className="av-panel av-wheel-panel">
              <div className="av-ptitle">Roleta de hoje</div>
              <div className="av-wrap">
                <div className="av-pointer" aria-hidden="true" />
                <canvas ref={canvasRef} width={260} height={260} />
                <div className="av-center" aria-hidden="true" />
              </div>
              <button className="av-spin" onClick={spinWheel} disabled={alreadySpun}>GIRAR</button>
              <div className={`av-result${flash ? " flash" : ""}`}>
                {result ? (
                  <>
                    <span className="av-rlabel">Você ganhou</span>
                    <span className="av-rval">+{result.total} VC ⚡{result.bonus > 0 && <small style={{ fontSize: ".9rem", color: "#ff6b00" }}> +{result.bonus} streak</small>}</span>
                  </>
                ) : (
                  <span className="av-rlabel">Seu prêmio aparece aqui</span>
                )}
              </div>
              {alreadySpun && <div className="av-cd">✅ Check-in feito! Volta amanhã.</div>}
            </div>

            <div className="av-right">
              <div className="av-panel">
                <div className="av-ptitle" style={{ marginBottom: ".9rem" }}>Seu perfil</div>
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
                <button className="av-save" onClick={saveProfile}>Salvar &amp; Entrar</button>
              </div>
              {me && (
                <div className="av-coins">
                  <div style={{ fontSize: "1.8rem" }} aria-hidden="true">⚡</div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="av-camt">{(me.coins || 0).toLocaleString("pt-BR")}</div>
                    <div className="av-ctag">VibeCoins · Streak {me.streak || 0}🔥</div>
                  </div>
                </div>
              )}
            </div>

            <div className="av-panel av-rank">
              <div className="av-rhead">
                <div className="av-ptitle">⚡ Ranking Geral</div>
                <div className="av-ctag">{ranking.length} ouvinte{ranking.length !== 1 ? "s" : ""}</div>
              </div>
              {ranking.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888", fontFamily: "'Barlow Condensed',sans-serif", padding: "1.5rem 0" }}>
                  Ninguém girou ainda — seja o primeiro! 🎯
                </div>
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
        <div className={`av-toast${toast ? " show" : ""}`}>{toast}</div>
      </div>
    </>
  );
};

export default AltaVibe;
