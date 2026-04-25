import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BOARD_TILES, BOARD_SIZE, tileToGrid, EVENT_CARDS, type EventCard } from "@/data/torneioBoard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Dice5, LogOut, Crown, Coins, Copy } from "lucide-react";

type Room = {
  id: string;
  code: string;
  status: string;
  current_turn_player_id: string | null;
  turn_number: number;
  last_dice: number | null;
};

type Player = {
  id: string;
  room_id: string;
  nickname: string;
  color: string;
  position: number;
  px: number;
  turn_order: number;
  is_eliminated: boolean;
  skip_turns: number;
  client_token: string;
};

type Property = {
  id: string;
  room_id: string;
  tile_index: number;
  owner_id: string;
  level: number;
};

type EventLog = {
  id: string;
  event_type: string;
  payload: any;
  player_id: string | null;
  created_at: string;
};

const PASS_START_BONUS = 200;

interface Props {
  roomId: string;
  playerId: string;
  token: string;
  onLeave: () => void;
}

export function TorneioGame({ roomId, playerId, token, onLeave }: Props) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [rolling, setRolling] = useState(false);
  const [diceFace, setDiceFace] = useState(1);
  const [popup, setPopup] = useState<{ title: string; body: string; tone?: "good" | "bad" | "info" } | null>(null);
  const [pendingBuy, setPendingBuy] = useState<number | null>(null);
  const processingRef = useRef(false);

  const me = players.find((p) => p.id === playerId);
  const isMyTurn = room?.current_turn_player_id === playerId;
  const currentTurnPlayer = players.find((p) => p.id === room?.current_turn_player_id);

  const refresh = useCallback(async () => {
    const [{ data: r }, { data: pls }, { data: props }, { data: lg }] = await Promise.all([
      supabase.from("torneio_rooms").select("*").eq("id", roomId).maybeSingle(),
      supabase.from("torneio_players").select("*").eq("room_id", roomId).order("turn_order"),
      supabase.from("torneio_properties").select("*").eq("room_id", roomId),
      supabase.from("torneio_events").select("*").eq("room_id", roomId).order("created_at", { ascending: false }).limit(15),
    ]);
    if (r) setRoom(r as Room);
    if (pls) setPlayers(pls as Player[]);
    if (props) setProperties(props as Property[]);
    if (lg) setLogs(lg as EventLog[]);
  }, [roomId]);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel(`torneio:${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "torneio_rooms", filter: `id=eq.${roomId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "torneio_players", filter: `room_id=eq.${roomId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "torneio_properties", filter: `room_id=eq.${roomId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "torneio_events", filter: `room_id=eq.${roomId}` }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [roomId, refresh]);

  // Sair / desconectar
  useEffect(() => {
    const handler = () => {
      navigator.sendBeacon?.(""); // best effort
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  async function startGame() {
    if (players.length < 2) return toast.error("Mínimo 2 jogadores");
    const first = players.find((p) => p.turn_order === 0);
    if (!first) return;
    await supabase
      .from("torneio_rooms")
      .update({ status: "playing", current_turn_player_id: first.id, turn_number: 1, updated_at: new Date().toISOString() })
      .eq("id", roomId);
  }

  async function nextTurn() {
    if (!room) return;
    const active = players.filter((p) => !p.is_eliminated);
    if (active.length === 0) return;

    const currIdx = active.findIndex((p) => p.id === room.current_turn_player_id);
    let next = active[(currIdx + 1) % active.length];

    // Pula jogadores com skip_turns
    let safety = 0;
    while (next.skip_turns > 0 && safety < active.length) {
      await supabase.from("torneio_players").update({ skip_turns: next.skip_turns - 1 }).eq("id", next.id);
      await supabase.from("torneio_events").insert({
        room_id: roomId,
        player_id: next.id,
        event_type: "penalty",
        payload: { text: `${next.nickname} foi mutado e perdeu o turno` },
      });
      const ni = active.findIndex((p) => p.id === next.id);
      next = active[(ni + 1) % active.length];
      safety++;
    }

    await supabase
      .from("torneio_rooms")
      .update({
        current_turn_player_id: next.id,
        turn_number: room.turn_number + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId);
  }

  async function rollDice() {
    if (!isMyTurn || rolling || !me || processingRef.current) return;
    if (pendingBuy !== null) return toast.error("Decida sobre a compra primeiro");
    processingRef.current = true;
    setRolling(true);

    // Animação do dado
    const animSteps = 10;
    for (let i = 0; i < animSteps; i++) {
      setDiceFace(Math.floor(Math.random() * 6) + 1);
      await new Promise((r) => setTimeout(r, 60));
    }
    const dice = Math.floor(Math.random() * 6) + 1;
    setDiceFace(dice);

    await supabase.from("torneio_rooms").update({ last_dice: dice }).eq("id", roomId);
    await supabase.from("torneio_events").insert({
      room_id: roomId, player_id: me.id, event_type: "dice", payload: { value: dice },
    });

    // Move passo a passo
    const oldPos = me.position;
    let newPos = oldPos;
    let bonus = 0;
    for (let s = 0; s < dice; s++) {
      newPos = (newPos + 1) % BOARD_SIZE;
      if (newPos === 0) bonus += PASS_START_BONUS;
      await supabase.from("torneio_players").update({ position: newPos }).eq("id", me.id);
      await new Promise((r) => setTimeout(r, 250));
    }

    if (bonus > 0) {
      await supabase.from("torneio_players").update({ px: me.px + bonus }).eq("id", me.id);
      await supabase.from("torneio_events").insert({
        room_id: roomId, player_id: me.id, event_type: "boost", payload: { text: `${me.nickname} passou pelo Início. +${bonus} PX` },
      });
    }

    // Resolve casa
    await resolveTile(newPos, me.px + bonus);

    setRolling(false);
    processingRef.current = false;
  }

  async function resolveTile(pos: number, currentPx: number) {
    if (!me) return;
    const tile = BOARD_TILES[pos];

    if (tile.type === "chat") {
      const owned = properties.find((p) => p.tile_index === pos);
      if (!owned) {
        // Oferta de compra
        if (currentPx >= (tile.price || 0)) {
          setPendingBuy(pos);
          setPopup({
            title: `${tile.name} disponível`,
            body: `Comprar por ${tile.price} PX?`,
            tone: "info",
          });
          return;
        } else {
          await supabase.from("torneio_events").insert({
            room_id: roomId, player_id: me.id, event_type: "info", payload: { text: `${me.nickname} caiu em ${tile.name} mas não tem PX` },
          });
        }
      } else if (owned.owner_id !== me.id) {
        const owner = players.find((p) => p.id === owned.owner_id);
        const rent = (tile.baseRent || 0) * owned.level;
        const pay = Math.min(rent, currentPx);
        await supabase.from("torneio_players").update({ px: currentPx - pay }).eq("id", me.id);
        if (owner) {
          await supabase.from("torneio_players").update({ px: owner.px + pay }).eq("id", owner.id);
        }
        await supabase.from("torneio_events").insert({
          room_id: roomId, player_id: me.id, event_type: "rent",
          payload: { text: `${me.nickname} pagou ${pay} PX de aluguel para ${owner?.nickname} em ${tile.name}` },
        });
        setPopup({ title: "Aluguel cobrado", body: `Você pagou ${pay} PX em ${tile.name}`, tone: "bad" });
        if (currentPx - pay <= 0) await checkElimination(me.id);
      }
    } else if (tile.type === "event") {
      const card = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
      await applyEventCard(card, currentPx);
    } else if (tile.type === "penalty") {
      const lose = 100;
      const finalPx = Math.max(0, currentPx - lose);
      await supabase.from("torneio_players").update({ px: finalPx, skip_turns: 1 }).eq("id", me.id);
      await supabase.from("torneio_events").insert({
        room_id: roomId, player_id: me.id, event_type: "penalty",
        payload: { text: `${me.nickname} foi banido. -${lose} PX e pula 1 turno` },
      });
      setPopup({ title: "Banido!", body: `Perdeu ${lose} PX e pula o próximo turno`, tone: "bad" });
      if (finalPx <= 0) await checkElimination(me.id);
    } else if (tile.type === "boost") {
      const gain = 150;
      await supabase.from("torneio_players").update({ px: currentPx + gain }).eq("id", me.id);
      await supabase.from("torneio_events").insert({
        room_id: roomId, player_id: me.id, event_type: "boost",
        payload: { text: `${me.nickname} pegou um Boost. +${gain} PX` },
      });
      setPopup({ title: "Boost!", body: `+${gain} PX`, tone: "good" });
    } else if (tile.type === "teleport") {
      const dest = Math.floor(Math.random() * BOARD_SIZE);
      await supabase.from("torneio_players").update({ position: dest }).eq("id", me.id);
      await supabase.from("torneio_events").insert({
        room_id: roomId, player_id: me.id, event_type: "teleport",
        payload: { text: `${me.nickname} foi teletransportado para ${BOARD_TILES[dest].name}` },
      });
      setPopup({ title: "Teleporte!", body: `Você foi para ${BOARD_TILES[dest].name}`, tone: "info" });
      // resolve a nova casa também
      setTimeout(() => resolveTile(dest, currentPx), 800);
      return;
    }

    // Próximo turno após delay
    setTimeout(() => {
      if (!pendingBuy) nextTurn();
    }, 1200);
  }

  async function applyEventCard(card: EventCard, currentPx: number) {
    if (!me) return;
    let finalPx = currentPx;
    let extra: Partial<Player> = {};

    if ("px" in card && card.px) {
      finalPx = Math.max(0, currentPx + card.px);
      extra.px = finalPx;
    }
    if ("move" in card && card.move) {
      const newPos = ((me.position + card.move) % BOARD_SIZE + BOARD_SIZE) % BOARD_SIZE;
      extra.position = newPos;
    }
    if ("skip" in card && card.skip) {
      extra.skip_turns = card.skip;
    }

    if (Object.keys(extra).length) {
      await supabase.from("torneio_players").update(extra).eq("id", me.id);
    }
    await supabase.from("torneio_events").insert({
      room_id: roomId, player_id: me.id, event_type: "event_card",
      payload: { text: `${me.nickname}: ${card.text}` },
    });
    setPopup({ title: "Carta de Evento", body: card.text, tone: ("px" in card && (card.px || 0) >= 0) ? "good" : "info" });
    if (finalPx <= 0 && "px" in card) await checkElimination(me.id);
  }

  async function checkElimination(pid: string) {
    const { data: p } = await supabase.from("torneio_players").select("*").eq("id", pid).maybeSingle();
    if (p && p.px <= 0) {
      await supabase.from("torneio_players").update({ is_eliminated: true }).eq("id", pid);
      await supabase.from("torneio_events").insert({
        room_id: roomId, player_id: pid, event_type: "eliminated",
        payload: { text: `${p.nickname} foi eliminado!` },
      });
      // Verifica vitória
      const { data: alive } = await supabase
        .from("torneio_players")
        .select("*")
        .eq("room_id", roomId)
        .eq("is_eliminated", false);
      if (alive && alive.length === 1) {
        await supabase.from("torneio_rooms").update({ status: "finished" }).eq("id", roomId);
        await supabase.from("torneio_events").insert({
          room_id: roomId, player_id: alive[0].id, event_type: "win",
          payload: { text: `${alive[0].nickname} venceu Xat World!` },
        });
      }
    }
  }

  async function buyProperty() {
    if (pendingBuy === null || !me) return;
    const tile = BOARD_TILES[pendingBuy];
    if (!tile.price || me.px < tile.price) return;
    await supabase.from("torneio_properties").insert({
      room_id: roomId, tile_index: pendingBuy, owner_id: me.id, level: 1,
    });
    await supabase.from("torneio_players").update({ px: me.px - tile.price }).eq("id", me.id);
    await supabase.from("torneio_events").insert({
      room_id: roomId, player_id: me.id, event_type: "buy",
      payload: { text: `${me.nickname} comprou ${tile.name} por ${tile.price} PX` },
    });
    setPendingBuy(null);
    setPopup(null);
    setTimeout(() => nextTurn(), 600);
  }

  function declineBuy() {
    setPendingBuy(null);
    setPopup(null);
    setTimeout(() => nextTurn(), 400);
  }

  async function leaveRoom() {
    if (me) {
      await supabase.from("torneio_players").delete().eq("id", me.id);
    }
    onLeave();
  }

  async function copyCode() {
    if (!room) return;
    await navigator.clipboard.writeText(room.code);
    toast.success("Código copiado!");
  }

  if (!room || !me) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Carregando...</div>;
  }

  // ===== LOBBY =====
  if (room.status === "lobby") {
    const isHost = me.turn_order === 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Sala de Espera</h1>
              <button onClick={copyCode} className="mt-1 inline-flex items-center gap-2 text-3xl font-extrabold tracking-widest text-fuchsia-300 hover:text-fuchsia-200">
                {room.code} <Copy className="w-5 h-5" />
              </button>
            </div>
            <Button variant="outline" onClick={leaveRoom} className="border-white/20 bg-white/5 text-white hover:bg-white/15">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>

          <Card className="p-5 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/60 mb-3">Jogadores ({players.length}/20)</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}99)` }} />
                  <div className="text-sm font-medium truncate">
                    {p.nickname}
                    {p.id === playerId && <span className="text-white/40 text-xs ml-1">(você)</span>}
                    {p.turn_order === 0 && <Crown className="inline w-3 h-3 ml-1 text-amber-300" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-6 text-center">
            {isHost ? (
              <Button
                onClick={startGame}
                disabled={players.length < 2}
                className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white border-0 h-12 px-8 font-semibold"
              >
                Iniciar partida ({players.length}/2 mínimo)
              </Button>
            ) : (
              <p className="text-white/60 text-sm">Aguardando o anfitrião iniciar...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== GAME =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white p-2 md:p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Tabuleiro */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={copyCode} className="text-sm font-bold tracking-widest text-fuchsia-300 inline-flex items-center gap-1">
                {room.code} <Copy className="w-3 h-3" />
              </button>
              <span className="text-xs text-white/50">Turno {room.turn_number}</span>
            </div>
            <Button size="sm" variant="outline" onClick={leaveRoom} className="border-white/20 bg-white/5 text-white hover:bg-white/15 h-8">
              <LogOut className="w-3 h-3" /> Sair
            </Button>
          </div>

          <Board players={players} properties={properties} myId={playerId} />

          {/* Controle do turno */}
          <Card className="mt-3 p-3 bg-white/5 backdrop-blur-xl border-white/10">
            {room.status === "finished" ? (
              <div className="text-center py-3">
                <Crown className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                <p className="font-bold text-lg">
                  {players.find((p) => !p.is_eliminated)?.nickname} venceu!
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <DiceFace value={diceFace} rolling={rolling} />
                  <div>
                    <div className="text-xs text-white/50">Vez de</div>
                    <div className="font-bold flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: currentTurnPlayer?.color }} />
                      {currentTurnPlayer?.nickname}
                      {isMyTurn && <span className="text-fuchsia-300 text-xs">(você)</span>}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={rollDice}
                  disabled={!isMyTurn || rolling || me.is_eliminated || pendingBuy !== null}
                  className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white border-0 h-11 px-6 font-semibold"
                >
                  <Dice5 className="w-4 h-4" />
                  Rolar dado
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Card className="p-3 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/60 mb-2">Jogadores</div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {players.map((p) => (
                <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                  p.id === room.current_turn_player_id ? "bg-fuchsia-500/20 border border-fuchsia-400/40" : "bg-white/5"
                } ${p.is_eliminated ? "opacity-40 line-through" : ""}`}>
                  <div className="w-6 h-6 rounded-full shrink-0" style={{ background: p.color }} />
                  <div className="flex-1 truncate font-medium">
                    {p.nickname}{p.id === playerId && <span className="text-white/40 text-xs"> (você)</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
                    <Coins className="w-3 h-3" /> {p.px}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-3 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/60 mb-2">Log</div>
            <div className="space-y-1 max-h-64 overflow-y-auto text-xs text-white/70">
              {logs.length === 0 && <div className="text-white/30 italic">Sem eventos ainda.</div>}
              {logs.map((l) => (
                <div key={l.id} className="border-b border-white/5 pb-1">
                  {l.payload?.text || l.event_type}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Popup de evento/compra */}
      {popup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <Card className={`max-w-sm w-full p-6 backdrop-blur-xl border-2 ${
            popup.tone === "good" ? "bg-emerald-500/20 border-emerald-400/50" :
            popup.tone === "bad" ? "bg-rose-500/20 border-rose-400/50" :
            "bg-fuchsia-500/20 border-fuchsia-400/50"
          } text-white`}>
            <h3 className="text-xl font-bold mb-2">{popup.title}</h3>
            <p className="text-white/90 mb-4">{popup.body}</p>
            {pendingBuy !== null ? (
              <div className="flex gap-2">
                <Button onClick={buyProperty} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0">Comprar</Button>
                <Button onClick={declineBuy} variant="outline" className="flex-1 border-white/30 bg-white/10 text-white hover:bg-white/20">Pular</Button>
              </div>
            ) : (
              <Button onClick={() => setPopup(null)} className="w-full bg-white/20 hover:bg-white/30 text-white border-0">OK</Button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ===== Sub-componentes =====

function DiceFace({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-white to-white/80 text-slate-900 flex items-center justify-center text-3xl font-black shadow-lg ${rolling ? "animate-spin" : ""}`}>
      {value}
    </div>
  );
}

function Board({ players, properties, myId }: { players: Player[]; properties: Property[]; myId: string }) {
  return (
    <div className="relative aspect-square w-full max-w-[720px] mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 overflow-hidden">
      <div className="grid grid-cols-16 grid-rows-16 gap-0.5 w-full h-full" style={{ gridTemplateColumns: "repeat(16, 1fr)", gridTemplateRows: "repeat(16, 1fr)" }}>
        {BOARD_TILES.map((tile) => {
          const { row, col } = tileToGrid(tile.index);
          const owned = properties.find((p) => p.tile_index === tile.index);
          const ownerColor = owned ? players.find((p) => p.id === owned.owner_id)?.color : null;

          const tilePlayers = players.filter((p) => p.position === tile.index && !p.is_eliminated);

          let bg = "bg-white/5";
          let label = tile.name;
          if (tile.type === "start") bg = "bg-gradient-to-br from-emerald-500 to-teal-500";
          else if (tile.type === "chat") bg = `bg-gradient-to-br ${tile.color}`;
          else if (tile.type === "event") bg = "bg-gradient-to-br from-amber-400 to-yellow-500";
          else if (tile.type === "penalty") bg = "bg-gradient-to-br from-red-600 to-rose-700";
          else if (tile.type === "boost") bg = "bg-gradient-to-br from-lime-400 to-green-500";
          else if (tile.type === "teleport") bg = "bg-gradient-to-br from-violet-500 to-purple-600";
          else if (tile.type === "neutral") bg = "bg-gradient-to-br from-slate-500 to-slate-700";

          return (
            <div
              key={tile.index}
              className={`relative ${bg} rounded-sm flex flex-col items-center justify-center p-0.5 text-[8px] md:text-[9px] font-bold text-white text-center leading-tight shadow-inner`}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
              title={`${tile.name}${tile.price ? ` — ${tile.price} PX` : ""}`}
            >
              {ownerColor && (
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: ownerColor }} />
              )}
              <div className="truncate w-full">{label}</div>
              {tile.price && <div className="text-[7px] opacity-80">{tile.price}</div>}
              {/* Tokens dos jogadores */}
              {tilePlayers.length > 0 && (
                <div className="absolute bottom-0.5 left-0.5 right-0.5 flex flex-wrap gap-0.5 justify-center">
                  {tilePlayers.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border ${p.id === myId ? "border-white" : "border-black/40"} transition-all duration-300`}
                      style={{ background: p.color }}
                    />
                  ))}
                  {tilePlayers.length > 4 && <div className="text-[7px] text-white">+{tilePlayers.length - 4}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Centro decorativo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center" style={{ width: "62.5%", height: "62.5%" }}>
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Xat World
            </div>
            <div className="text-xs md:text-sm text-white/50 mt-1">Domínio dos Chats</div>
          </div>
        </div>
      </div>
    </div>
  );
}
