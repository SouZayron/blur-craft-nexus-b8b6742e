import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { AVATAR_COLORS } from "@/data/torneioBoard";
import { TorneioGame } from "@/components/torneio/TorneioGame";
import { Dice5, Users, Sparkles } from "lucide-react";

const TOKEN_KEY = "torneio_client_token";
const ROOM_KEY = "torneio_room";

function getToken() {
  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, t);
  }
  return t;
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function Torneios() {
  const token = useMemo(() => getToken(), []);
  const [nickname, setNickname] = useState(localStorage.getItem("torneio_nick") || "");
  const [colorIdx, setColorIdx] = useState(Number(localStorage.getItem("torneio_color") || "0"));
  const [joinCode, setJoinCode] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Tenta restaurar sessão
  useEffect(() => {
    const saved = localStorage.getItem(ROOM_KEY);
    if (!saved) return;
    try {
      const { roomId: rid, playerId: pid } = JSON.parse(saved);
      // Verifica se ainda existe
      supabase
        .from("torneio_players")
        .select("id, room_id")
        .eq("id", pid)
        .eq("client_token", token)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setRoomId(rid);
            setPlayerId(pid);
          } else {
            localStorage.removeItem(ROOM_KEY);
          }
        });
    } catch {
      localStorage.removeItem(ROOM_KEY);
    }
  }, [token]);

  async function createRoom() {
    if (!nickname.trim()) return toast.error("Escolha um nickname");
    setLoading(true);
    try {
      let code = genCode();
      // garante código único (até 5 tentativas)
      for (let i = 0; i < 5; i++) {
        const { data: existing } = await supabase
          .from("torneio_rooms")
          .select("id")
          .eq("code", code)
          .maybeSingle();
        if (!existing) break;
        code = genCode();
      }

      const { data: room, error: e1 } = await supabase
        .from("torneio_rooms")
        .insert({ code })
        .select()
        .single();
      if (e1 || !room) throw e1;

      const { data: player, error: e2 } = await supabase
        .from("torneio_players")
        .insert({
          room_id: room.id,
          nickname: nickname.trim().slice(0, 16),
          color: AVATAR_COLORS[colorIdx].value,
          turn_order: 0,
          client_token: token,
        })
        .select()
        .single();
      if (e2 || !player) throw e2;

      localStorage.setItem("torneio_nick", nickname);
      localStorage.setItem("torneio_color", String(colorIdx));
      localStorage.setItem(ROOM_KEY, JSON.stringify({ roomId: room.id, playerId: player.id }));
      setRoomId(room.id);
      setPlayerId(player.id);
      toast.success(`Sala criada! Código: ${code}`);
    } catch (err: any) {
      toast.error("Erro ao criar sala: " + (err?.message || "desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function joinRoom() {
    if (!nickname.trim()) return toast.error("Escolha um nickname");
    if (!joinCode.trim()) return toast.error("Digite o código da sala");
    setLoading(true);
    try {
      const code = joinCode.trim().toUpperCase();
      const { data: room } = await supabase
        .from("torneio_rooms")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (!room) {
        toast.error("Sala não encontrada");
        return;
      }
      if (room.status !== "lobby") {
        toast.error("Partida já começou");
        return;
      }

      const { data: count } = await supabase
        .from("torneio_players")
        .select("id", { count: "exact", head: false })
        .eq("room_id", room.id);

      const order = (count?.length || 0);
      if (order >= 20) {
        toast.error("Sala cheia (20 jogadores)");
        return;
      }

      const { data: player, error: e } = await supabase
        .from("torneio_players")
        .insert({
          room_id: room.id,
          nickname: nickname.trim().slice(0, 16),
          color: AVATAR_COLORS[colorIdx].value,
          turn_order: order,
          client_token: token,
        })
        .select()
        .single();
      if (e || !player) throw e;

      localStorage.setItem("torneio_nick", nickname);
      localStorage.setItem("torneio_color", String(colorIdx));
      localStorage.setItem(ROOM_KEY, JSON.stringify({ roomId: room.id, playerId: player.id }));
      setRoomId(room.id);
      setPlayerId(player.id);
    } catch (err: any) {
      toast.error("Erro ao entrar: " + (err?.message || "desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  function leaveGame() {
    localStorage.removeItem(ROOM_KEY);
    setRoomId(null);
    setPlayerId(null);
  }

  if (roomId && playerId) {
    return <TorneioGame roomId={roomId} playerId={playerId} token={token} onLeave={leaveGame} />;
  }

  return (
    <>
      <Helmet>
        <title>Xat World: Domínio dos Chats — Labxat</title>
        <meta name="description" content="Jogo de tabuleiro multiplayer inspirado em xat.com" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white">
        {/* Blobs decorativos */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-purple-500/30 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-fuchsia-300" />
              <span className="text-xs uppercase tracking-widest text-white/70">Beta — Fase 1</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Xat World
            </h1>
            <p className="text-lg md:text-xl text-white/80 mt-2 font-light">Domínio dos Chats</p>
            <p className="text-sm text-white/50 mt-3 max-w-md mx-auto">
              Tabuleiro multiplayer estilo Monopoly. Compre chats, cobre aluguel, viralize, sobreviva ao caos.
            </p>
          </div>

          <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/60 mb-2 block">Seu nickname</label>
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={16}
                  placeholder="Ex: ZayronPRO"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/60 mb-2 block">Cor do avatar</label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_COLORS.map((c, i) => (
                    <button
                      key={c.value}
                      onClick={() => setColorIdx(i)}
                      className={`aspect-square rounded-lg transition-all ${
                        colorIdx === i ? "ring-2 ring-white scale-110" : "ring-1 ring-white/20 hover:ring-white/50"
                      }`}
                      style={{ background: `linear-gradient(135deg, ${c.value}, ${c.value}99)` }}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={createRoom}
                  disabled={loading}
                  className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white border-0 h-12 font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  Criar nova sala
                </Button>
                <div className="flex gap-2">
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={4}
                    placeholder="CÓDIGO"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 uppercase tracking-widest text-center font-bold"
                  />
                  <Button
                    onClick={joinRoom}
                    disabled={loading}
                    variant="outline"
                    className="border-white/20 bg-white/5 hover:bg-white/15 text-white h-12"
                  >
                    <Users className="w-4 h-4" />
                    Entrar
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><Dice5 className="w-3.5 h-3.5" /> 60 casas</span>
            <span>·</span>
            <span>Até 20 jogadores</span>
            <span>·</span>
            <span>Tempo real</span>
          </div>
        </div>
      </div>
    </>
  );
}
