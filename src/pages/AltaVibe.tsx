import { useEffect, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const PRIZES = [
  { label: "5", coins: 5, color: "#b59ad6", text: "#1a0d2e" },
  { label: "10", coins: 10, color: "#7a4bcc", text: "#fff" },
  { label: "20", coins: 20, color: "#d99ee6", text: "#1a0d2e" },
  { label: "30", coins: 30, color: "#5a2e9e", text: "#fff" },
  { label: "40", coins: 40, color: "#c47ad9", text: "#1a0d2e" },
  { label: "50", coins: 50, color: "#8b3fbf", text: "#fff" },
  { label: "BOOST", coins: 0, color: "#ffd700", text: "#3a1857" },
];

const SEG = (2 * Math.PI) / PRIZES.length;
const LS_NAME = "altavibe_current_name";
const LS_PASS = "altavibe_current_pass";

type User = {
  id: string;
  name: string;
  coins: number;
  streak: number;
  last_spin: string | null;
};

type LogRow = {
  id: string;
  name: string;
  prize: number;
  bonus: number;
  total: number;
  is_boost: boolean;
  created_at: string;
};

const AltaVibe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const spinningRef = useRef(false);
  const [nameInput, setNameInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [me, setMe] = useState<User | null>(null);
  const [ranking, setRanking] = useState<User[]>([]);
  const [result, setResult] = useState<{ total: number; bonus: number; prize: number; boost: boolean } | null>(null);
  const [toast, setToast] = useState("");
  const [flash, setFlash] = useState(false);
  const [gameOpen, setGameOpen] = useState(true);
  const [extraSpin, setExtraSpin] = useState(false);
  const [logs, setLogs] = useState<LogRow[]>([]);

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
      .select("id,name,coins,streak,last_spin")
      .order("coins", { ascending: false })
      .limit(50);
    if (data) setRanking(data as User[]);
  }, []);

  const loadLogs = useCallback(async () => {
    const { data } = await supabase
      .from("altavibe_logs")
      .select("id,name,prize,bonus,total,is_boost,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setLogs(data as LogRow[]);
  }, []);

  useEffect(() => {
    loadRanking();
    loadLogs();
    supabase.from("altavibe_settings").select("is_open").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setGameOpen(!!data.is_open);
    });
    const ch = supabase
      .channel("altavibe_users_ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_users" }, (payload) => {
        loadRanking();
        if (payload.eventType === "DELETE") {
          const oldRow = payload.old as { id?: string } | null;
          setMe((curr) => {
            if (curr && oldRow?.id && curr.id === oldRow.id) {
              localStorage.removeItem(LS_NAME);
              localStorage.removeItem(LS_PASS);
              return null;
            }
            return curr;
          });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_settings" }, (payload) => {
        const row = (payload.new || payload.old) as { is_open?: boolean } | null;
        if (row && typeof row.is_open === "boolean") setGameOpen(row.is_open);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_logs" }, () => loadLogs())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadRanking, loadLogs]);

  useEffect(() => {
    const savedName = localStorage.getItem(LS_NAME);
    const savedPass = localStorage.getItem(LS_PASS);
    if (savedName) setNameInput(savedName);
    if (savedPass) setPassInput(savedPass);
    if (savedName && savedPass) {
      supabase.rpc("altavibe_login", { p_name: savedName, p_password: savedPass }).then(({ data }) => {
        if (data) setMe(data as User);
      });
    }
  }, []);

  const saveProfile = async () => {
    const name = nameInput.trim().slice(0, 20);
    const pass = passInput.trim();
    if (!name) { showToast("Coloca um apelido! 😤"); return; }
    if (!/^\d{4}$/.test(pass)) { showToast("Senha de 4 dígitos numéricos 🔢"); return; }
    const { data, error } = await supabase.rpc("altavibe_login", { p_name: name, p_password: pass });
    if (error || !data) {
      const msg = error?.message || "";
      if (msg.includes("wrong_password")) showToast("Senha incorreta 🔒");
      else if (msg.includes("invalid_password")) showToast("Senha inválida (4 dígitos)");
      else if (msg.includes("invalid_name")) showToast("Apelido inválido");
      else showToast("Erro ao entrar");
      return;
    }
    setMe(data as User);
    localStorage.setItem(LS_NAME, name);
    localStorage.setItem(LS_PASS, pass);
    showToast(`Bem-vindo, ${name}! 🎉`);
    loadRanking();
  };

  const audioCtxRef = useRef<AudioContext | null>(null);
  const getAudio = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      if (!Ctx) return null;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playTick = () => {
    const ctx = getAudio(); if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(880, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + 0.07);
  };

  const playCoins = () => {
    const ctx = getAudio(); if (!ctx) return;
    const base = ctx.currentTime;
    const notes = [
      { f: 1320, t: 0 }, { f: 1760, t: 0.07 }, { f: 1480, t: 0.14 },
      { f: 1980, t: 0.22 }, { f: 2200, t: 0.32 }, { f: 1760, t: 0.42 },
      { f: 2640, t: 0.52 },
    ];
    notes.forEach(({ f, t }) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, base + t);
      g.gain.setValueAtTime(0.0001, base + t);
      g.gain.exponentialRampToValueAtTime(0.18, base + t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, base + t + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(base + t); o.stop(base + t + 0.3);
    });
    // shimmer noise
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const ng = ctx.createGain();
    ng.gain.value = 0.05;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 3000;
    src.connect(hp).connect(ng).connect(ctx.destination);
    src.start(base);
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
    let lastSeg = -1;
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      angleRef.current = startAngle + delta * ease(progress);
      drawWheel(angleRef.current);
      const segIdx = Math.floor((angleRef.current / SEG)) % PRIZES.length;
      if (segIdx !== lastSeg) { lastSeg = segIdx; playTick(); }
      if (progress < 1) requestAnimationFrame(frame);
      else onDone();
    };
    requestAnimationFrame(frame);
  };

  const spinWheel = async () => {
    if (spinningRef.current) return;
    if (!me) { showToast("Faça login primeiro! 👆"); return; }
    if (!gameOpen) { showToast("Game fechado no momento 🔒"); return; }
    spinningRef.current = true;

    const { data, error } = await supabase.rpc("altavibe_spin", { p_name: me.name });
    if (error || !data) {
      spinningRef.current = false;
      const msg = error?.message || "";
      if (msg.includes("already_spun_today")) showToast("Já girou hoje! Volta amanhã 🌙");
      else if (msg.includes("game_closed")) showToast("Game fechado no momento 🔒");
      else showToast("Erro ao girar");
      return;
    }
    const res = data as { win_index: number; prize: number; bonus: number; total: number; streak: number; coins: number; last_spin: string | null; is_boost: boolean };
    animateTo(res.win_index, () => {
      spinningRef.current = false;
      setMe((prev) => prev ? { ...prev, coins: res.coins, streak: res.streak, last_spin: res.last_spin } : prev);
      setResult({ total: res.total, bonus: res.bonus, prize: res.prize, boost: !!res.is_boost });
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
      if (res.is_boost) {
        setExtraSpin(true);
        playCoins();
        showToast("🚀 BOOST! Você ganhou um giro extra!");
      } else {
        setExtraSpin(false);
        playCoins();
        showToast(res.bonus > 0 ? `🔥 Streak ${res.streak}d! Bônus +${res.bonus} Vibecoins` : `⚡ +${res.prize} Vibecoins!`);
      }
      loadRanking();
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const alreadySpun = me?.last_spin === today && !extraSpin;
  const spinDisabled = !me || !gameOpen || (alreadySpun && !extraSpin);
  const spinLabel = !gameOpen ? "GAME FECHADO" : extraSpin ? "GIRAR (BOOST)" : alreadySpun ? "VOLTA AMANHÃ" : "GIRAR";

  return (
    <>
      <Helmet>
        <title>Alta Vibe — Check-in</title>
        <meta name="robots" content="noindex,nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>
      <style>{`
        html,body,#root{height:100%}
        .av-root{--text:#f5ecff;color:var(--text);background:radial-gradient(ellipse at top,#3a1857 0%,#1a0d2e 50%,#0f0820 100%);font-family:'Barlow',sans-serif;height:100vh;overflow:hidden;position:relative}
        .av-root::before{content:"";position:absolute;top:-20%;left:-10%;width:60%;height:80%;background:radial-gradient(circle,rgba(196,122,217,0.25),transparent 70%);pointer-events:none}
        .av-root::after{content:"";position:absolute;bottom:-20%;right:-10%;width:60%;height:80%;background:radial-gradient(circle,rgba(139,63,191,0.25),transparent 70%);pointer-events:none}
        .av-root *{box-sizing:border-box}
        .av-container{position:relative;z-index:1;max-width:1280px;margin:0 auto;padding:.7rem 1.1rem;height:100vh;display:flex;flex-direction:column;gap:.55rem}
        .av-header{text-align:center;flex-shrink:0}
        .av-logo{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.7rem,3.6vw,2.4rem);letter-spacing:4px;line-height:1;background:linear-gradient(135deg,#d99ee6 0%,#a266d9 50%,#ffd1ec 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .av-sub{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;letter-spacing:5px;text-transform:uppercase;color:#bca8d9;margin-top:2px}
        .av-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:.85rem;flex:1;min-height:0}
        .av-col{display:flex;flex-direction:column;gap:.55rem;min-height:0}
        .av-col-left{display:grid;grid-template-rows:auto auto 1fr;gap:.55rem;min-height:0}
        .av-logs{display:flex;flex-direction:column;min-height:0;padding:.55rem .75rem}
        .av-logs-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.35rem;flex-shrink:0}
        .av-logs-list{overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.2rem;padding-right:.3rem}
        .av-logs-list::-webkit-scrollbar{width:6px}
        .av-logs-list::-webkit-scrollbar-thumb{background:rgba(196,122,217,0.4);border-radius:3px}
        .av-log-row{display:grid;grid-template-columns:1fr auto auto auto;gap:.55rem;align-items:center;font-family:'Barlow Condensed',sans-serif;font-size:.72rem;padding:.25rem .5rem;border-radius:5px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)}
        .av-log-row.boost{background:rgba(255,215,0,0.08);border-color:rgba(255,215,0,0.25)}
        .av-log-name{font-weight:600;color:#f5ecff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .av-log-date,.av-log-time{color:#bca8d9;letter-spacing:.5px}
        .av-log-pts{color:#ffd700;font-weight:700;letter-spacing:.5px}
        .av-panel{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:.7rem .9rem;backdrop-filter:blur(12px)}
        .av-ptitle{font-family:'Barlow Condensed',sans-serif;font-size:.74rem;letter-spacing:3px;text-transform:uppercase;color:#bca8d9}
        .av-profile{display:flex;gap:.5rem;align-items:end;flex-wrap:wrap}
        .av-profile-field{flex:1;min-width:120px}
        .av-profile-field.pw{flex:0 0 90px;min-width:80px}
        .av-label{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;letter-spacing:2px;text-transform:uppercase;color:#bca8d9;margin-bottom:2px;display:block}
        .av-input{width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:.45rem .7rem;color:#f5ecff;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none}
        .av-input:focus{border-color:#c47ad9;background:rgba(255,255,255,0.12)}
        .av-save{font-family:'Barlow Condensed',sans-serif;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;background:linear-gradient(135deg,#8b3fbf,#c47ad9);color:#fff;border:none;border-radius:8px;padding:.5rem 1rem;cursor:pointer;font-weight:600}
        .av-save:hover{filter:brightness(1.1)}
        .av-coins-inline{display:flex;align-items:center;gap:.5rem;padding:.35rem .65rem;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.25);border-radius:10px}
        .av-camt{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:#ffd700;line-height:1;letter-spacing:1.5px}
        .av-ctag{font-family:'Barlow Condensed',sans-serif;font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:#bca8d9}

        .av-rules-grid{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;min-height:0}
        .av-rules-box{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:.6rem .75rem;display:flex;flex-direction:column;min-height:0;overflow:hidden}
        .av-rules-title{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;letter-spacing:2.5px;text-transform:uppercase;color:#d99ee6;margin-bottom:.35rem}
        .av-rules-list{margin:0;padding-left:1rem;font-family:'Barlow',sans-serif;font-size:.7rem;line-height:1.3;color:#e5d8f5;display:flex;flex-direction:column;gap:.18rem;overflow-y:auto}
        .av-rules-list strong{color:#ffd700}
        .av-rules-list li.elim{color:#ffb0b0}
        .av-odds{display:flex;flex-direction:column;gap:.15rem;font-family:'Barlow Condensed',sans-serif;font-size:.72rem;color:#e5d8f5;overflow-y:auto}
        .av-odd-row{display:flex;justify-content:space-between;align-items:center;padding:.15rem .35rem;border-radius:5px;background:rgba(255,255,255,0.03)}
        .av-odd-row.boost{background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.25)}
        .av-odd-name{letter-spacing:.5px}
        .av-odd-pct{color:#ffd700;font-weight:600}

        .av-wheel-wrapper{display:flex;flex-direction:column;align-items:center;gap:.45rem;justify-content:center}
        .av-wrap{position:relative;width:min(230px,30vh);aspect-ratio:1}
        .av-pointer{position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:18px solid #ffd700;filter:drop-shadow(0 0 8px rgba(255,215,0,.7));z-index:10}
        .av-wrap canvas{width:100%;height:100%;border-radius:50%;display:block;box-shadow:0 0 40px rgba(196,122,217,0.35),0 0 80px rgba(139,63,191,0.2)}
        .av-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;background:#1a0d2e;border:3px solid #ffd700;z-index:5}
        .av-spin{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:3px;background:linear-gradient(135deg,#c47ad9,#8b3fbf);color:#fff;border:none;border-radius:50px;padding:.45rem 2rem;cursor:pointer;box-shadow:0 4px 20px rgba(196,122,217,0.4)}
        .av-spin:disabled{opacity:.4;cursor:not-allowed}
        .av-result{text-align:center;padding:.35rem .8rem;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);min-height:36px;display:flex;align-items:center;justify-content:center;gap:.5rem;font-family:'Barlow Condensed',sans-serif;font-size:.82rem;letter-spacing:1.3px}
        .av-result.flash{animation:av-pulse .7s ease}
        .av-rval{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:#ffd700;letter-spacing:1.5px}
        @keyframes av-pulse{0%{box-shadow:0 0 0 0 rgba(255,215,0,.6)}70%{box-shadow:0 0 0 18px rgba(255,215,0,0)}100%{box-shadow:0 0 0 0 rgba(255,215,0,0)}}

        .av-rank{display:flex;flex-direction:column;min-height:0;flex:1}
        .av-rhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;flex-shrink:0}
        .av-rlist{overflow-y:auto;flex:1;padding-right:.3rem;display:flex;flex-direction:column;gap:.28rem}
        .av-rlist::-webkit-scrollbar{width:6px}
        .av-rlist::-webkit-scrollbar-thumb{background:rgba(196,122,217,0.4);border-radius:3px}
        .av-ritem{display:grid;grid-template-columns:26px 1fr auto auto;align-items:center;gap:.55rem;background:rgba(255,255,255,0.05);border-radius:7px;padding:.38rem .65rem;border:1px solid rgba(255,255,255,0.08)}
        .av-ritem.me{border-color:rgba(255,215,0,0.4);background:rgba(255,215,0,0.06)}
        .av-rpos{font-family:'Bebas Neue',sans-serif;font-size:1rem;text-align:center;color:#bca8d9}
        .av-rpos.gold{color:#ffd700}.av-rpos.silver{color:#e0d0f0}.av-rpos.bronze{color:#d99e6c}
        .av-rname{font-family:'Barlow Condensed',sans-serif;font-size:.88rem;font-weight:600;letter-spacing:.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .av-rstreak{font-size:.65rem;color:#bca8d9;font-family:'Barlow Condensed',sans-serif}
        .av-rcoins{font-family:'Bebas Neue',sans-serif;font-size:.95rem;color:#ffd700;letter-spacing:.8px;text-align:right}
        .av-empty{text-align:center;color:#bca8d9;font-family:'Barlow Condensed',sans-serif;padding:1.2rem 0;font-size:.85rem}
        .av-toast{position:fixed;bottom:1.2rem;left:50%;transform:translateX(-50%) translateY(6px);background:#3a1857;border:1px solid #c47ad9;border-radius:50px;padding:.55rem 1.4rem;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;color:#f5ecff;opacity:0;transition:opacity .3s,transform .3s;z-index:100;pointer-events:none;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.4)}
        .av-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
        @media(max-width:880px){.av-grid{grid-template-columns:1fr;overflow-y:auto}.av-root{overflow-y:auto;height:auto;min-height:100vh}.av-container{height:auto}.av-rules-grid{grid-template-columns:1fr}}
      `}</style>
      <div className="av-root">
        <div className="av-container">
          <header className="av-header">
            <div className="av-logo">ALTA VIBE</div>
            <div className="av-sub">Check-in Diário · Gira &amp; Ganha Vibecoins</div>
          </header>

          <div className="av-grid">
            {/* LEFT: profile + rules */}
            <div className="av-col av-col-left">
              <div className="av-panel">
                <div className="av-ptitle" style={{ marginBottom: ".4rem" }}>Seu perfil</div>
                <div className="av-profile">
                  <div className="av-profile-field">
                    <label className="av-label" htmlFor="av-name">Nome</label>
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
                  <div className="av-profile-field pw">
                    <label className="av-label" htmlFor="av-pass">Senha (4 dígitos)</label>
                    <input
                      id="av-pass"
                      className="av-input"
                      type="password"
                      inputMode="numeric"
                      pattern="\d{4}"
                      maxLength={4}
                      placeholder="••••"
                      autoComplete="off"
                      value={passInput}
                      onChange={(e) => setPassInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    />
                  </div>
                  <button className="av-save" onClick={saveProfile}>Entrar</button>
                  {me && (
                    <div className="av-coins-inline">
                      <span style={{ fontSize: "1rem" }}>⚡</span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className="av-camt">{(me.coins || 0).toLocaleString("pt-BR")}</span>
                        <span className="av-ctag">Vibecoins · {me.streak || 0}🔥</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="av-rules-grid">
                <div className="av-rules-box">
                  <div className="av-rules-title">📋 Regras</div>
                  <ol className="av-rules-list">
                    <li>Usar o mesmo nome e senha todos os dias para acumular.</li>
                    <li>Vale apenas <strong>um giro por dia</strong>.</li>
                    <li>Período: <strong>05/06/2026 a 15/06/2026</strong>.</li>
                    <li>Prêmios: <strong>1º 1500x</strong> · <strong>2º 1000x</strong> · <strong>3º 500x</strong>.</li>
                    <li>Cadastros duplicados: vale apenas o de maior valor acumulado.</li>
                    <li className="elim">É necessário ser ativo no <strong>xat.com/altavibe</strong> (Eliminatória).</li>
                    <li className="elim">Fraudar a roleta (Eliminatória).</li>
                  </ol>
                </div>
                <div className="av-rules-box">
                  <div className="av-rules-title">🎯 Peso dos Ganhos</div>
                  <div className="av-odds">
                    <div className="av-odd-row boost"><span className="av-odd-name">🚀 1 Boost (giro extra)</span><span className="av-odd-pct">0,5% de chance</span></div>
                    <div className="av-odd-row"><span className="av-odd-name">50 Vibecoins</span><span className="av-odd-pct">1% de chance</span></div>
                    <div className="av-odd-row"><span className="av-odd-name">40 Vibecoins</span><span className="av-odd-pct">3% de chance</span></div>
                    <div className="av-odd-row"><span className="av-odd-name">30 Vibecoins</span><span className="av-odd-pct">5% de chance</span></div>
                    <div className="av-odd-row"><span className="av-odd-name">20 Vibecoins</span><span className="av-odd-pct">10% de chance</span></div>
                    <div className="av-odd-row"><span className="av-odd-name">10 Vibecoins</span><span className="av-odd-pct">20% de chance</span></div>
                    <div className="av-odd-row"><span className="av-odd-name">5 Vibecoins</span><span className="av-odd-pct">40% de chance</span></div>
                  </div>
                </div>
              </div>

              <div className="av-panel av-logs">
                <div className="av-logs-head">
                  <div className="av-ptitle">📡 Logs (tempo real)</div>
                  <div className="av-ctag">{logs.length} coleta{logs.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="av-logs-list">
                  {logs.length === 0 ? (
                    <div className="av-empty">Sem coletas ainda — gira a roleta! 🎯</div>
                  ) : (
                    logs.map((l) => {
                      const d = new Date(l.created_at);
                      const date = d.toLocaleDateString("pt-BR");
                      const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                      return (
                        <div key={l.id} className={`av-log-row${l.is_boost ? " boost" : ""}`}>
                          <span className="av-log-name">{l.name}</span>
                          <span className="av-log-date">{date}</span>
                          <span className="av-log-time">{time}</span>
                          <span className="av-log-pts">{l.is_boost ? "🚀 BOOST" : `+${l.total} VC`}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: wheel + ranking */}
            <div className="av-col">
              <div className="av-panel av-wheel-wrapper">
                <div className="av-wrap">
                  <div className="av-pointer" aria-hidden="true" />
                  <canvas ref={canvasRef} width={320} height={320} />
                  <div className="av-center" aria-hidden="true" />
                </div>
                <button className="av-spin" onClick={spinWheel} disabled={spinDisabled}>
                  {spinLabel}
                </button>
                <div className={`av-result${flash ? " flash" : ""}`}>
                  {result ? (
                    result.boost ? (
                      <><span>🚀</span><span className="av-rval">BOOST</span><span style={{ color: "#d99ee6" }}>(giro extra)</span></>
                    ) : (
                      <>
                        <span>Ganhou</span>
                        <span className="av-rval">+{result.total} Vibecoins</span>
                        {result.bonus > 0 && <span style={{ color: "#d99ee6" }}>(+{result.bonus} streak)</span>}
                      </>
                    )
                  ) : (
                    <span style={{ color: "#bca8d9" }}>Seu prêmio aparece aqui</span>
                  )}
                </div>
              </div>

              <div className="av-panel av-rank">
                <div className="av-rhead">
                  <div className="av-ptitle">⚡ Ranking</div>
                  <div className="av-ctag">{ranking.length} player{ranking.length !== 1 ? "s" : ""}</div>
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
                          <div className="av-rcoins">{(u.coins || 0).toLocaleString("pt-BR")}</div>
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
