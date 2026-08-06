import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const LS_NAME = "altavibe_current_name";
const LS_PASS = "altavibe_current_pass";
const LS_TERMS = "altavibe_terms_ago2026";

// Alguns navegadores mobile (modo privado / cookies bloqueados) lançam erro ao
// acessar localStorage, o que deixava a página em branco. Fallback em memória.
const memStore: Record<string, string> = {};
const lsGet = (k: string): string | null => {
  try { return window.lsGet(k); } catch { return k in memStore ? memStore[k] : null; }
};
const lsSet = (k: string, v: string) => {
  try { window.localStorage.setItem(k, v); } catch { memStore[k] = v; }
};
const lsRemove = (k: string) => {
  try { window.lsRemove(k); } catch { delete memStore[k]; }
};

const PRIZES = [
  { pos: "1º", name: "Nameflag", img: "https://xat.com/images/smw/nameflag.png" },
  { pos: "2º", name: "Angry", img: "https://xat.com/images/smw/angry.png" },
  { pos: "3º", name: "Romance", img: "https://xat.com/images/smw/romance.png" },
  { pos: "4º", name: "50 Days", img: "https://xat.com/images/smw/mint.png" },
  { pos: "5º", name: "20 Days", img: "https://xat.com/images/smw/mint.png" },
];
const MEDALS = ["🥇", "🥈", "🥉", "🏅", "🏅"];

type User = {
  id: string;
  name: string;
  coins: number;
  streak: number;
  last_spin: string | null;
  spins_today?: number;
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
  const [segments, setSegments] = useState<Segment[]>([]);
  const [streaks, setStreaks] = useState<StreakRule[]>([]);
  const [result, setResult] = useState<{ total: number; bonus: number; prize: number; label: string } | null>(null);
  const [toast, setToast] = useState("");
  const [flash, setFlash] = useState(false);
  const [gameOpen, setGameOpen] = useState(true);
  const [signupsLocked, setSignupsLocked] = useState(false);
  const [period, setPeriod] = useState({ start: "2026-08-05", end: "2026-08-31" });
  const [maxSpins, setMaxSpins] = useState(3);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [termsOk, setTermsOk] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [eliminated, setEliminated] = useState<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => {
    if (lsGet(LS_TERMS) === "1") setTermsOk(true);
  }, []);

  const totalWeight = useMemo(
    () => segments.reduce((a, s) => a + (Number(s.weight) > 0 ? Number(s.weight) : 0), 0),
    [segments],
  );

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    const list = segments.length ? segments : [];
    if (!list.length) return;
    const seg = (2 * Math.PI) / list.length;

    // outer glow ring
    const ring = ctx.createLinearGradient(0, 0, size, size);
    ring.addColorStop(0, "#ffd700");
    ring.addColorStop(0.5, "#c47ad9");
    ring.addColorStop(1, "#6d28d9");
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, 2 * Math.PI);
    ctx.strokeStyle = ring;
    ctx.lineWidth = 7;
    ctx.stroke();

    list.forEach((p, i) => {
      const start = angle + i * seg - Math.PI / 2;
      const end = start + seg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      const g = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
      g.addColorStop(0, p.color);
      g.addColorStop(1, p.points < 0 ? "#0f3d2a" : "#2a1240");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + seg / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,.6)";
      ctx.shadowBlur = 4;
      ctx.font = "bold 17px 'Barlow Condensed', sans-serif";
      ctx.fillText(p.label, r - 14, 6);
      ctx.restore();
    });

    // inner hub shading
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(15,8,32,.9)";
    ctx.fill();
  }, [segments]);

  useEffect(() => { drawWheel(angleRef.current); }, [drawWheel]);

  const loadRanking = useCallback(async () => {
    const { data } = await supabase
      .from("altavibe_users")
      .select("id,name,coins,streak,last_spin")
      .order("coins", { ascending: true })
      .limit(50);
    if (data) setRanking(data as User[]);
  }, []);

  // Quem não usou TODOS os giros em algum dia já encerrado é eliminado
  const loadEliminated = useCallback(async () => {
    const { data } = await supabase
      .from("altavibe_logs")
      .select("name,created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (!data) return;
    const counts = new Map<string, Map<string, number>>();
    (data as { name: string; created_at: string }[]).forEach((l) => {
      const day = new Date(l.created_at).toLocaleDateString("en-CA");
      const key = l.name.trim().toLowerCase();
      if (!counts.has(key)) counts.set(key, new Map());
      const m = counts.get(key)!;
      m.set(day, (m.get(day) || 0) + 1);
    });
    const today = new Date().toLocaleDateString("en-CA");
    const days: string[] = [];
    const d = new Date(`${period.start}T12:00:00`);
    while (true) {
      const iso = d.toLocaleDateString("en-CA");
      if (iso >= today || iso > period.end) break;
      days.push(iso);
      d.setDate(d.getDate() + 1);
    }
    const out = new Set<string>();
    counts.forEach((m, key) => {
      const firstDay = Array.from(m.keys()).sort()[0];
      const missed = days.some((day) => day >= firstDay && (m.get(day) || 0) < maxSpins);
      if (missed) out.add(key);
    });
    setEliminated(out);
  }, [period.start, period.end, maxSpins]);


  const loadLogs = useCallback(async () => {
    const { data } = await supabase
      .from("altavibe_logs")
      .select("id,name,prize,bonus,total,is_boost,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setLogs(data as LogRow[]);
  }, []);

  const loadConfig = useCallback(async () => {
    const [segRes, stRes, setRes] = await Promise.all([
      supabase.from("altavibe_segments").select("*").order("position"),
      supabase.from("altavibe_streak_rules").select("*").order("days"),
      supabase.from("altavibe_settings").select("is_open,signups_locked,start_date,end_date,max_spins_per_day,signup_deadline").eq("id", 1).maybeSingle(),
    ]);
    if (segRes.data) setSegments(segRes.data as Segment[]);
    if (stRes.data) setStreaks(stRes.data as StreakRule[]);
    if (setRes.data) {
      const d = setRes.data as { is_open: boolean; signups_locked: boolean; start_date: string; end_date: string; max_spins_per_day: number; signup_deadline: string };
      const todayLocal = new Date().toLocaleDateString("en-CA");
      setGameOpen(!!d.is_open);
      setSignupsLocked(!!d.signups_locked || (!!d.signup_deadline && todayLocal >= d.signup_deadline));
      setMaxSpins(d.max_spins_per_day || 3);
      setPeriod({ start: d.start_date, end: d.end_date });
    }
  }, []);

  useEffect(() => {
    loadRanking();
    loadLogs();
    loadConfig();
    const ch = supabase
      .channel("altavibe_ch_v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_users" }, (payload) => {
        loadRanking();
        if (payload.eventType === "DELETE") {
          const oldRow = payload.old as { id?: string } | null;
          setMe((curr) => {
            if (curr && oldRow?.id && curr.id === oldRow.id) {
              lsRemove(LS_NAME);
              lsRemove(LS_PASS);
              return null;
            }
            return curr;
          });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_settings" }, () => loadConfig())
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_segments" }, () => loadConfig())
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_streak_rules" }, () => loadConfig())
      .on("postgres_changes", { event: "*", schema: "public", table: "altavibe_logs" }, () => { loadLogs(); loadEliminated(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadRanking, loadLogs, loadConfig, loadEliminated]);

  useEffect(() => { loadEliminated(); }, [loadEliminated]);


  useEffect(() => {
    const savedName = lsGet(LS_NAME);
    const savedPass = lsGet(LS_PASS);
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
      else if (msg.includes("signups_locked")) showToast("Cadastros encerrados 🔒");
      else if (msg.includes("invalid_name")) showToast("Apelido inválido");
      else showToast("Erro ao entrar");
      return;
    }
    setMe(data as User);
    lsSet(LS_NAME, name);
    lsSet(LS_PASS, pass);
    showToast(`Bem-vindo, ${name}! 🎉`);
    loadRanking();
  };

  // Sempre busca o estado real do jogador no servidor (giros do dia, pontos, streak)
  const refreshMe = useCallback(async () => {
    const name = lsGet(LS_NAME);
    if (!name) return;
    const { data } = await supabase
      .from("altavibe_users")
      .select("id,name,coins,streak,last_spin,spins_today")
      .ilike("name", name.trim())
      .maybeSingle();
    if (data) setMe(data as User);
  }, []);

  // Fallback: se o socket realtime cair, mantém tudo atualizado por polling
  // e ao voltar o foco/aba. Não altera nenhum dado, só re-lê do servidor.
  useEffect(() => {
    const syncAll = () => {
      if (spinningRef.current) return;
      loadRanking();
      loadLogs();
      loadConfig();
      loadEliminated();
      refreshMe();
    };
    const id = window.setInterval(syncAll, 5000);
    const onFocus = () => syncAll();
    const onVis = () => { if (document.visibilityState === "visible") syncAll(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [loadRanking, loadLogs, loadConfig, loadEliminated, refreshMe]);




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
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + 0.07);
  };

  const playChime = (good: boolean) => {
    const ctx = getAudio(); if (!ctx) return;
    const base = ctx.currentTime;
    const notes = good ? [880, 1180, 1560] : [520, 400, 300];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, base + i * 0.1);
      g.gain.setValueAtTime(0.0001, base + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.16, base + i * 0.1 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, base + i * 0.1 + 0.28);
      o.connect(g).connect(ctx.destination);
      o.start(base + i * 0.1); o.stop(base + i * 0.1 + 0.3);
    });
  };

  const animateTo = (winIdx: number, onDone: () => void) => {
    const count = segments.length || 1;
    const seg = (2 * Math.PI) / count;
    const extraRot = 7 * 2 * Math.PI;
    const target = extraRot + (2 * Math.PI - winIdx * seg - seg / 2);
    const duration = 4200;
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
      const segIdx = Math.floor(angleRef.current / seg) % count;
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

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
    const { data, error } = await supabase.rpc("altavibe_spin_v2", { p_name: me.name, p_tz: tz });
    if (error || !data) {
      spinningRef.current = false;
      const msg = error?.message || "";
      if (msg.includes("already_spun_today")) showToast(`Você já usou seus ${maxSpins} giros de hoje! Volta amanhã 🌙`);
      else if (msg.includes("game_not_started")) showToast("Game ainda não começou ⏳");
      else if (msg.includes("game_ended")) showToast("Game encerrado 🏁");
      else if (msg.includes("game_closed")) showToast("Game fechado no momento 🔒");
      else showToast("Erro ao girar");
      refreshMe();
      return;
    }
    const res = data as unknown as { win_index: number; label: string; prize: number; bonus: number; total: number; streak: number; coins: number; last_spin: string | null; spins_today: number; spins_left: number };
    animateTo(res.win_index, () => {
      spinningRef.current = false;
      setMe((prev) => prev ? { ...prev, coins: res.coins, streak: res.streak, last_spin: res.last_spin, spins_today: res.spins_today } : prev);
      setResult({ total: res.total, bonus: res.bonus, prize: res.prize, label: res.label });
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
      playChime(res.total <= 0);
      const left = Math.max(Number(res.spins_left ?? 0), 0);
      showToast(`${res.total <= 0 ? `🍀 ${res.total} pontos — isso é bom!` : `⚠️ +${res.total} pontos`} · ${left} giro${left !== 1 ? "s" : ""} restante${left !== 1 ? "s" : ""} hoje`);
      loadRanking();
      loadLogs();
      loadEliminated();
      refreshMe();

    });
  };

  const today = new Date().toLocaleDateString("en-CA");
  const usedToday = me?.last_spin === today ? (me?.spins_today || 0) : 0;
  const spinsLeft = Math.max(maxSpins - usedToday, 0);
  const alreadySpun = !!me && spinsLeft <= 0;
  const spinDisabled = !me || !gameOpen || alreadySpun;
  const spinLabel = !gameOpen ? "GAME FECHADO" : alreadySpun ? "VOLTA AMANHÃ" : `GIRAR (${spinsLeft} de ${maxSpins})`;

  const fmtDate = (d: string) => d.split("-").reverse().join("/");

  return (
    <>
      <Helmet>
        <title>Alta Vibe — Roleta Invertida</title>
        <meta name="description" content="Alta Vibe: roleta invertida de agosto. Quem fizer MENOS pontos leva os prêmios." />
        <meta name="robots" content="noindex,nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>
      <style>{`
        html,body,#root{height:100%}
        .av-root{--text:#f5ecff;color:var(--text);background:radial-gradient(ellipse at top,#3a1857 0%,#1a0d2e 50%,#0f0820 100%);font-family:'Barlow',sans-serif;min-height:100vh;position:relative}
        .av-root::before{content:"";position:absolute;top:-20%;left:-10%;width:60%;height:80%;background:radial-gradient(circle,rgba(196,122,217,0.22),transparent 70%);pointer-events:none}
        .av-root::after{content:"";position:absolute;bottom:-20%;right:-10%;width:60%;height:80%;background:radial-gradient(circle,rgba(139,63,191,0.22),transparent 70%);pointer-events:none}
        .av-root *{box-sizing:border-box}
        .av-container{position:relative;z-index:1;max-width:1320px;margin:0 auto;padding:.9rem 1.1rem 1.4rem;display:flex;flex-direction:column;gap:.7rem}
        .av-header{text-align:center}
        .av-logo{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,3.8vw,2.6rem);letter-spacing:5px;line-height:1;background:linear-gradient(135deg,#d99ee6 0%,#a266d9 50%,#ffd1ec 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .av-sub{font-family:'Barlow Condensed',sans-serif;font-size:.74rem;letter-spacing:5px;text-transform:uppercase;color:#bca8d9;margin-top:2px}
        .av-inv{display:inline-block;margin-top:.4rem;font-family:'Barlow Condensed',sans-serif;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;color:#7dffb8;background:rgba(45,212,150,.1);border:1px solid rgba(45,212,150,.35);border-radius:50px;padding:.25rem 1rem}
        .av-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:.9rem;align-items:start}
        .av-col{display:flex;flex-direction:column;gap:.7rem;min-width:0}
        .av-panel{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:.8rem 1rem;backdrop-filter:blur(12px)}
        .av-ptitle{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;letter-spacing:3px;text-transform:uppercase;color:#bca8d9}
        .av-profile{display:flex;gap:.5rem;align-items:end;flex-wrap:wrap}
        .av-profile-field{flex:1;min-width:120px}
        .av-profile-field.pw{flex:0 0 95px;min-width:85px}
        .av-label{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;letter-spacing:2px;text-transform:uppercase;color:#bca8d9;margin-bottom:2px;display:block}
        .av-input{width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:.45rem .7rem;color:#f5ecff;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none}
        .av-input:focus{border-color:#c47ad9;background:rgba(255,255,255,0.12)}
        .av-save{font-family:'Barlow Condensed',sans-serif;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;background:linear-gradient(135deg,#8b3fbf,#c47ad9);color:#fff;border:none;border-radius:8px;padding:.5rem 1.1rem;cursor:pointer;font-weight:600}
        .av-save:hover{filter:brightness(1.1)}
        .av-coins-inline{display:flex;align-items:center;gap:.5rem;padding:.35rem .65rem;background:rgba(45,212,150,.08);border:1px solid rgba(45,212,150,.3);border-radius:10px}
        .av-camt{font-family:'Bebas Neue',sans-serif;font-size:1.25rem;color:#7dffb8;line-height:1;letter-spacing:1.5px}
        .av-ctag{font-family:'Barlow Condensed',sans-serif;font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;color:#bca8d9}

        .av-boxes{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
        .av-box{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:.7rem .85rem}
        .av-box-title{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;letter-spacing:2.5px;text-transform:uppercase;color:#d99ee6;margin-bottom:.4rem}
        .av-list{margin:0;padding-left:1rem;font-size:.74rem;line-height:1.35;color:#e5d8f5;display:flex;flex-direction:column;gap:.2rem}
        .av-list strong{color:#7dffb8}
        .av-odd-row{display:flex;justify-content:space-between;align-items:center;padding:.2rem .4rem;border-radius:6px;background:rgba(255,255,255,0.03);font-family:'Barlow Condensed',sans-serif;font-size:.76rem;margin-bottom:.16rem}
        .av-odd-row.neg{background:rgba(45,212,150,.1);border:1px solid rgba(45,212,150,.25)}
        .av-odd-pct{color:#ffd700;font-weight:600}

        .av-prizes{display:grid;grid-template-columns:repeat(5,1fr);gap:.5rem}
        .av-prize{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:.55rem .3rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:.2rem}
        .av-prize.p1{border-color:rgba(255,215,0,.5);background:linear-gradient(160deg,rgba(255,215,0,.14),rgba(255,215,0,.03))}
        .av-prize img{width:36px;height:36px;object-fit:contain}
        .av-prize-pos{font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:1px;color:#ffd700}
        .av-prize-name{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;letter-spacing:1px;color:#e5d8f5;text-transform:uppercase}

        .av-wheel-wrapper{display:flex;flex-direction:column;align-items:center;gap:.6rem}
        .av-wrap{position:relative;width:min(300px,42vh);aspect-ratio:1}
        .av-pointer{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-top:22px solid #ffd700;filter:drop-shadow(0 0 10px rgba(255,215,0,.8));z-index:10}
        .av-wrap canvas{width:100%;height:100%;border-radius:50%;display:block;box-shadow:0 0 50px rgba(196,122,217,0.35),0 0 100px rgba(139,63,191,0.22),inset 0 0 30px rgba(0,0,0,.5)}
        .av-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#4a2170,#150a26);border:3px solid rgba(255,215,0,.7);z-index:5;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:.72rem;letter-spacing:1px;color:#ffd700;box-shadow:0 0 18px rgba(255,215,0,.35)}
        .av-spin{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:3px;background:linear-gradient(135deg,#c47ad9,#8b3fbf);color:#fff;border:none;border-radius:50px;padding:.55rem 2.4rem;cursor:pointer;box-shadow:0 4px 24px rgba(196,122,217,0.45)}
        .av-spin:disabled{opacity:.4;cursor:not-allowed}
        .av-result{text-align:center;padding:.4rem .9rem;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);min-height:38px;display:flex;align-items:center;justify-content:center;gap:.5rem;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;letter-spacing:1.3px;width:100%}
        .av-result.flash{animation:av-pulse .7s ease}
        .av-rval{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:#ffd700;letter-spacing:1.5px}
        @keyframes av-pulse{0%{box-shadow:0 0 0 0 rgba(255,215,0,.6)}70%{box-shadow:0 0 0 18px rgba(255,215,0,0)}100%{box-shadow:0 0 0 0 rgba(255,215,0,0)}}

        .av-rlist{max-height:340px;overflow-y:auto;display:flex;flex-direction:column;gap:.3rem;padding-right:.3rem;margin-top:.5rem}
        .av-rlist::-webkit-scrollbar{width:6px}
        .av-rlist::-webkit-scrollbar-thumb{background:rgba(196,122,217,0.4);border-radius:3px}
        .av-ritem{display:grid;grid-template-columns:26px 1fr auto auto;align-items:center;gap:.55rem;background:rgba(255,255,255,0.05);border-radius:8px;padding:.4rem .65rem;border:1px solid rgba(255,255,255,0.08)}
        .av-ritem.me{border-color:rgba(255,215,0,0.4);background:rgba(255,215,0,0.06)}
        .av-rpos{font-family:'Bebas Neue',sans-serif;font-size:1rem;text-align:center;color:#bca8d9}
        .av-rpos.gold{color:#ffd700}.av-rpos.silver{color:#e0d0f0}.av-rpos.bronze{color:#d99e6c}
        .av-rname{font-family:'Barlow Condensed',sans-serif;font-size:.9rem;font-weight:600;letter-spacing:.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .av-rstreak{font-size:.65rem;color:#bca8d9;font-family:'Barlow Condensed',sans-serif}
        .av-rcoins{font-family:'Bebas Neue',sans-serif;font-size:1rem;color:#7dffb8;letter-spacing:.8px;text-align:right}
        .av-empty{text-align:center;color:#bca8d9;font-family:'Barlow Condensed',sans-serif;padding:1.2rem 0;font-size:.85rem}

        .av-logs-list{max-height:190px;overflow-y:auto;display:flex;flex-direction:column;gap:.2rem;padding-right:.3rem;margin-top:.4rem}
        .av-logs-list::-webkit-scrollbar{width:6px}
        .av-logs-list::-webkit-scrollbar-thumb{background:rgba(196,122,217,0.4);border-radius:3px}
        .av-log-row{display:grid;grid-template-columns:1fr auto auto auto;gap:.55rem;align-items:center;font-family:'Barlow Condensed',sans-serif;font-size:.74rem;padding:.25rem .5rem;border-radius:5px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06)}
        .av-log-name{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .av-log-date,.av-log-time{color:#bca8d9}
        .av-log-pts{color:#ffd700;font-weight:700}
        .av-log-pts.neg{color:#7dffb8}

        .av-toast{position:fixed;bottom:1.2rem;left:50%;transform:translateX(-50%) translateY(6px);background:#3a1857;border:1px solid #c47ad9;border-radius:50px;padding:.55rem 1.4rem;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;letter-spacing:2px;text-transform:uppercase;color:#f5ecff;opacity:0;transition:opacity .3s,transform .3s;z-index:300;pointer-events:none;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.4)}
        .av-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

        .av-terms{position:fixed;inset:0;z-index:250;background:rgba(15,8,32,.75);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:1.2rem;overflow-y:auto}
        .av-terms-card{width:100%;max-width:720px;background:linear-gradient(160deg,rgba(58,24,87,.95),rgba(26,13,46,.95));border:1px solid rgba(196,122,217,.4);border-radius:20px;padding:1.5rem;box-shadow:0 24px 70px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:.9rem;max-height:calc(100vh - 2rem);overflow-y:auto}
        .av-terms-title{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:4px;color:#ffd700;text-align:center;line-height:1}
        .av-terms-sub{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;letter-spacing:3px;text-transform:uppercase;color:#bca8d9;text-align:center}
        .av-check{display:flex;gap:.6rem;align-items:flex-start;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:.7rem .9rem;cursor:pointer}
        .av-check input{margin-top:3px;width:18px;height:18px;accent-color:#c47ad9;cursor:pointer}
        .av-check span{font-size:.85rem;color:#e5d8f5}
        .av-accept{width:100%;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:3px;background:linear-gradient(135deg,#8b3fbf,#c47ad9);color:#fff;border:none;border-radius:50px;padding:.65rem;cursor:pointer}
        .av-accept:disabled{opacity:.35;cursor:not-allowed}

        @media(max-width:900px){.av-grid{grid-template-columns:1fr}.av-boxes{grid-template-columns:1fr}.av-prizes{grid-template-columns:repeat(2,1fr)}}
      `}</style>

      <div className="av-root">
        {!termsOk && (
          <div className="av-terms">
            <div className="av-terms-card">
              <div>
                <div className="av-terms-title">ALTA VIBE · TEMPORADA INVERTIDA</div>
                <div className="av-terms-sub">Regras &amp; Termos de participação</div>
              </div>

              <div className="av-box">
                <div className="av-box-title">📋 Regras</div>
                <ol className="av-list">
                  <li><strong>Ranking invertido:</strong> quem terminar com MENOS pontos leva os prêmios.</li>
                  <li>Período: <strong>{fmtDate(period.start)} a {fmtDate(period.end)}</strong>.</li>
                  <li>Você tem <strong>{maxSpins} giros por dia</strong>, renovados após 00h.</li>
                  <li><strong>É obrigatório usar os {maxSpins} giros todos os dias</strong> — quem não girar fica marcado como <strong>(eliminado - Não girou)</strong>.</li>
                  <li>Nos <strong>3 primeiros dias</strong> a roleta não cai em <strong>-50 / -100</strong> pontos.</li>
                  <li><strong>Cadastros encerram em 06/08/2026</strong> — depois dessa data só quem já tem conta pode entrar.</li>
                  <li>Use sempre o mesmo nome e senha de 4 dígitos.</li>
                  <li>Fatias verdes dão <strong>pontos negativos</strong> — elas te ajudam.</li>
                  <li>Streaks aplicam bônus percentual sobre a pontuação do giro.</li>
                  <li>Cadastros duplicados são desclassificados.</li>
                  <li>É necessário ser ativo no <strong>xat.com/altavibe</strong>.</li>
                  <li>Fraudar a roleta = eliminação imediata.</li>
                </ol>
              </div>

              <div className="av-box">
                <div className="av-box-title">🏆 Prêmios</div>
                <div className="av-prizes">
                  {PRIZES.map((p, i) => (
                    <div key={p.pos} className={`av-prize${i === 0 ? " p1" : ""}`}>
                      <span style={{ fontSize: "1.1rem" }}>{MEDALS[i]}</span>
                      <img src={p.img} alt={`Prêmio ${p.pos}: ${p.name}`} loading="lazy" />
                      <div className="av-prize-pos">{p.pos}</div>
                      <div className="av-prize-name">{p.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <label className="av-check">
                <input type="checkbox" checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />
                <span>Li e aceito os termos e regras para participação da temporada invertida do Alta Vibe.</span>
              </label>

              <button
                className="av-accept"
                disabled={!termsChecked}
                onClick={() => { lsSet(LS_TERMS, "1"); setTermsOk(true); }}
              >
                Continuar para o login
              </button>
            </div>
          </div>
        )}

        <div className="av-container">
          <header className="av-header">
            <div className="av-logo">ALTA VIBE</div>
            <div className="av-sub">Roleta Invertida · {fmtDate(period.start)} → {fmtDate(period.end)}</div>
            <div className="av-inv">🔻 Menos pontos = melhor colocação</div>
          </header>

          <div className="av-grid">
            {/* LEFT */}
            <div className="av-col">
              <div className="av-panel">
                <div className="av-ptitle" style={{ marginBottom: ".4rem" }}>Seu perfil</div>
                <div className="av-profile">
                  <div className="av-profile-field">
                    <label className="av-label" htmlFor="av-name">Nome</label>
                    <input id="av-name" className="av-input" type="text" maxLength={20} placeholder="Ex: DjVibeKing" autoComplete="off" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                  </div>
                  <div className="av-profile-field pw">
                    <label className="av-label" htmlFor="av-pass">Senha (4 dígitos)</label>
                    <input id="av-pass" className="av-input" type="password" inputMode="numeric" maxLength={4} placeholder="••••" autoComplete="off" value={passInput} onChange={(e) => setPassInput(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                  </div>
                  <button className="av-save" onClick={saveProfile}>Entrar</button>
                  {me && (
                    <div className="av-coins-inline">
                      <span style={{ fontSize: "1rem" }}>🔻</span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className="av-camt">{(me.coins || 0).toLocaleString("pt-BR")}</span>
                        <span className="av-ctag">Pontos · {me.streak || 0}🔥</span>
                      </div>
                    </div>
                  )}
                </div>
                {signupsLocked && !me && (
                  <div style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 10, padding: ".55rem .75rem", marginTop: ".5rem" }}>
                    <div style={{ color: "#ffd700", fontFamily: "'Barlow Condensed',sans-serif", fontSize: ".78rem", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>🔒 Cadastros encerrados</div>
                    <div style={{ color: "#bca8d9", fontSize: ".72rem" }}>Quem já tem conta pode entrar normalmente.</div>
                  </div>
                )}
              </div>

              <div className="av-panel">
                <div className="av-ptitle" style={{ marginBottom: ".5rem" }}>🏆 Prêmios da temporada</div>
                <div className="av-prizes">
                  {PRIZES.map((p, i) => (
                    <div key={p.pos} className={`av-prize${i === 0 ? " p1" : ""}`}>
                      <span style={{ fontSize: "1.05rem" }}>{MEDALS[i]}</span>
                      <img src={p.img} alt={`Prêmio ${p.pos}: ${p.name}`} loading="lazy" />
                      <div className="av-prize-pos">{p.pos}</div>
                      <div className="av-prize-name">{p.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="av-boxes">
                <div className="av-box">
                  <div className="av-box-title">📋 Regras</div>
                  <ol className="av-list">
                    <li><strong>Ranking invertido:</strong> quem terminar com MENOS pontos leva os prêmios.</li>
                    <li>Período: <strong>{fmtDate(period.start)} a {fmtDate(period.end)}</strong>.</li>
                    <li>Você tem <strong>{maxSpins} giros por dia</strong>, renovados após 00h.</li>
                    <li><strong>É obrigatório usar os {maxSpins} giros todos os dias</strong> — quem não girar fica marcado como <strong>(eliminado - Não girou)</strong>.</li>
                    <li>Nos <strong>3 primeiros dias</strong> a roleta não cai em <strong>-50 / -100</strong> pontos.</li>
                    <li><strong>Cadastros encerram em 06/08/2026</strong> — depois só quem já tem conta pode entrar.</li>
                    <li>Use sempre o mesmo nome e senha de 4 dígitos.</li>
                    <li>Fatias verdes dão <strong>pontos negativos</strong> — elas te ajudam.</li>
                    <li>Streaks aplicam bônus percentual sobre a pontuação do giro.</li>
                    <li>Cadastros duplicados são desclassificados.</li>
                    <li>É necessário ser ativo no <strong>xat.com/altavibe</strong>.</li>
                    <li>Fraudar a roleta = eliminação imediata.</li>
                  </ol>

                </div>
                <div className="av-box">
                  <div className="av-box-title">🎯 Peso das fatias</div>
                  <div>
                    {segments.map((s) => (
                      <div key={s.id} className={`av-odd-row${s.points < 0 ? " neg" : ""}`}>
                        <span>{s.points < 0 ? "🍀 " : ""}{s.label} {s.points < 0 ? "pontos (bom)" : "pontos"}</span>
                        <span className="av-odd-pct">{totalWeight ? ((Number(s.weight) / totalWeight) * 100).toFixed(1) : "0"}%</span>
                      </div>
                    ))}
                    {segments.length === 0 && <div className="av-empty">Roleta sendo configurada…</div>}
                  </div>
                </div>
              </div>

              <div className="av-panel">
                <div className="av-box-title">🔥 Streak &amp; Bônus</div>
                {streaks.length === 0 ? (
                  <div className="av-empty">Sem regras de streak.</div>
                ) : (
                  streaks.map((r) => (
                    <div key={r.id} className={`av-odd-row${Number(r.bonus_pct) < 0 ? " neg" : ""}`}>
                      <span>{r.days}+ dias seguidos</span>
                      <span className="av-odd-pct">{Number(r.bonus_pct) > 0 ? "+" : ""}{Number(r.bonus_pct)}% nos pontos</span>
                    </div>
                  ))
                )}
              </div>

              <div className="av-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="av-ptitle">📡 Logs (tempo real)</div>
                  <div className="av-ctag">{logs.length} giro{logs.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="av-logs-list">
                  {logs.length === 0 ? (
                    <div className="av-empty">Sem giros ainda 🎯</div>
                  ) : logs.map((l) => {
                    const d = new Date(l.created_at);
                    return (
                      <div key={l.id} className="av-log-row">
                        <span className="av-log-name">{l.name}</span>
                        <span className="av-log-date">{d.toLocaleDateString("pt-BR")}</span>
                        <span className="av-log-time">{d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className={`av-log-pts${l.total < 0 ? " neg" : ""}`}>{l.total > 0 ? "+" : ""}{l.total} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="av-col">
              <div className="av-panel av-wheel-wrapper">
                <div className="av-wrap">
                  <div className="av-pointer" aria-hidden="true" />
                  <canvas ref={canvasRef} width={360} height={360} />
                  <div className="av-center" aria-hidden="true">VIBE</div>
                </div>
                <button className="av-spin" onClick={spinWheel} disabled={spinDisabled}>{spinLabel}</button>
                <div className={`av-result${flash ? " flash" : ""}`}>
                  {result ? (
                    <>
                      <span>{result.total <= 0 ? "🍀 Boa!" : "Caiu"}</span>
                      <span className="av-rval">{result.total > 0 ? "+" : ""}{result.total} pontos</span>
                      {result.bonus !== 0 && <span style={{ color: "#d99ee6" }}>({result.bonus > 0 ? "+" : ""}{result.bonus} streak)</span>}
                    </>
                  ) : (
                    <span style={{ color: "#bca8d9" }}>Seu resultado aparece aqui</span>
                  )}
                </div>
              </div>

              <div className="av-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="av-ptitle">🔻 Ranking invertido</div>
                  <div className="av-ctag">{ranking.length} player{ranking.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="av-rlist">
                  {ranking.length === 0 ? (
                    <div className="av-empty">Ninguém girou ainda — seja o primeiro! 🎯</div>
                  ) : (() => {
                    const isOut = (u: User) => eliminated.has(u.name.trim().toLowerCase());
                    const ordered = [...ranking.filter((u) => !isOut(u)), ...ranking.filter(isOut)];
                    let pos = 0;
                    return ordered.map((u) => {
                      const out = isOut(u);
                      if (!out) pos += 1;
                      const cls = pos === 1 && !out ? "gold" : pos === 2 && !out ? "silver" : pos === 3 && !out ? "bronze" : "";
                      return (
                        <div key={u.id} className={`av-ritem${me && u.id === me.id ? " me" : ""}`} style={out ? { opacity: .5 } : undefined}>
                          <div className={`av-rpos ${cls}`}>{out ? "—" : pos}</div>
                          <div className="av-rname">
                            {u.name}
                            {out && <span style={{ color: "#ff8a8a", fontSize: ".68rem", marginLeft: ".35rem" }}>(eliminado - Não girou)</span>}
                          </div>
                          <div className="av-rstreak">{u.streak || 0}🔥</div>
                          <div className="av-rcoins">{(u.coins || 0).toLocaleString("pt-BR")}</div>
                        </div>
                      );
                    });
                  })()}
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
